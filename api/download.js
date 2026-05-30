export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url, vCodec = 'h264', vQuality = 'max', aFormat = 'mp3', isAudioOnly = false } = req.body;
  if (!url) return res.status(400).json({ error: 'URL kosong bro' });

  // Fungsi helper buat format respon biar kebaca kode lama lo
  const sendSuccess = (downloadUrl) => {
    return res.status(200).json({
      status: 'picker',
      picker: [{ url: downloadUrl }]
    });
  };

  // API 1: Cobalt - paling bagus
  try {
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
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
    if (data.status === 'redirect' || data.status === 'tunnel') {
      return sendSuccess(data.url);
    }
  } catch(e) { console.log('Cobalt gagal:', e.message) }

  // API 2: yt-dlp proxy - buat YT Shorts/long
  try {
    const apiUrl = `https://api.ytjar.info/v2/download?url=${encodeURIComponent(url)}&format=mp4`;
    const r = await fetch(apiUrl);
    const data = await r.json();
    if (data.status === 'ok' && data.link) {
      return sendSuccess(data.link);
    }
  } catch(e) { console.log('ytjar gagal:', e.message) }

  // API 3: TikWM - khusus TikTok
  if (url.includes('tiktok.com')) {
    try {
      const tikwmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const data = await tikwmRes.json();
      if (data.code === 0 && data.data.play) {
        return sendSuccess(data.data.play);
      }
    } catch(e) { console.log('TikWM gagal:', e.message) }
  }

  // Kalo semua gagal
  return res.status(500).json({ error: 'Semua API gagal bro. Video private/region lock/hapus' });
}
