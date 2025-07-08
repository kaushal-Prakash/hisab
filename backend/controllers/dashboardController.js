import Expenses from "../models/Expenses.js";
import User from "../models/User.js";

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    // Date ranges
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    
    // Get all expenses where user is involved
    const expenses = await Expenses.find({
      $or: [
        { paidByUserId: userId },
        { 'splits.userId': userId }
      ]
    }).populate('paidByUserId splits.userId', 'name email');
    
    // Calculate balances
    let balances = {};
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    let youAreOwed = 0;
    let youOwe = 0;
    const peopleYouOwe = {};
    const peopleOwingYou = {};
    
    expenses.forEach(expense => {
      const amount = expense.amount;
      const isPayer = expense.paidByUserId._id.equals(userId);
      const expenseDate = expense.createdAt;
      
      // Monthly/yearly totals
      if (expenseDate >= currentMonthStart) {
        monthlyTotal += amount;
      }
      if (expenseDate >= currentYearStart) {
        yearlyTotal += amount;
      }
      
      // Calculate balances
      if (isPayer) {
        expense.splits.forEach(split => {
          const recipientId = split.userId._id.toString();
          const owedAmount = split.amount;
          
          youAreOwed += owedAmount;
          
          if (!peopleOwingYou[recipientId]) {
            peopleOwingYou[recipientId] = {
              name: split.userId.name,
              amount: 0
            };
          }
          peopleOwingYou[recipientId].amount += owedAmount;
        });
      } else {
        const split = expense.splits.find(s => s.userId._id.equals(userId));
        if (split) {
          const owedAmount = split.amount;
          youOwe += owedAmount;
          
          const payerId = expense.paidByUserId._id.toString();
          if (!peopleYouOwe[payerId]) {
            peopleYouOwe[payerId] = {
              name: expense.paidByUserId.name,
              amount: 0
            };
          }
          peopleYouOwe[payerId].amount += owedAmount;
        }
      }
    });
    
    // Format response
    const response = {
      totalBalance: youAreOwed - youOwe,
      monthlyTotal,
      yearlyTotal,
      youAreOwed,
      youOwe,
      peopleOwingYou: Object.values(peopleOwingYou),
      peopleYouOwe: Object.values(peopleYouOwe)
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getDashboardData };