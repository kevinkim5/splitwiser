import  { Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  sharedWith: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

const GroupSchema = new Schema(
  {
    name: { type: String, required: true },
    members: [{ type: Object, required: true }],
    expenses: [ExpenseSchema],
  },
  { collection: "groups" }
);

export default models.Groups || model("Groups", GroupSchema);
