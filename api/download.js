export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url, vCodec = 'h264', vQuality = 'max', aFormat = 'mp3', isAudioOnly = false } = req.body;
  if (!url) return res.status(400).json({ error: 'URL kosong bro' });

  try {
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        vQuality: vQuality,
        vCodec: vCodec,
        aFormat: aFormat,
        isAudioOnly: isAudioOnly,
        filenamePattern: 'classic'
      })
    });

    const data = await cobaltRes.json();

    if (data.status === 'error') {
      let msg = 'Video private/region lock/hapus';
      if (data.error.code === 'InvalidUrl') msg = 'Link salah bro';
      if (data.error.code === 'VideoUnavailable') msg = 'Video private/region lock';
      return res.status(400).json({ error: msg });
    }

    if (data.status === 'redirect' || data.status === 'tunnel') {
      // INI KUNCINYA: format respon disamain sama kode JS lo
      // Biar tools.html lo yg lama langsung kebaca tanpa ubah
      return res.status(200).json({
        status: 'picker',
        picker: [{ url: data.url }]
      });
    }

    return res.status(500).json({ error: 'API Cobalt error' });

  } catch (e) {
    return res.status(500).json({ error: 'Gagal konek ke server: ' + e.message });
  }
}
