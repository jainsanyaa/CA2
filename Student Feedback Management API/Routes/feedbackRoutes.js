const express=require('express');
const mongoose=require('mongoose');
const router=express.Router();
const feedbackSchema = new mongoose.Schema({
  studentName:{type:String,required:[true,"studentName is required"],trim:true},
  courseName:{type: String,required:[true, "courseName is required"],trim:true},
  message:{type: String,required:[true, "message is required"],trim:true },
  rating:{
    type: Number,
    required:[true,"rating is required"],
    min:[1,"rating must be at least 1"],
    max:[5,"rating must be at most 5"],
    },
  status:{ type:String, enum:["Pending","Reviewed"],default:"Pending" },
  createdAt:{ type: Date,default: Date.now },
});
const Feedback=mongoose.model("Feedback", feedbackSchema);
router.post("/",async(req,res) => {
  try {
    const {studentName,courseName,message,rating } = req.body;

    if (!studentName || !courseName || !message || rating===undefined) {
      return res.status(400).json({
        success: false,
        message: "studentName,courseName,message and rating are required",
      });
    }
    const r=Number(rating);
    if (!Number.isFinite(r)|| r<1 || r>5){
      return res.status(400).json({ 
        success: false, 
        message: "rating must be a number between 1 and 5"});
    }
    const feedback=await Feedback.create({studentName,courseName,message,rating:r});
    res.status(201).json({success:true,message:"Feedback submitted",data:feedback});
    }catch(err){
    if(err.name==="ValidationError"){
      return res.status(400).json({
        success:false,
        message:err.message});
    }
    res.status(500).json({
        success:false,
        message:err.message});
    }
});

router.get("/",async(req,res)=>{
  try{
    let page=parseInt(req.query.page) || 1;
    let limit=parseInt(req.query.limit) || 10;
    if (page<1) page = 1;
    if (limit<1) limit = 10;
    const skip=(page - 1)*limit;
    const [feedbacks,totalRecords]=await Promise.all([
      Feedback.find().skip(skip).limit(limit),
      Feedback.countDocuments(),
    ]);
    res.status(200).json({
      success:true,
      currentPage: page,
      limit,
      totalRecords,
      totalPages:Math.ceil(totalRecords/limit),
      data:feedbacks,
    });
    }catch(err){
    res.status(500).json({
        success:false,
        message:err.message});
    }
});

router.patch('/:id',async(req,res)=>{
    try{
        const{id}=req.params.id;
        const{status}=req.body;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid Feedback ID"
            })
        }
        if (!["Pending", "Reviewed"].includes(status)) {
            return res.status(400).json({
                success:false,
                message:"status must be 'Pending' or 'Reviewed'"});
        }
        const feedback=await Feedback.findByIdAndUpdate(id,{status},{new:true});
        if(!feedback){
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }
        res.status(200).json({
            success: true,
            message:
            "Status updated",
            data:feedback});
    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message });
    }
})
module.exports = router;