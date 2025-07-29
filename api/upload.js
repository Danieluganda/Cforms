// pages/api/upload.js
import fs from 'fs/promises';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { uuid, formID, timestamp } = req.body;

  if (!uuid || !formID || !timestamp) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const logLine = `${timestamp} | UUID: ${uuid} | Form ID: ${formID}\n`;

  try {
    await fs.appendFile('/tmp/upload-log.txt', logLine);
    return res.status(200).json({ message: 'Upload logged successfully' });
  } catch (err) {
    console.error('Upload log error:', err);
    return res.status(500).json({ error: 'Failed to write log' });
  }
}
