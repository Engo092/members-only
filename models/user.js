const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    membership_status: { type: String, required: true, enum: ["not a member", "member"], default: "not a member" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    isAdmin: { type: Boolean },
});

UserSchema.virtual("full_name").get(() => {
    return this.firstname + " " + this.lastname;
});

module.exports = mongoose.model("User", UserSchema);