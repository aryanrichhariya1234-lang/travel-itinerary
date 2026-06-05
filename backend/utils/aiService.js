const axios = require("axios");
const pdf = require("pdf-parse");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-2.5-flash";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const fetchBuffer = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 30000,
  });

  return Buffer.from(response.data);
};

const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF extraction failed:", error.message);
    return "";
  }
};

// ─────────────────────────────────────────────────────────────
// OCR FROM IMAGE USING GEMINI
// ─────────────────────────────────────────────────────────────

const extractTextFromImage = async (imageUrl) => {
  try {
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          inlineData: {
            mimeType: "image/png",
            data: imageBuffer.toString("base64"),
          },
        },
        {
          text: `
Extract ALL text from this travel document.

Capture:
- Passenger names
- Booking references
- PNR numbers
- Flight numbers
- Departure airports
- Arrival airports
- Dates
- Times
- Hotel names
- Addresses
- Confirmation codes
- Seat numbers
- Any visible travel information

Return ONLY the extracted text.
`,
        },
      ],
    });

    return result.text || "";
  } catch (error) {
    console.error("Gemini OCR Error:");
    console.error(error);

    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// DOCUMENT TEXT EXTRACTION
// ─────────────────────────────────────────────────────────────

const extractTextFromDocument = async (cloudinaryUrl, fileType) => {
  if (fileType === "pdf") {
    const buffer = await fetchBuffer(cloudinaryUrl);
    return extractTextFromPDF(buffer);
  }

  return extractTextFromImage(cloudinaryUrl);
};

// ─────────────────────────────────────────────────────────────
// GENERATE ITINERARY
// ─────────────────────────────────────────────────────────────

const generateItinerary = async (extractedTexts) => {
  const combinedText = extractedTexts.join("\n\n---DOCUMENT SEPARATOR---\n\n");

  const prompt = `
You are an expert travel planner.

Given travel documents such as:
- Flight tickets
- Hotel bookings
- Train reservations
- Travel confirmations

Generate a complete itinerary.

Return ONLY valid JSON.

Schema:

{
  "title": "",
  "destination": "",
  "startDate": "",
  "endDate": "",
  "totalDays": 0,
  "summary": "",
  "highlights": [],
  "flights": [],
  "hotels": [],
  "activities": [],
  "tags": []
}

Rules:
- Always infer missing details intelligently
- Include hotel check-in activities
- Include flight boarding activities
- Include sightseeing suggestions
- Cover every day of the trip
- Return JSON only

Travel document text:

${combinedText}
`;

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const content = result.text;

    if (!content) {
      throw new Error("No content returned from Gemini");
    }

    const cleaned = content
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini itinerary error:");
    console.error(error);

    throw error;
  }
};

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not configured");
}

module.exports = {
  extractTextFromDocument,
  generateItinerary,
};
