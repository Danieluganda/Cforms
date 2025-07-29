// /api/upload.js


import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { fileBase64, filename, uuid, formID, timestamp } = req.body;

  if (!fileBase64 || !filename || !uuid || !formID || !timestamp) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Decode base64 to buffer
    const buffer = Buffer.from(fileBase64, 'base64');

    // Save PDF to temporary file
    const filePath = path.join('/tmp', filename);
    await fs.writeFile(filePath, buffer);

    // Append to log file
    const logLine = `${timestamp} | UUID: ${uuid} | Form ID: ${formID} | File: ${filename}\n`;
    await fs.appendFile('/tmp/upload-log.txt', logLine);

    return res.status(200).json({ message: 'Upload and log successful' });
  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
