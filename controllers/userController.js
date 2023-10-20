const User = require('../models/user');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

require('dotenv').config();

exports.user_signup_get = asyncHandler(async (req, res, next) => {
    // clears any login error messages
    if (req.session.messages) {
        req.session.messages = null;
    }
    res.render('sign-up', { user: undefined });
});

exports.user_signup_post = [
    // validate and sanitize fields
    body("firstname", "first name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("lastname", "last name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("username must be specified")
        .isEmail()
        .withMessage("username must be a valid email")
        .custom(async value => {
            const user = await User.findOne({ username: value });
            if (user) {
                throw new Error('e-mail already in use');
            }
        })
        .escape(),
    body("password", "please provide a valid password")
        .trim()
        .isLength({ min: 4 })
        .escape(),
    body("passwordConfirm", "passwords don't match")
        .trim()
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .escape(),

    async (req, res, next) => {
        try {
            bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
                if (err) {
                    return next(err);
                } else {
                    const errors = validationResult(req);

                    const user = new User({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        username: req.body.username,
                        password: hashedPassword,
                    });

                    if (!errors.isEmpty()) {
                        res.render('sign-up', { user: user, errors: errors.array() });
                        return;
                    } else {
                        await user.save();
                        res.redirect('/log-in');
                    }
                }
            });
        } catch(err) {
            return next(err);
        }
    }
];

exports.user_login_get = asyncHandler(async (req, res, next) => {
    // deals with displaying login error messages
    if (req.session.messages !== undefined && req.session.messages !== null) {
        res.render('log-in', { username: undefined, mismatchErrors: req.session.messages });
        return;
    }
    res.render('log-in', { username: undefined });
});

exports.user_login_post = [
    // validate and sanitize fields
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("username must be specified")
        .isEmail()
        .withMessage("username must be a valid email")
        .escape(),
    body("password", "please provide a valid password")
        .trim()
        .isLength({ min: 4 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('log-in', { username: req.body.username, errors: errors.array() });
            return;
        }
        
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/log-in",
            failureMessage: true
        })(req, res, next);
    })
];

exports.user_logout_get = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        res.redirect('/');
    });
};

exports.user_membership_get = asyncHandler( async (req, res, next) => {
    res.render('membership');
});

exports.user_membership_post = [
    // sanitizes and validates password
    body("password", "wrong password")
        .trim()
        .isIn([process.env.SECRET_PASSWORD])
        .escape(),

    asyncHandler (async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('membership', { errors: errors.array() });
            return;
        }
        
        const user = await User.findById(req.user._id);
        const updatedUser = new User({
            _id: req.user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            password: user.password,
            membership_status: "member",
            messages: user.messages,
        });
        await User.findByIdAndUpdate(req.user._id, updatedUser, {});
        res.redirect('/');
    })
];

exports.user_admin_get = asyncHandler(async (req, res, next) => {
    res.render('admin');
});

exports.user_admin_post = [
    // sanitizes and validates password
    body("password", "wrong password")
        .trim()
        .isIn([process.env.SECRET_ADMIN_PASSWORD])
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('admin', { errors: errors.array() });
            return;
        }
        
        const user = await User.findById(req.user._id);
        const updatedUser = new User({
            _id: req.user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            password: user.password,
            membership_status: user.membership_status,
            messages: user.messages,
            isAdmin: true,
        });
        await User.findByIdAndUpdate(req.user._id, updatedUser, {});
        res.redirect('/');
    })
];