import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  savedSongs: [{ type: String }],
  likedSongs: [{ type: String }],
  spotifyToken: { type: String }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
