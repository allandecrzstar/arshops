export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'No permitido' });

  const { text, prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + text }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        candidates: [{ content: { parts: [{ text: "Mano, Google dice: " + data.error.message }] } }] 
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      candidates: [{ content: { parts: [{ text: "Error de conexión, mano." }] } }] 
    });
  }
}
