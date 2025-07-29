// pages/api/upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const { uuid, formID, timestamp } = req.body;

    console.log(`📝 Upload received - UUID: ${uuid}, Form ID: ${formID}, Time: ${timestamp}`);

    // You can add Google Drive upload logic or DB logging here

    return res.status(200).json({ message: 'Upload logged successfully' });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
