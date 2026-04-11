import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No image provided" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `
Read this scale image and extract:
- weight
- bodyFat
- muscleMass
- waterPercent

Return ONLY JSON like:
{
  "weight": number | null,
  "bodyFat": number | null,
  "muscleMass": number | null,
  "waterPercent": number | null
}

If a value is not visible, return null.
`,
              },
              {
                type: "input_image",
                image_url: `data:${mimeType};base64,${imageBase64}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    const text = data.output?.[0]?.content?.[0]?.text;

    console.log("OpenAI raw response:", text);

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Failed to parse AI response",
        raw: text,
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Extract error:", error);

    return res.status(500).json({
      success: false,
      error: "Extraction failed",
    });
  }
}