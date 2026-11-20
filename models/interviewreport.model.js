const mongoose = require('mongoose');
/**
 * -jobdescription : string 
 * -resumetext: string
 * -self-description : string 
 * 
 * -score : number
 * 
 * - technicalquestion :[{
 *  question : ""
 *  answer:""
 * intention:""
 * }]
 * 
 * - behaveroialquestion :[{
 *  question : ""
 *  answer:""
 * intention:""
 * }]
 * 
 * -skillgap :[{
 *  skill:""
 *  severity:{
 * type:string
 * enum : ["low","medium","high"]
 * }
 * }]
 * 
 * -preparation:[{
 * day:number
 * focus:string
 * tasks:string
 * }]
 */
const { Schema } = mongoose;

// 1. Technical Question Schema
const technicalQuestionSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  intention: { type: String, required: true }
});

// 2. Behavioral Question Schema
const behavioralQuestionSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  intention: { type: String, required: true }
});

// 3. Skill Gap Schema
const skillGapSchema = new Schema({
  skill: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    required: true 
  }
});

// 4. Preparation Schema
const preparationSchema = new Schema({
  day: { type: Number, required: true },
  focus: { type: String, required: true },
  tasks: { type: String, required: true }
});

// 5. Main Analysis Schema combining the sub-schemas
const interviewAnalysisSchema = new Schema({
  jobdescription: { type: String, required: true },
  resume: { type: String, required: true },
  selfdescription: { type: String, required: true }, 
  score: { type: Number, required: true },
  
  // Embedding the sub-schemas as arrays
  technicalquestion: [technicalQuestionSchema],
  behaveroialquestion: [behavioralQuestionSchema],
  skillgap: [skillGapSchema],
  preparation: [preparationSchema],
  user:{
    type : mongoose.Schema.Types.ObjectId
  },
  title:{
    type: String ,
    required:true
  }
}, {
  timestamps: true // Optional: adds createdAt and updatedAt fields
});

interviewAnalysisSchema.index({ user: 1, createdAt: -1 });

const InterviewAnalysis = mongoose.model('InterviewAnalysis', interviewAnalysisSchema);

module.exports = {
  InterviewAnalysis
};