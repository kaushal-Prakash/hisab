import mongoose from "mongoose";
import Expenses from "../models/Expenses.js";
import Settlement from "../models/Settlements.js";
import Group from "../models/Group.js";
import User from "../models/User.js";

const addExpense = async (req, res) => {
  try {
    const {
      amount,
      description,
      category,
      note,
      splitType,
      splits,
      groupId,
      paidByUserId,
    } = req.body;
    const userId = req.user._id;

    // ===== VALIDATION =====
    // Required fields check
    if (!amount || !description || !category || !paidByUserId || !splitType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    // Validate splitType
    if (!["equal", "unequal"].includes(splitType)) {
      return res.status(400).json({ message: "Invalid split type" });
    }

    // Group membership check if group expense
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Verify current user is group member
      if (!group.members.includes(userId)) {
        return res.status(403).json({ message: "Not a group member" });
      }

      // Verify payer is group member
      if (!group.members.includes(paidByUserId)) {
        return res
          .status(400)
          .json({ message: "Payer must be a group member" });
      }
    }

    // ===== SPLIT VALIDATION =====
    let finalSplits = [];

    if (splitType === "equal") {
      // For equal splits, we need the member list
      if (!groupId) {
        return res
          .status(400)
          .json({ message: "Group ID required for equal splits" });
      }

      const group = await Group.findById(groupId);
      const amountPerPerson = amount / group.members.length;

      finalSplits = group.members.map((member) => ({
        _id: member._id,
        amount: parseFloat(amountPerPerson.toFixed(2)),
      }));
    } else if (splitType === "unequal") {
      // Validate unequal splits
      if (!splits || !Array.isArray(splits)) {
        return res
          .status(400)
          .json({ message: "Split details required for unequal split" });
      }

      // Check all split amounts are valid
      const invalidSplits = splits.some(
        (split) => !split.userId || isNaN(split.amount) || split.amount < 0
      );

      if (invalidSplits) {
        return res.status(400).json({
          message: "Each split must have a valid userId and positive amount",
        });
      }

      // Check total matches expense amount
      const totalSplitAmount = splits.reduce(
        (sum, split) => sum + parseFloat(split.amount),
        0
      );

      if (Math.abs(totalSplitAmount - amount) > 0.01) {
        return res.status(400).json({
          message: `Split amounts (${totalSplitAmount}) must equal total amount (${amount})`,
        });
      }

      finalSplits = splits.map((split) => ({
        _id: split.userId,
        amount: parseFloat(split.amount),
      }));
    } else if (splitType === "percentage") {
      // Percentage split logic would go here
      return res
        .status(400)
        .json({ message: "Percentage split not yet implemented" });
    }

    // ===== DATA PREPARATION =====
    const expenseData = {
      paidByUserId,
      amount: parseFloat(amount),
      description,
      category,
      note: note || "",
      splitType,
      splits: finalSplits,
      createdBy: userId,
      groupId: groupId || null,
    };

    // ===== DATABASE OPERATION =====
    const newExpense = new Expenses(expenseData);
    await newExpense.save();

    // ===== RESPONSE =====
    const populatedExpense = await Expenses.findById(newExpense._id).populate(
      "paidByUserId splits._id",
      "name email imageUrl"
    );

    return res.status(201).json({
      message: "Expense added successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Validate groupId
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view these expenses" });
    }

    // Get expenses with populated payer and splits information
    const expenses = await Expense.find({ groupId })
      .populate("paidByUserId", "name email imageUrl")
      .populate("splits.userId", "name email imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPersonalExpenses = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user._id);

    const expenses = await Expenses.find({
      groupId: null,
      $or: [{ paidByUserId: userId }, { "splits._id": userId }],
    })
      .populate("paidByUserId", "name email imageUrl")
      .populate("splits._id", "name email imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching personal expenses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user._id;

    if (!expenseId) {
      return res.status(400).json({ message: "No expense id given" });
    }

    const expense = await Expenses.findById(expenseId)
      .populate("paidByUserId", "name email imageUrl")
      .populate("splits._id", "name email imageUrl")
      .populate("groupId", "name");

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check authorization - user must be payer, in splits, or group member
    let isAuthorized =
      expense.paidByUserId._id.equals(userId) ||
      expense.splits.some((s) => s.userId._id.equals(userId));

    if (expense.groupId) {
      const group = await Group.findById(expense.groupId);
      isAuthorized = isAuthorized || group.members.includes(userId);
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this expense" });
    }

    return res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    const expense = await Expenses.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Only the creator can update the expense
    if (!expense.createdBy.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this expense" });
    }

    // Prevent changing certain fields
    const allowedUpdates = [
      "amount",
      "description",
      "category",
      "note",
      "splits",
    ];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    // Update the expense
    Object.keys(updates).forEach((update) => {
      expense[update] = updates[update];
    });

    await expense.save();

    return res.status(200).json({
      message: "Expense updated successfully",
      expense: await Expense.findById(expenseId)
        .populate("paidByUserId", "name email imageUrl")
        .populate("splits.userId", "name email imageUrl"),
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user._id;

    if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Only the creator can delete the expense
    if (!expense.createdBy.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this expense" });
    }

    await Expense.findByIdAndDelete(expenseId);

    return res.status(200).json({
      message: "Expense deleted successfully",
      deletedExpenseId: expenseId,
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const calculateBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // For group balances
    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ message: "Invalid group ID" });
      }

      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(userId)) {
        return res
          .status(403)
          .json({ message: "Not authorized to view these balances" });
      }

      const expenses = await Expense.find({ groupId })
        .populate("paidByUserId", "name email")
        .populate("splits.userId", "name email");

      const balances = {};

      // Initialize balances for all members
      group.members.forEach((member) => {
        balances[member] = 0;
      });

      // Calculate balances
      expenses.forEach((expense) => {
        const payerId = expense.paidByUserId._id.toString();
        const totalAmount = expense.amount;

        // Add to payer's balance
        balances[payerId] = (balances[payerId] || 0) + totalAmount;

        // Subtract from each participant's balance
        expense.splits.forEach((split) => {
          const participantId = split.userId._id.toString();
          balances[participantId] =
            (balances[participantId] || 0) - split.amount;
        });
      });

      // Convert to simplified format
      const result = await Promise.all(
        Object.entries(balances).map(async ([memberId, balance]) => {
          const user = await User.findById(memberId, "name email imageUrl");
          return {
            userId: memberId,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            balance: parseFloat(balance.toFixed(2)),
          };
        })
      );

      return res.status(200).json(result);
    }

    // For personal balances (1:1)
    const personalExpenses = await Expense.find({
      groupId: null,
      $or: [{ paidByUserId: userId }, { "splits.userId": userId }],
    })
      .populate("paidByUserId", "name email")
      .populate("splits.userId", "name email");

    const personalBalances = {};

    personalExpenses.forEach((expense) => {
      const payerId = expense.paidByUserId._id.toString();
      const isPayer = payerId === userId.toString();
      const otherUserId = isPayer
        ? expense.splits[0].userId._id.toString()
        : payerId;

      if (!personalBalances[otherUserId]) {
        personalBalances[otherUserId] = {
          userId: otherUserId,
          name: isPayer
            ? expense.splits[0].userId.name
            : expense.paidByUserId.name,
          email: isPayer
            ? expense.splits[0].userId.email
            : expense.paidByUserId.email,
          imageUrl: isPayer
            ? expense.splits[0].userId.imageUrl
            : expense.paidByUserId.imageUrl,
          balance: 0,
        };
      }

      if (isPayer) {
        // User paid, other user owes them half
        personalBalances[otherUserId].balance += expense.amount / 2;
      } else {
        // Other user paid, user owes them half
        personalBalances[otherUserId].balance -= expense.amount / 2;
      }
    });

    // Convert to array and format balances
    const personalResult = Object.values(personalBalances).map((user) => ({
      ...user,
      balance: parseFloat(user.balance.toFixed(2)),
    }));

    return res.status(200).json(personalResult);
  } catch (error) {
    console.error("Error calculating balances:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getExpensesBetweenUsers = async (req, res) => {
  try {
    const me = new mongoose.Types.ObjectId(req.user._id);
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    if (me.equals(userId)) {
      return res.status(400).json({ message: "Cannot query yourself" });
    }

    // 1. Fetch all personal expenses where either is involved
    const expenses = await Expenses.find({
      groupId: null,
      $or: [
        // Case 1: I paid and the other user is in splits (or I split with myself)
        {
          paidByUserId: me,
          $or: [
            { "splits._id": userId },
            { "splits._id": me }, // Include self-splits
          ],
        },
        // Case 2: Other user paid and I'm in splits (or they split with themselves)
        {
          paidByUserId: userId,
          $or: [
            { "splits._id": me },
            { "splits._id": userId }, // Include self-splits
          ],
        },
        // Case 3: Either paid and both are in splits
        {
          $or: [{ paidByUserId: me }, { paidByUserId: userId }],
          "splits._id": { $all: [me, userId] },
        },
      ],
    })
      .populate("paidByUserId", "name email imageUrl")
      .populate("splits._id", "name email imageUrl")
      .sort({ createdAt: -1 });

    // 2. Filter to expenses where both are involved
    const filteredExpenses = expenses.filter((expense) => {
      const meInSplits = expense.splits.some((s) => s._id.equals(me));
      const themInSplits = expense.splits.some((s) => s._id.equals(userId));

      const meInvolved = expense.paidByUserId.equals(me) || meInSplits;
      const themInvolved = expense.paidByUserId.equals(userId) || themInSplits;

      return meInvolved && themInvolved;
    });
    // 3. Get settlements between the two users
    const settlements = await Settlement.find({
      groupId: null,
      $or: [
        {
          paidByUserId: me,
          receivedByUserId: userId,
        },
        {
          paidByUserId: userId,
          receivedByUserId: me,
        },
      ],
    })
      .populate("paidByUserId", "name email imageUrl")
      .populate("receivedByUserId", "name email imageUrl")
      .sort({ createdAt: -1 });

    // 4. Calculate balance
    let balance = 0;

    for (const e of filteredExpenses) {
      const hasSettlement = settlements.some(
        (s) => s.relatedExpenseId && s.relatedExpenseId.equals(e._id)
      );

      if (!hasSettlement) {
        if (e.paidByUserId.equals(me)) {
          const split = e.splits.find((s) => s._id.equals(userId));
          if (split) balance += split.amount;
        } else {
          const split = e.splits.find((s) => s._id.equals(me));
          if (split) balance -= split.amount;
        }
      }
    }

    for (const s of settlements) {
      if (s.paidByUserId.equals(me)) {
        balance += s.amount;
      } else {
        balance -= s.amount;
      }
    }

    // 5. Get user details
    const other = await User.findById(userId, "name email imageUrl");
    if (!other) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: me,
      expenses: filteredExpenses,
      settlements,
      otherUser: {
        id: other._id,
        name: other.name,
        email: other.email,
        imageUrl: other.imageUrl,
      },
      balance,
    });
  } catch (error) {
    console.error("Error getting expenses between users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  addExpense,
  getGroupExpenses,
  getPersonalExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  calculateBalances,
  getExpensesBetweenUsers,
};
