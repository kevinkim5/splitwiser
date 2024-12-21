import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  number: { type: String, unique: true, required: true },
  name: { type: String, required: true },
});

export default models.User || model("User", UserSchema);
