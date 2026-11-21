const mongoose = require("mongoose");
const { InterviewAnalysis } = require("../models/interviewreport.model");
const { generateInterviewReport } = require("../services/ai.service");
const { generateInterviewReportPdf } = require("../services/interview-report-pdf.service");

const reportFields = "-resume -jobdescription -selfdescription -user -__v";

async function extractResumeText(buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  try {
    const pageTexts = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    }
    return pageTexts.join("\n").trim();
  } finally {
    await document.destroy();
  }
}

async function generateInterviewReportController(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "A PDF resume is required." });
  }

  const jobdescription = req.body.jobdescription?.trim();
  const selfdescription = req.body.selfdescription?.trim();
  if (!jobdescription || !selfdescription) {
    return res.status(400).json({ message: "Job description and self description are required." });
  }

  let resumetext;
  try {
    resumetext = await extractResumeText(req.file.buffer);
  } catch (error) {
    throw Object.assign(new Error("The uploaded PDF could not be read. Please upload a valid PDF resume."), {
      statusCode: 422,
      cause: error
    });
  }

  if (!resumetext) {
    return res.status(422).json({ message: "The uploaded PDF contains no readable text." });
  }

  if (resumetext.length > 120000) {
    return res.status(413).json({ message: "The extracted resume is too long to analyze. Please upload a shorter resume." });
  }

  const reportData = await generateInterviewReport({
    jobdescription,
    resumetext,
    selfdescription
  });

  const createdReport = await InterviewAnalysis.create({
    user: req.user.id,
    resume: resumetext,
    jobdescription,
    selfdescription,
    ...reportData
  });
  const interviewReport = createdReport.toObject();
  delete interviewReport.resume;
  delete interviewReport.jobdescription;
  delete interviewReport.selfdescription;
  delete interviewReport.user;
  delete interviewReport.__v;

  res.status(201).json({
    message: "Interview report generated successfully.",
    interviewReport
  });
}

async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;
  if (!mongoose.isValidObjectId(interviewId)) {
    return res.status(400).json({ message: "Invalid interview report ID." });
  }

  const interviewReport = await InterviewAnalysis.findOne({
    _id: interviewId,
    user: req.user.id
  }).select(reportFields).lean();

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found." });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport
  });
}

async function getRecentInterviewReportsController(req, res) {
  const interviewReports = await InterviewAnalysis.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title score createdAt")
    .lean();

  res.status(200).json({
    message: "Recent interview reports fetched successfully.",
    interviewReports
  });
}

async function downloadInterviewReportPdfController(req, res) {
  const { interviewId } = req.params;
  if (!mongoose.isValidObjectId(interviewId)) {
    return res.status(400).json({ message: "Invalid interview report ID." });
  }

  const interviewReport = await InterviewAnalysis.findOne({
    _id: interviewId,
    user: req.user.id
  }).select(reportFields).lean();

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found." });
  }

  const pdfBuffer = await generateInterviewReportPdf(interviewReport);
  const filename = (interviewReport.title || "interview-report")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "interview-report";

  res.status(200)
    .type("application/pdf")
    .set({
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "private, no-store"
    })
    .send(pdfBuffer);
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getRecentInterviewReportsController,
  downloadInterviewReportPdfController
};
