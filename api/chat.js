export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'No permitido' });

  const { text, prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Lista de modelos a probar (del más nuevo al más compatible)
  const models = [
    "gemini-1.5-flash",
    "gemini-pro"
  ];

  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt + text }] }]
        })
      });

      const data = await response.json();

      // Si este modelo funcionó, enviamos la respuesta y cortamos el ciclo
      if (data.candidates) {
        return res.status(200).json(data);
      }
      
      // Si el error es de clave, paramos de una vez
      if (data.error && data.error.message.includes("API key")) {
        return res.status(200).json({ 
          candidates: [{ content: { parts: [{ text: "Mano, la clave API está mal copiada o es inválida." }] } }] 
        });
      }
    } catch (e) {
      continue; // Si falla este modelo, intenta con el siguiente
    }
  }

  // Si llegamos aquí es que nada funcionó
  res.status(200).json({ 
    candidates: [{ content: { parts: [{ text: "Mano, Google sigue sin reconocer los modelos. Revisa si activaste Gemini en AI Studio." }] } }] 
  });
}
