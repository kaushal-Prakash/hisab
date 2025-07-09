import Expenses from "../models/Expenses.js";
import Group from "../models/Group.js";
import Settlement from "../models/Settlements.js";

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
        { 'splits._id': userId }
      ]
    }).populate('paidByUserId splits._id', 'name email');

    // Initialize Summary Variables
    let balances = {};
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    let youAreOwed = 0;
    let youOwe = 0;
    const peopleYouOwe = {};
    const peopleOwingYou = {};
    
    // Process Each Expense
    expenses.forEach(expense => {
      const amount = expense.amount;
      const isPayer = expense.paidByUserId._id.equals(userId);
      const expenseDate = expense.createdAt;
      
      // Track monthly/yearly totals
      if (expenseDate >= currentMonthStart) {
        monthlyTotal += amount;
      }
      if (expenseDate >= currentYearStart) {
        yearlyTotal += amount;
      }
      
      //  If the user paid, calculate how much others owe them
      if (isPayer) {
        expense.splits.forEach(split => {
          const recipientId = split._id.toString();
          const owedAmount = split.amount;
          
          youAreOwed += owedAmount;
          
          if (!peopleOwingYou[recipientId]) {
            peopleOwingYou[recipientId] = {
              name: split._id.name,
              amount: 0
            };
          }
          peopleOwingYou[recipientId].amount += owedAmount;
        });
      } else {
        const split = expense.splits.find(s => s._id.equals(userId));
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

// Get total spent in the current year (personal share only)
const getTotalSpent = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    // Get all expenses for current year where user is involved
    const expenses = await Expenses.find({
      $and: [
        { createdAt: { $gte: startOfYear } },
        {
          $or: [
            { paidByUserId: userId },
            { 'splits._id': userId }
          ]
        }
      ]
    });

    // Calculate total spent (personal share only)
    let totalSpent = 0;

    expenses.forEach((expense) => {
      if (expense.paidByUserId.equals(userId)) {
        // If user paid, add all splits that are for others
        expense.splits.forEach(split => {
          if (!split._id.equals(userId)) {
            totalSpent += split.amount;
          }
        });
      } else {
        // If user is in splits, add their share
        const userSplit = expense.splits.find(split => split._id.equals(userId));
        if (userSplit) {
          totalSpent += userSplit.amount;
        }
      }
    });

    res.json({ totalSpent });
  } catch (error) {
    console.error('Error fetching total spent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get monthly spending breakdown
const getMonthlySpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    // Get all expenses for current year where user is involved
    const expenses = await Expenses.find({
      $and: [
        { createdAt: { $gte: startOfYear } },
        {
          $or: [
            { paidByUserId: userId },
            { 'splits._id': userId }
          ]
        }
      ]
    });

    // Initialize monthly totals
    const monthlyTotals = Array(12).fill(0);

    // Calculate monthly spending
    expenses.forEach((expense) => {
      const month = new Date(expense.createdAt).getMonth();
      const userSplit = expense.splits.find(split => split._id.equals(userId));
      
      if (userSplit) {
        monthlyTotals[month] += userSplit.amount;
      }
    });

    // Format response
    const response = monthlyTotals.map((total, index) => ({
      month: index + 1, // 1-12 instead of 0-11
      total
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching monthly spending:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get groups for the current user with balances
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all groups where user is a member
    const groups = await Group.find({
      'members.userId': userId
    });

    // Calculate balances for each group
    const enhancedGroups = await Promise.all(
      groups.map(async (group) => {
        // Get all expenses for this group
        const expenses = await Expenses.find({
          groupId: group._id
        });

        let balance = 0;

        // Calculate balance from expenses
        expenses.forEach((expense) => {
          if (expense.paidByUserId.equals(userId)) {
            // User paid for others
            expense.splits.forEach((split) => {
              if (!split._id.equals(userId) && !split.paid) {
                balance += split.amount;
              }
            });
          } else {
            // User owes someone else
            const userSplit = expense.splits.find(split => split._id.equals(userId));
            if (userSplit && !userSplit.paid) {
              balance -= userSplit.amount;
            }
          }
        });

        // Apply settlements
        const settlements = await Settlement.find({
          groupId: group._id,
          $or: [
            { paidByUserId: userId },
            { receivedByUserId: userId }
          ]
        });

        settlements.forEach((settlement) => {
          if (settlement.paidByUserId.equals(userId)) {
            // User paid someone
            balance += settlement.amount;
          } else {
            // Someone paid the user
            balance -= settlement.amount;
          }
        });

        return {
          ...group.toObject(),
          id: group._id,
          balance
        };
      })
    );

    res.json(enhancedGroups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getDashboardData, getTotalSpent, getMonthlySpending, getUserGroups };