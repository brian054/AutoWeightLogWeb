// function - verify pin, give browser a cookie if needed
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const expectedPin = (process.env.APP_LB_PIN_NUMBER ?? "").trim();
  const submittedPin = String(req.body?.pin ?? "").trim();

  //   console.log("expectedPin:", JSON.stringify(expectedPin));
  //   console.log("submittedPin:", JSON.stringify(submittedPin));
  //   console.log("equal?:", submittedPin === expectedPin);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!expectedPin) {
    return res.status(500).json({ error: "Missing APP_LB_PIN_NUMBER" });
  }

  if (submittedPin !== expectedPin) {
    return res.status(401).json({ ok: false });
  }

  const { pin } = req.body ?? {};

  if (!pin || pin !== process.env.APP_LB_PIN_NUMBER) {
    return res.status(401).json({ ok: false });
  }

  // 7 days
  const maxAge = 60 * 60 * 24 * 7;

  // This says "yo store this cookie for future requests so we dont have to keep asking for it"
  res.setHeader(
    "Set-Cookie",
    `pin_ok=1; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`,
  );

  return res.status(200).json({ ok: true });
}
