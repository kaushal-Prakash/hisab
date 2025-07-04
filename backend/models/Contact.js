import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        nickname: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Contact ||
  mongoose.model("Contact", contactSchema);
