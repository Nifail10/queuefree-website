/**
 * Vercel Serverless Function — POST /api/chatbot
 *
 * Required environment variable (set in Vercel dashboard):
 *   GEMINI_API_KEY — your Google AI Studio API key
 *
 * Do NOT use dotenv. Vercel injects variables automatically.
 */

module.exports = async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || !body.message || !String(body.message).trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const userMessage = String(body.message).trim().slice(0, 500);

  const systemInstruction = `You are the QueueFree assistant. QueueFree is a real-time hospital queue intelligence platform that helps hospitals manage outpatient queues while giving patients live visibility of their token status and estimated waiting time. The company is an early-stage startup based in Tamil Nadu, India, currently preparing its first hospital pilot. Answer questions about QueueFree only. Keep every response to 1–3 sentences maximum. Do not make claims about features that do not exist. If a user is a doctor, direct them to the Doctor Survey at /doctor-survey.html. If a user is a student, direct them to the Careers page at /careers.html. For pilot or contact enquiries, direct them to /contact.html. If the question is unrelated to QueueFree, politely redirect them.`;

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemInstruction + '\n\nUser: ' + userMessage
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.4,
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[chatbot] Gemini API error:', response.status, errData);
      return res.status(500).json({ reply: 'I am unable to respond right now. Please visit our Contact page for help.' });
    }

    const data = await response.json();

    const reply =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
        ? data.candidates[0].content.parts[0].text.trim()
        : 'I am not sure about that. Please visit our Contact page.';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[chatbot] Handler error:', err.message);
    return res.status(500).json({ reply: 'I am unable to respond right now. Please visit our Contact page for help.' });
  }
};
