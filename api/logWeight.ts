import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.cookies?.pin_ok !== '1') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { loggedAt, weight, bodyFat, muscleMass, notes } = req.body;

    if (!process.env.APPS_SCRIPT_WEBHOOK_URL) {
      return res.status(500).json({
        success: false,
        error: "Missing APPS_SCRIPT_WEBHOOK_URL",
      });
    }

    if (!loggedAt || !weight) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const payload = {
      loggedAt,
      weight,
      bodyFat: bodyFat ?? "",
      muscleMass: muscleMass ?? "",
      notes: notes ?? "",
    };

    const scriptResponse = await fetch(process.env.APPS_SCRIPT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const text = await scriptResponse.text();

    if (!scriptResponse.ok) {
        console.error("Apps Script error response:", text);

        return res.status(scriptResponse.status).json({
            success: false,
            error: "Apps Script request failed",
            raw: text,
        });
    }

    let parsed: any = null;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("logWeight error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to log weight",
    });
  }
}