const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");

//CREATE POST
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE POST
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedPost);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json({message:"You can update only your post!"});
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE POST
router.delete("/:id", async (req, res) => {
  console.log('Delete request received for ID:', req.params.id);
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log('Post not found for ID:', req.params.id);
      return res.status(404).json({ message: "Post not found!" });
    }
    if (post.username === req.body.username) {
      try {
        await Post.deleteOne(post);
        console.log('Post deleted successfully for ID:', req.params.id);
        res.status(200).json("Post has been deleted...");
      } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ message: "Error deleting post", error: err.message });
      }
    } else {
      console.log('Unauthorized attempt to delete post for ID:', req.params.id);
      res.status(401).json({ message: "You can delete only your post!" });
    }
  } catch (err) {
    console.error('Error finding post:', err);
    res.status(500).json({ message: "Error finding post", error: err.message });
  }
});



//GET POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL POSTS
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
      res.status(200).json("The post has been liked");
    } else {
      res.status(403).json("You have already liked this post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// UNLIKE POST
router.put("/:id/unlike", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.body.userId)) {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been unliked");
    } else {
      res.status(403).json("You have not liked this post yet");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE COMMENT
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
    res.status(201).json(post.comments);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
});


module.exports = router;