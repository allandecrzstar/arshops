export default async function handler(req, res) {
  // 1. Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { text, prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Verificamos si la clave existe en Vercel
  if (!apiKey) {
    return res.status(500).json({ 
      candidates: [{ content: { parts: [{ text: "Mano, la clave GEMINI_API_KEY no está configurada en Vercel." }] } }] 
    });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + text }] }]
      })
    });

    const data = await response.json();

    // 3. Si Google devuelve un error (ej. clave inválida)
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
