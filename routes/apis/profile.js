const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const isEmpty = require("../../validation/isEmpty");

// Load Profile Input Validation
const validateProfileInput = require("../../validation/profile");

// Load Experience Input Validation
const validateExperienceInput = require("../../validation/experience");

// Load Education Input Validation
const validateEducationInput = require("../../validation/education");

// Load User Model
const User = mongoose.model("users");

// Load Profile Model
const Profile = require("../../models/Profile");

// @route   GET /api/profile/test
// @desc    Test profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profiles works" }));

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    const { user } = req;
    Profile.findOne({ user: user.id })
      .populate("user", ["name", "email", "avatar"])
      .then((profile) => {
        if (!profile) {
          errors.noProfile = "This user does not have a profile";
          return res.status(404).json(errors);
        }
        return res.json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route   GET /api/profile/all
// @desc    Get all users profile
// @access  Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "email", "avatar"])
    .then((profiles) => {
      if (!profiles) {
        errors.noProfiles = "There are no profiles";
        return res.status(404).json(errors);
      }
      return res.json(profiles);
    })
    .catch((err) => res.status(404).json(err));
});

// @route   GET /api/profile/handle/:handle
// @desc    Get user profile by handle
// @access  Public
router.get("/", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "email", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noProfile = "This user does not have a profile";
        return res.status(404).json(errors);
      }
      return res.json(profile);
    })
    .catch((err) => res.status(404).json(err));
});

// @route   GET /api/profile/handle/:handle
// @desc    Get user profile by handle
// @access  Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "email", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noProfile = "This user does not have a profile";
        return res.status(404).json(errors);
      }
      return res.json(profile);
    })
    .catch((err) =>
      res
        .status(404)
        .json({ profile: "This user does not have a profile", err })
    );
});

// @route   GET /api/profile/user/:user_id
// @desc    Get user profile by user ID
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "email", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noProfile = "This user does not have a profile";
        return res.status(404).json(errors);
      }
      return res.json(profile);
    })
    .catch((err) =>
      res
        .status(404)
        .json({ profile: "This user does not have a profile", err })
    );
});

// @route   POST /api/profile/
// @desc    Create and Edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    const {
      handle,
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubUsername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if (handle) profileFields.handle = handle;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubUsername) profileFields.githubUsername = githubUsername;
    // Skills - Split into Array
    if (typeof skills !== undefined) profileFields.skills = skills.split(",");
    // Social - Add individual social url into model social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // If profile exists, Update with profileFields
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        //   If profile doesn't exist, Create profile

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "This handle is already in use";
            return res.status(400).json(errors);
          }

          //   Save new profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.json(profile))
            .catch((err) =>
              res.json({ profile: "Un able to save this user profile" })
            );
        });
      }
    });
  }
);

// @route   POST /api/profile/experience
// @desc    Add and Update experience to user profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    const {
      exp_id,
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const experienceFields = {};
    if (title) experienceFields.title = title;
    if (company) experienceFields.company = company;
    if (location) experienceFields.location = location;
    if (from) experienceFields.from = from;
    if (to) experienceFields.to = to;
    if (current) experienceFields.current = current;
    if (description) experienceFields.description = description;
    if (exp_id) experienceFields.exp_id = exp_id;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      // Check if the experience exist
      if (!isEmpty(exp_id)) {
        let expObject = profile.experience.reduce((acc, exp, index) => {
          if (exp.exp_id === exp_id) {
            acc = { exp, index };
          }
          return acc;
        }, {});
        // Update the existing
        profile.experience[expObject.index] = {
          ...expObject.exp,
          ...experienceFields,
        };
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => res.status(400).json({ errors: "failed", err }));
      } else {
        // If experience doesn't exists, add to experience array
        profile.experience.unshift({ ...experienceFields, exp_id: uuidv4() });
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => res.status(400).json({ errors: "Failed", err }));
      }
    });
  }
);

// @route   POST /api/profile/education
// @desc    Add and Update education to user profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    const {
      edu_id,
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const educationFields = {};
    if (school) educationFields.school = school;
    if (degree) educationFields.degree = degree;
    if (fieldOfStudy) educationFields.fieldOfStudy = fieldOfStudy;
    if (from) educationFields.from = from;
    if (to) educationFields.to = to;
    if (current) educationFields.current = current;
    if (description) educationFields.description = description;
    if (edu_id) educationFields.edu_id = edu_id;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      // Check if the education exist
      if (!isEmpty(edu_id)) {
        let eduObject = profile.education.reduce((acc, edu, index) => {
          if (edu.edu_id === edu_id) {
            acc = { edu, index };
          }
          return acc;
        }, {});
        // Update the existing
        profile.education[eduObject.index] = {
          ...eduObject.exp,
          ...educationFields,
        };
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => res.status(400).json({ errors: "failed", err }));
      } else {
        // If education doesn't exists, add to education array
        profile.education.unshift({ ...educationFields, edu_id: uuidv4() });
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => res.status(400).json({ errors: "Failed", err }));
      }
    });
  }
);

// @route   DELETE /api/profile/experience/:exp_id
// @desc    Delete experience in user profile
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      profile.experience = profile.experience.filter(
        (exp) => exp.exp_id !== req.params.exp_id
      );
      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => res.status(404).json(err));
    });
  }
);

// @route   DELETE /api/profile/education/:edu_id
// @desc    Delete experience in user profile
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      profile.education = profile.education.filter(
        (edu) => edu.edu_id !== req.params.edu_id
      );
      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => res.status(404).json(err));
    });
  }
);

// @route   DELETE /api/profile
// @desc    Delete experience in user profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id })
          .then(() => ({
            success: true,
          }))
          .catch((err) => res.status(404).json(err));
      })
      .catch((err) => res.status(404).json(err));
  }
);

module.exports = router;
