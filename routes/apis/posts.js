const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post Model
const Post = require("../../models/Post");

// Profile Model
const User = require("../../models/User");

// Validation for Post
const validatePostInput = require("../../validation/post");

// Validation for Comment
const validateCommentInput = require("../../validation/comment");

// @route   GET /api/posts/test
// @desc    Test posts route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Posts works" }));

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then((posts) => res.json(posts))
    .catch((err) =>
      res.status(404).json({ noPostFound: "No post found", err })
    );
});

// @route   GET /api/posts/:id
// @desc    Get post by post ID
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then((posts) => res.json({ postssss: "found", posts }))
    .catch((err) =>
      res.status(404).json({ noPostFound: "No post found with this ID", err })
    );
});

// @route   POST /api/posts
// @desc    Post user's post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    const { text, name, avatar } = req.body;
    const { name: username, avatar: userAvatar } = req.user;
    const newPost = new Post({
      user: req.user.id,
      text,
      name: name || username,
      avatar: avatar || userAvatar,
    });

    newPost
      .save()
      .then((post) => res.json(post))
      .catch((err) => res.status(400).json({ errors: "failed", err }));
  }
);

// @route   DELETE /api/posts/:id
// @desc    Delete post by post ID
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      Post.findById(req.params.id)
        .then((post) => {
          // Check post owner
          if (user._id.toString() === post.user.toString()) {
            Post.findByIdAndDelete(req.params.id)
              .then((posts) => res.json(posts))
              .catch((err) =>
                res
                  .status(404)
                  .json({ noPostFound: "No post found with this ID", err })
              );
          } else {
            return res.status(401).json({
              unauthorized: "You are unauthorized to delete this post",
            });
          }
        })
        .catch((err) =>
          res
            .status(404)
            .json({ noPostFound: "No post found with this ID", err })
        );
    });
  }
);

// @route   POST /api/posts/like/:id
// @desc    Like post by post ID
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        Post.findById(req.params.id)
          .then((post) => {
            for (let elem = 0; elem < post.likes.length; elem++) {
              const like = post.likes[elem];
              if (like === req.user.id) {
                return res
                  .status(400)
                  .json({ alreadyLiked: "You already liked this post" });
              }
            }

            // Add user id to likes array
            post.likes.unshift(req.user.id);

            // Save to DB
            post
              .save()
              .then((post) => res.json(post))
              .catch((err) => res.status(400).json({ status: "fail", err }));
          })
          .catch((err) =>
            res
              .status(404)
              .json({ noPostFound: "No post found with this ID", err })
          );
      })
      .catch((err) =>
        res
          .status(401)
          .json({ unauthorized: "You are unauthorized to like this post", err })
      );
  }
);

// @route   POST /api/posts/unlike/:id
// @desc    Unlike post by post ID
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        Post.findById(req.params.id)
          .then((post) => {
            for (let elem = 0; elem < post.likes.length; elem++) {
              const likes = post.likes[elem];
              // Check if user hasn't liked the post
              if (likes === req.user.id) {
                // Remove user id from likes array
                post.likes = post.likes.filter((like) => like !== req.user.id);

                // Save to DB
                return post
                  .save()
                  .then((post) => res.json(post))
                  .catch((err) =>
                    res.status(400).json({ status: "fail", err })
                  );
              }
            }

            return res.json({
              notLiked: "You haven't liked this post",
            });
          })
          .catch((err) =>
            res
              .status(404)
              .json({ noPostFound: "No post found with this ID", err })
          );
      })
      .catch((err) =>
        res
          .status(401)
          .json({ unauthorized: "You are unauthorized to like this post", err })
      );
  }
);

// @route   POST /api/posts/comment/:id
// @desc    Comment on a post by the post ID
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    Post.findById(req.params.id)
      .then((post) => {
        const { text, name, avatar } = req.body;
        const { name: username, avatar: userAvatar } = req.user;
        const newComment = {
          user: req.user.id,
          text,
          name: name || username,
          avatar: avatar || userAvatar,
        };

        // Add new comment
        post.comments.unshift(newComment);

        // Save to DB
        post
          .save()
          .then((post) => res.json(post))
          .catch((err) => res.status(400).json({ status: "fail", err }));
      })
      .catch((err) =>
        res.status(404).json({ noPostFound: "No post found with this ID", err })
      );
  }
);

// @route   DELETE /api/posts/comment/:id/:comment_id
// @desc    Remove comment on a post by the post ID and comment ID
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        Post.findById(req.params.id)
          .then((post) => {
            for (let elem = 0; elem < post.comments.length; elem++) {
              const comment = post.comments[elem];
              // Check if user owns the comment
              if (comment.user.toString() === req.user.id) {
                // Remove comment from comments array
                post.comments = post.comments.filter(
                  (com) => com._id.toString() !== req.params.comment_id
                );

                // Save to DB
                return post
                  .save()
                  .then((post) => res.json(post))
                  .catch((err) =>
                    res.status(400).json({ status: "fail", err })
                  );
              }
            }

            return res.status(404).json({
              commentNotFound: "There is no comment found for this comment ID",
            });
          })
          .catch((err) =>
            res
              .status(404)
              .json({ noPostFound: "No post found with this ID", err })
          );
      })
      .catch((err) =>
        res
          .status(401)
          .json({ unauthorized: "You are unauthorized to like this post", err })
      );
  }
);

module.exports = router;
