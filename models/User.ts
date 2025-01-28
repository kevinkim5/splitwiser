import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  number: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
})

export default models.User || model('User', UserSchema)
