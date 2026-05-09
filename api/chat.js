export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { text, prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      candidates: [{ content: { parts: [{ text: "Mano, falta la clave en Vercel." }] } }] 
    });
  }

  try {
    // CAMBIAMOS EL MODELO A gemini-pro QUE ES EL MÁS ESTABLE PARA ESTO
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + text }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ 
        candidates: [{ content: { parts: [{ text: "Error de Google: " + data.error.message }] } }] 
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      candidates: [{ content: { parts: [{ text: "Error de conexión, mano. Intenta de nuevo." }] } }] 
    });
  }
}
