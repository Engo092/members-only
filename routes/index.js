const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const user_controller = require('../controllers/userController');
const message_controller = require('../controllers/messageController');

const Message = require('../models/message');
const User = require('../models/user');

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  // clears any login error messages
  if (req.session.messages) {
    req.session.messages = null;
  }
  if (req.user && req.user.membership_status == 'member') {
    // gets message and user lists in case user is a member
    const [allUsers, allMessages] = await Promise.all([
      User.find({}, "username messages").exec(),
      Message.find().sort({ "timestamp": 1 }).exec(),
    ]);
    res.render('index', { user_list: allUsers, message_list: allMessages });
  } else {
    // gets message list in case user is not a member, or is not logged in
    const allMessages = await Message.find().sort({ "timestamp": 1 }).exec();

    res.render('index', { message_list: allMessages });
  }
}));

router.get('/sign-up', user_controller.user_signup_get);

router.post('/sign-up', user_controller.user_signup_post);

router.get('/log-in', user_controller.user_login_get);

router.post('/log-in', user_controller.user_login_post);

router.get('/log-out', user_controller.user_logout_get);

router.get('/membership', user_controller.user_membership_get);

router.post('/membership', user_controller.user_membership_post);

router.get('/message', message_controller.message_create_get);

router.post('/message', message_controller.message_create_post);

router.get('/admin', user_controller.user_admin_get);

router.post('/admin', user_controller.user_admin_post);

router.post('/delete', message_controller.message_delete_post);

module.exports = router;
