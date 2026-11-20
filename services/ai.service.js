const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");

const interviewReportSchema = z.object({
  title: z.string().min(1),
  score: z.number().int().min(0).max(100),
  technicalquestion: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  behaveroialquestion: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  skillgap: z.array(z.object({
    skill: z.string(),
    severity: z.enum(["low", "medium", "high"])
  })),
  preparation: z.array(z.object({
    day: z.number().int().positive(),
    focus: z.string(),
    tasks: z.string()
  }))
});

const responseJsonSchema = z.toJSONSchema(interviewReportSchema);
delete responseJsonSchema.$schema;

async function generateInterviewReport({ jobdescription, resumetext, selfdescription }) {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: "v1beta" }
  });

  const response = await ai.models.generateContent({
    model: process.env.GOOGLE_GENAI_MODEL || "gemini-2.5-flash",
    contents: [
      "Create a practical interview preparation report using the candidate information below.",
      "Return a concise role title, a readiness score from 0 to 100, role-specific technical questions, behavioral questions, skill gaps, and a numbered preparation roadmap.",
      "For each question, include the question, what it assesses (intention), and a useful answer guide. Do not invent candidate experience; frame answer guides as advice.",
      `Job description:\n${jobdescription}`,
      `Resume text:\n${resumetext}`,
      `Candidate self-description:\n${selfdescription}`
    ].join("\n\n"),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema
    }
  });

  if (!response.text) {
    throw new Error("The AI service returned an empty interview report.");
  }

  let parsedReport;
  try {
    parsedReport = JSON.parse(response.text);
  } catch (error) {
    throw new Error("The AI service returned invalid report JSON.", { cause: error });
  }

  const validation = interviewReportSchema.safeParse(parsedReport);
  if (!validation.success) {
    throw Object.assign(new Error("The AI service returned an incomplete interview report."), {
      statusCode: 502,
      cause: validation.error
    });
  }

  return validation.data;
}

module.exports = { generateInterviewReport };
