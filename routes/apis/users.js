const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");

// Load Register Input Validation
const validateRegisterInput = require("../../validation/register");

// Load Login Input Validation
const validateLoginInput = require("../../validation/login");

// Load User Model
const User = require("../../models/User");

// @route   GET /api/users/test
// @desc    Test users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users works" }));

// @route   POST /api/users/register
// @desc    Register User
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) return res.status(400).json(errors);

  const { email, name, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    errors.email = "email already exist";
    if (user) return res.status(400).json(errors);

    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm",
    });

    const newUser = new User({
      name,
      email,
      avatar,
      password,
    });

    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then((user) => res.json(user))
          .catch((err) => res.json(err));
      });
    });
  });
});

// @route   POST /api/users/login
// @desc    Login User / Return JWT Token
// @access  Private
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) return res.status(400).json(errors);

  const { email, password } = req.body;

  //   Find user by email
  User.findOne({ email }).then((user) => {
    //   Check if there is user
    if (!user) {
      errors.email = "This user does not exist";
      return res.status(404).json(errors);
    }

    const { id, name, avatar } = user;

    // Check Password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) {
        errors.password = "Username and password incorrect";
        res.status(400).json(errors);
      } else {
        // Matched user details

        // Create jwt payload
        const payload = { id, name, avatar };

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({ success: true, token: `Bearer ${token}` });
          }
        );
      }
    });
  });
});

// @route   GET /api/users/current
// @desc    Get current user
// @access  Public
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { id, name, email } = req.user;
    return res.json({ id, name, email });
  }
);

module.exports = router;
