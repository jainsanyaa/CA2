const express=require('express');
const mongoose = require("mongoose");
const feedbackRoutes=require('./Routes/feedbackRoutes.js');
const app=express();
app.use(express.json());
app.use('/api/feedback',feedbackRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/feedbackdb").then(() => {
    console.log("MongoDB connected");
    app.listen(3000, () => console.log("Server running on http://localhost:3000"));
  })
  .catch((err) => console.error("DB connection error:", err))