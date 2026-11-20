const PDFDocument = require("pdfkit");

function generateInterviewReportPdf(report) {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margins: { top: 52, right: 52, bottom: 52, left: 52 },
      info: {
        Title: report.title ? `${report.title} Interview Report` : "Interview Preparation Report",
        Author: "Interview Preparation"
      }
    });
    const chunks = [];
    const contentWidth = document.page.width - document.page.margins.left - document.page.margins.right;

    document.on("data", (chunk) => chunks.push(chunk));
    document.on("error", reject);
    document.on("end", () => resolve(Buffer.concat(chunks)));

    const ensureSpace = (height) => {
      if (document.y + height > document.page.height - document.page.margins.bottom) {
        document.addPage();
      }
    };

    const addSection = (heading) => {
      ensureSpace(44);
      document.moveDown(0.7);
      document.font("Helvetica-Bold").fontSize(15).fillColor("#263746").text(heading, {
        width: contentWidth
      });
      document.moveDown(0.35);
      document.moveTo(document.page.margins.left, document.y)
        .lineTo(document.page.width - document.page.margins.right, document.y)
        .strokeColor("#b9c9d2")
        .stroke();
      document.moveDown(0.55);
    };

    const addParagraph = (label, value) => {
      ensureSpace(42);
      document.font("Helvetica-Bold").fontSize(10).fillColor("#394b59").text(label, {
        width: contentWidth
      });
      if (value) {
        document.moveDown(0.2);
        document.font("Helvetica").fontSize(10).fillColor("#30383d").text(String(value), {
          width: contentWidth,
          lineGap: 3
        });
      }
      document.moveDown(0.55);
    };

    document.font("Helvetica-Bold").fontSize(23).fillColor("#1d3446")
      .text(report.title || "Interview Preparation Report", { width: contentWidth });
    document.moveDown(0.25);
    document.font("Helvetica").fontSize(10).fillColor("#657985")
      .text("INTERVIEW PREPARATION REPORT", { characterSpacing: 1.2 });
    document.moveDown(0.9);

    if (typeof report.score === "number") {
      addParagraph("READINESS SCORE", `${report.score} / 100`);
    }

    addSection("Technical Questions");
    (report.technicalquestion || []).forEach((item, index) => {
      addParagraph(`Q${index + 1}. ${item.question}`, item.answer);
      addParagraph("What this assesses", item.intention);
    });

    addSection("Behavioral Questions");
    (report.behaveroialquestion || []).forEach((item, index) => {
      addParagraph(`Q${index + 1}. ${item.question}`, item.answer);
      addParagraph("What this assesses", item.intention);
    });

    addSection("Skill Gap Analysis");
    if (report.skillgap?.length) {
      report.skillgap.forEach((item) => {
        addParagraph(`${item.skill} (${item.severity} priority)`, "");
      });
    } else {
      addParagraph("No skill gaps were identified.", "");
    }

    addSection("Preparation Roadmap");
    if (report.preparation?.length) {
      report.preparation.forEach((item) => {
        addParagraph(`Day ${item.day}: ${item.focus}`, item.tasks);
      });
    } else {
      addParagraph("No preparation roadmap is available.", "");
    }

    document.end();
  });
}

module.exports = { generateInterviewReportPdf };
