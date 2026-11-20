const assert = require("node:assert/strict");
const { test } = require("node:test");
const { PDFParse } = require("pdf-parse");
const { generateInterviewReportPdf } = require("../services/interview-report-pdf.service");

test("generates a readable interview report PDF", async () => {
  const pdf = await generateInterviewReportPdf({
    title: "Software Engineer",
    score: 83,
    technicalquestion: [{
      question: "Explain your project architecture.",
      answer: "Describe the main components and their responsibilities.",
      intention: "Assess technical communication."
    }],
    behaveroialquestion: [{
      question: "Tell me about a challenge you faced.",
      answer: "Use the STAR method.",
      intention: "Assess problem solving."
    }],
    skillgap: [{ skill: "Cloud MLOps", severity: "medium" }],
    preparation: [{ day: 1, focus: "Project review", tasks: "Review your design decisions." }]
  });

  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");

  const parser = new PDFParse({ data: pdf });
  try {
    const result = await parser.getText();
    assert.match(result.text, /Software Engineer/);
    assert.match(result.text, /Technical Questions/);
    assert.match(result.text, /Cloud MLOps/);
    assert.match(result.text, /Project review/);
  } finally {
    await parser.destroy();
  }
});
