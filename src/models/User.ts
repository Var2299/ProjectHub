import mongoose, { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager", "member"], default: "member" },
  },
  { timestamps: true }
);

export default models.User || model("User", userSchema);
