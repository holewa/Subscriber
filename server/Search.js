const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  adTitle: String,
  timeStamp: String,
});

const searchSchema = new mongoose.Schema({
  searchWord: String,
  adArray: [adSchema],
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  search: [searchSchema],
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model("Users", userSchema);
