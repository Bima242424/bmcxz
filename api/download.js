export default async function handler(req, res) {
  // Biar gak kena CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, vCodec, vQuality, aFormat, isAudioOnly } = req.body;

  try {
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'BimZTools/3.0'
      },
      body: JSON.stringify({
        url,
        vCodec,
        vQuality,
        aFormat,
        isAudioOnly,
        downloadMode: 'auto'
      })
    });

    const data = await cobaltRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
