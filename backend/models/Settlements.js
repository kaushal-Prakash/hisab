import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    paidByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receivedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    note: { type: String, default: "" },
    relatedExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expenses', default: null }
}, {
    timestamps: true
});