const { Router } = require("express");
const  authMiddleware  = require("../middlewares/auth.middleware");
const interviewcontroller = require("../controller/interview.controller")
const interviewroutes = Router()
const upload =require("../middlewares/file.middleware")

interviewroutes.post("/", authMiddleware.authuser, upload.single("resume"), interviewcontroller.generateInterviewReportController)
interviewroutes.get("/", authMiddleware.authuser, interviewcontroller.getRecentInterviewReportsController)
interviewroutes.get("/report/:interviewId/pdf", authMiddleware.authuser, interviewcontroller.downloadInterviewReportPdfController)
interviewroutes.get("/report/:interviewId", authMiddleware.authuser, interviewcontroller.getInterviewReportByIdController)



module.exports = interviewroutes;