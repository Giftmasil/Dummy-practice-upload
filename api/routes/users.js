const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");

//UPDATE
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, {new:true})
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can only update your own account");
    }
})


//DELETE USER TOGETHER WITH ALL THERE POSTS
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if (user) {
                await Post.deleteMany({ username: User.username })
            } else {
                res.status(404).json("user has not been found")
            }
        } catch (err) {
            res.status(500).json(err);
        }

        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("user has been deleted");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can only delete your own account");
    }
})


//GET A SINGLE USER
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
})


// Follow a user
router.post("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currentUser.updateOne({ $push: { following: req.params.id } });
          res.status(200).json("User has been followed");
        } else {
          res.status(403).json("You already follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You cannot follow yourself");
    }
  });
  
  // Unfollow a user
  router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { following: req.params.id } });
          res.status(200).json("User has been unfollowed");
        } else {
          res.status(403).json("You don't follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You cannot unfollow yourself");
    }
  });


// Get followers of a user
router.get("/:id/followers", async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json("User not found");
      }
      const followers = await Promise.all(
          user.followers.map(followerId => User.findById(followerId))
      );
      const followerList = followers.map(follower => {
          const { _id, username, profilePic } = follower;
          return { _id, username, profilePic };
      });
      res.status(200).json(followerList);
  } catch (err) {
      res.status(500).json(err);
  }
});


// Get followings of a user
router.get("/:id/followings", async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json("User not found");
      }
      const followings = await Promise.all(
          user.following.map(followingId => User.findById(followingId))
      );
      const followingList = followings.map(following => {
          const { _id, username, profilePic } = following;
          return { _id, username, profilePic };
      });
      res.status(200).json(followingList);
  } catch (err) {
      res.status(500).json(err);
  }
});


module.exports = router