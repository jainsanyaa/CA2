
const express = require("express");
const mongoose = require("mongoose");
const feedbackRoutes = require("./routes/routes");
const app = express();
app.use(express.json());
app.use("/api/feedback", feedbackRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
mongoose
  .connect("mongodb://127.0.0.1:27017/feedbackDB")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.error("DB connection error:", err.message));