export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { text, prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + text }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Mensaje serio sobre la restricción de región
      return res.status(200).json({ 
        candidates: [{ content: { parts: [{ text: "Servicio no disponible: Google mantiene restricciones de acceso para esta API en tu región actual o la clave no tiene permisos suficientes." }] } }] 
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      candidates: [{ content: { parts: [{ text: "Error de red: No se pudo establecer conexión con el servidor de inteligencia artificial." }] } }] 
    });
  }
}
