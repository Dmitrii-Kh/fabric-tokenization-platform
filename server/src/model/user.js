const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    password: { type: String },
    public_key: { type: String },
    private_key: { type: String },
    token: { type: String, default: null },
});

module.exports = mongoose.model("users", userSchema);