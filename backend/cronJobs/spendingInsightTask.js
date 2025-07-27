import Expenses from "../models/Expenses.js";
import User from "../models/User.js";
import aiResponse from "../utils/gemini.js";
import sendMail from "../utils/resend.js";

const userInsights = async () => {
  try {
    // Get first and last day of current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Get users with expenses this month
    const usersWithExpenses = await User.find({
      _id: {
        $in: await Expenses.distinct("paidByUserId", {
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        }),
      },
    });

    console.log(
      `Found ${usersWithExpenses.length} users with expenses this month`
    );

    // 2. Process each user
    const results = [];

    for (const user of usersWithExpenses) {
      try {
        // a. Get user's expenses for the current month
        const expenses = await Expenses.find({
          paidByUserId: user._id,
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        });

        if (!expenses.length) {
          console.log(`No expenses found for user ${user._id}`);
          continue;
        }

        // b. Prepare expense data for the prompt
        const expenseData = {
          expenses: expenses.map((e) => ({
            amount: e.amount,
            category: e.category,
            description: e.description,
            date: e.createdAt,
          })),
          totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
          categories: expenses.reduce((cats, e) => {
            const category = e.category || "uncategorized";
            cats[category] = (cats[category] || 0) + e.amount;
            return cats;
          }, {}),
        };

        const prompt = `As a financial analyst, review this user's spending data for the past month and provide insightful observations and suggestions.
Focus on spending patterns, category breakdowns, and actionable advice for better financial management.
Use a friendly, encouraging tone. Format your response in HTML for an email.

User spending data:
${JSON.stringify(expenseData, null, 2)}

Provide your analysis in these sections:
1. Monthly Overview
2. Top Spending Categories
3. Unusual Spending Patterns (if any)
4. Saving Opportunities
5. Recommendations for Next Month`;

        const aiResponseText = await aiResponse({ task: prompt });

        // d. Track results
        results.push({
          userId: user._id,
          email: user.email,
          success: true,
          response: aiResponseText,
        });

        if (user.email === "kingkaushal1289@gmail.com") {
          try {
            await sendMail(
              user.email,
              "Your Monthly Spending Insights",
              aiResponseText
            );
            console.log(`Email sent to ${user.email}`);
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error.message);
        results.push({
          userId: user._id,
          email: user.email,
          success: false,
          error: error.message,
        });
      }
    }

    // 3. Return summary of processing
    return {
      totalUsers: usersWithExpenses.length,
      processed: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      details: results,
    };
  } catch (error) {
    console.error("Error in userInsights:", error);
    throw error;
  }
};

export default userInsights;
