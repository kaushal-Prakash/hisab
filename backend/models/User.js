import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

//create new model if not exists
// otherwise use existing model
export default mongoose.models.User || mongoose.model("User", userSchema);
