const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
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

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfjsRoot = path.resolve(path.dirname(require.resolve("pdfjs-dist/legacy/build/pdf.mjs")), "../..");
  const document = await pdfjs.getDocument({
    data: new Uint8Array(pdf),
    standardFontDataUrl: path.join(pdfjsRoot, "standard_fonts", path.sep),
    cMapUrl: path.join(pdfjsRoot, "cmaps", path.sep),
    cMapPacked: true
  }).promise;
  try {
    const pageTexts = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    }

    const text = pageTexts.join("\n");
    assert.match(text, /Software Engineer/);
    assert.match(text, /Technical Questions/);
    assert.match(text, /Cloud MLOps/);
    assert.match(text, /Project review/);
  } finally {
    await document.destroy();
  }
});
