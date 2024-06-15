const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users"); // Import userRoute
const postRoute = require("./routes/posts");
const categoriesRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");
const searchRoute = require("./routes/search");
const notificationRoute = require("./routes/notifications");

// MIDDLEWARE FOR JSON
app.use(express.json());

// Example CORS setup in Express
const cors = require("cors");
app.use(cors());

dotenv.config();
app.use("/images", express.static(path.join(__dirname, "images")));

// CONNECTING TO DATABASE
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been uploaded");
});

// ROUTES
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/search", searchRoute);
app.use("/api/notifications", notificationRoute);

// DEFAULT ROUTE
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
