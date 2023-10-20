const User = require('../models/user');
const Message = require('../models/message');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.message_create_get = asyncHandler( async (req, res, next) => {
    res.render('message');
});

exports.message_create_post = [
    body('messageTitle', 'your message needs a title').trim().isLength({ min: 1 }).escape(),
    body('message', 'you must send a message').trim().isLength({ min: 1 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('message', { messageTitle: req.body.messageTitle, message: req.body.message, errors: errors.array() });
            return;
        }
        
        // creates and saves new message data 
        const message = new Message({
            title: req.body.messageTitle,
            text: req.body.message,
        });
        await message.save();
        // updates user by adding message to it
        await User.findByIdAndUpdate(req.user._id, { $addToSet: {messages: message }}).exec();
        
        res.redirect('/');
    })
];

exports.message_delete_post = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        await User.updateOne({}, {$pull: { messages: req.body.deleted }});
        await Message.findByIdAndRemove(req.body.deleted);
    }
    res.redirect('/');
})