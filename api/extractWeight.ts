import type { VercelRequest, VercelResponse } from "@vercel/node";

type ExtractedScaleData = {
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  waterPercent: number | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { imageBase64, mimeType } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Missing OPENAI_API_KEY",
      });
    }

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({
        success: false,
        error: "Missing imageBase64 or mimeType",
      });
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "developer",
            content:
              "You extract body scale readings from images. Return only the requested JSON.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: [
                  "Read this body scale image.",
                  "Return these values:",
                  "- weight: the large top-left number in pounds",
                  "- bodyFat: the top-right percent",
                  "- waterPercent: the bottom-left percent next to the wave icon",
                  "- muscleMass: the bottom-center number next to the flexed arm icon",
                  "Ignore bone mass and any other values.",
                  "If a value is not clearly visible, return null."
                ].join("\n"),
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "scale_reading",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                weight: {
                  type: ["number", "null"],
                },
                bodyFat: {
                  type: ["number", "null"],
                },
                muscleMass: {
                  type: ["number", "null"],
                },
                waterPercent: {
                  type: ["number", "null"],
                },
              },
              required: ["weight", "bodyFat", "muscleMass", "waterPercent"],
            },
          },
        },
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      console.error("OpenAI API error:", data);

      return res.status(openAiResponse.status).json({
        success: false,
        error: data?.error?.message || "OpenAI request failed",
      });
    }

    const content = data?.choices?.[0]?.message?.content;

    console.log("OpenAI structured response content:", content);

    if (!content) {
      return res.status(500).json({
        success: false,
        error: "No content returned from OpenAI",
      });
    }

    let parsed: ExtractedScaleData;

    try {
      parsed = JSON.parse(content) as ExtractedScaleData;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", content);

      return res.status(500).json({
        success: false,
        error: "Failed to parse structured response",
        raw: content,
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