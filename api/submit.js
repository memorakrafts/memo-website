const PHONE_RE = /^[+\d\s()-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = [
  'fullName', 'company', 'businessType', 'location', 'email', 'phone',
  'eventType', 'quantity', 'budget', 'message'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const data = req.body || {};

  // Honeypot: real visitors never fill this hidden field.
  if (String(data.website || '').trim()) {
    return res.status(200).json({ success: true });
  }

  // trim() removes any space or newline accidentally pasted into Vercel.
  const scriptUrl = (process.env.GOOGLE_APPS_SCRIPT_URL || '').trim();
  if (!scriptUrl) {
    console.error('GOOGLE_APPS_SCRIPT_URL is not set in Vercel environment variables.');
    return res.status(500).json({ success: false, message: 'Enquiry service is not configured yet.' });
  }

  const clean = {};
  for (const key of FIELDS) {
    const limit = key === 'message' ? 2000 : 250;
    clean[key] = String(data[key] ?? '').trim().slice(0, limit);
  }

  if (!clean.fullName) {
    return res.status(400).json({ success: false, message: 'Please enter your full name.' });
  }
  if (!PHONE_RE.test(clean.phone)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
  }
  if (clean.email && !EMAIL_RE.test(clean.email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  try {
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams(clean).toString(),
      redirect: 'follow',
      signal: AbortSignal.timeout(8000)
    });

    const body = await upstream.text();
    let result = null;
    try { result = JSON.parse(body); } catch { result = null; }

    if (!upstream.ok || !result || result.success !== true) {
      console.error('Apps Script error:', upstream.status, body.slice(0, 400));
      return res.status(502).json({ success: false, message: 'Your enquiry could not be saved. Please try again later.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Enquiry submission error:', err);
    return res.status(502).json({ success: false, message: 'Unable to reach the enquiry service.' });
  }
}
