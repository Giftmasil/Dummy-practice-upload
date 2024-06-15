const router = require("express").Router();
const Notification = require("../models/Notification");

router.post("/", async (req, res) => {
  let newNotification = new Notification(req.body);
  try {
    const savedNotification = await newNotification.save();
    res.status(200).json(savedNotification);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ message: "Error creating notification", error: err.message });
  }
});

// GET NOTIFICATIONS FOR A USER
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiverId: req.params.userId,
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

// MARK NOTIFICATIONS AS READ
router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json("Notification marked as read");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
