import mongoose from "mongoose";

//settlements : Payments made specifically to reduce debt between users.

const settlementSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [false, "Group ID is optional"],
      index: true, // Added index for better query performance
    },
    paidByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Payer user ID is required"],
      index: true,
    },
    receivedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient user ID is required"],
      index: true,
      validate: {
        validator: function (value) {
          // Ensure payer and recipient are different
          return (
            !value.equals(this.paidByUserId)
          );
        },
        message: "Payer and recipient cannot be the same user",
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
      default: "",
    },
    relatedExpenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expenses",
      default: null,
      required: [false, "Related expense ID is optional"],
    }
  },
  {
    timestamps: true,
  }
);

// Add compound index for frequently queried fields
settlementSchema.index({ groupId: 1, createdAt: -1 });

const Settlement =
  mongoose.model("Settlement", settlementSchema) || mongoose.models.Settlement;

export default Settlement;
