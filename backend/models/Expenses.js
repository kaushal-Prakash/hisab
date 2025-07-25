import mongoose from "mongoose";

const expensesSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    paidByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    note: { type: String, default: "" },
    category: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    splitType: { type: String, enum: ['equal', 'unequal'], default: 'equal' },  
    splits: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true
});

export default mongoose.models.Expenses || mongoose.model('Expenses', expensesSchema);