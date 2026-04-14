// Check if we're actually logged in, so if the cookies pin is good then return 200, if not we have a problem
/*
    program calls GET /api/session
    checks if their is a cookie, true or false

    full flow: app loads, GET api/session, if no cookie, ok = false which means show the pin screen, 
    user enters pin, POST api/unlock, if correct server sends Set-Cookie for browser to store, thus on 
    future requests GET api/session will return true if we have the cookie
*/
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const ok = req.cookies?.pin_ok === "1";
  return res.status(200).json({ ok });
}
