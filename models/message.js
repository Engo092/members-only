const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title: { type: String, required: true },
    timestamp: { type: Date, default: Date.now , required: true },
    text: { type: String, required: true },
});

MessageSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Message", MessageSchema);