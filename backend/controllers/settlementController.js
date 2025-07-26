import mongoose from "mongoose";
import Settlement from "../models/Settlements.js";

const addSettlement = async (req, res) => {
  try {
    const {
      groupId,
      paidByUserId,
      receivedByUserId,
      amount,
      description,
      note,
      relatedExpenseId,
    } = req.body;

    // Validate input
    if (
      !groupId ||
      !paidByUserId ||
      !receivedByUserId ||
      !amount ||
      !description
    ) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (paidByUserId === receivedByUserId) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ error: "Payer and recipient cannot be the same" });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    // Create new settlement
    const newSettlement = new Settlement({
      groupId,
      paidByUserId,
      receivedByUserId,
      amount,
      description,
      note: note || "",
      relatedExpenseId: relatedExpenseId || null,
    });

    // Save settlement
    const savedSettlement = await newSettlement.save();

    // Populate user details in the response
    const populatedSettlement = await Settlement.findById(savedSettlement._id)
      .populate("paidByUserId", "name imageUrl")
      .populate("receivedByUserId", "name imageUrl");

    res.status(201).json({
      message: "Settlement recorded successfully",
      settlement: populatedSettlement,
    });
  } catch (error) {
    console.error("Error adding settlement:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Function to get settlements for a group
const getGroupSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;

    const settlements = await Settlement.find({ groupId })
      .populate("paidByUserId", "name imageUrl")
      .populate("receivedByUserId", "name imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(settlements);
  } catch (error) {
    console.error("Error fetching settlements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { addSettlement, getGroupSettlements };
