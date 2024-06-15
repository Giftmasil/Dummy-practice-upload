const router = require("express").Router();
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const verifyRoles = require("../middleware/verifyRoles"); 
const ROLES_LIST = require("../config/roles_list");

// CREATE POST
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE POST
router.put("/:id", verifyRoles, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { roles } = req.user;
    if (roles && roles.includes(ROLES_LIST.Admin)) {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } else {
      // If not an admin, check if the user owns the post
      if (post.userId === req.body.userId) {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedPost);
      } else {
        res.status(401).json({ message: "You can update only your post!" });
      }
    }
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json(err);
  }
});

// DELETE POST
router.delete("/:id", verifyRoles, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { roles } = req.user;
    if (roles && roles.includes(ROLES_LIST.Admin)) {
      await Post.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      // If not an admin, check if the user owns the post
      if (post.userId === req.body.userId) {
        await Post.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Post deleted successfully" });
      } else {
        res.status(401).json({ message: "You can delete only your post!" });
      }
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json(err);
  }
});

// GET POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      });
    } else {
      posts = await Post.find();
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LIKE POST
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });

      // Create notification
      const newNotification = new Notification({
        type: "like",
        senderId: req.body.userId,
        receiverId: post.userId,
        postId: post._id,
        text: `${req.body.username} liked your post.`,
      });
      await newNotification.save();

      res.status(200).json("The post has been liked");
    } else {
      res.status(403).json("You have already liked this post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT /api/posts/:id/unlike
router.put("/:id/unlike", async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likes.includes(userId)) {
      return res.status(403).json({ message: "You have not liked this post yet" });
    }

    await post.updateOne({ $pull: { likes: userId } });

    res.status(200).json("Post has been unliked");
  } catch (err) {
    console.error("Error unliking post:", err);
    res.status(500).json({ message: "Error unliking post", error: err.message });
  }
});


// COMMENT ON POST
router.post("/:id/comment", async (req, res) => {
  const { userId, username, text } = req.body;
  const comment = { userId, username, text };

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push(comment);
    await post.save();

    // Create notification
    const newNotification = new Notification({
      type: "comment",
      senderId: userId,
      receiverId: post.userId,
      postId: post._id,
      text: `${username} commented on your post.`,
    });
    await newNotification.save();

    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
