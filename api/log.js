import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uuid, formID, timestamp } = req.body;

  if (!uuid || !formID || !timestamp) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const logEntry = `${uuid},${formID},${timestamp}\n`;
  const logFilePath = path.join(process.cwd(), 'logs', 'form_submission_log.csv');

  try {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.appendFileSync(logFilePath, logEntry);
    res.status(200).json({ message: 'Log saved successfully' });
  } catch (err) {
    console.error("Error writing to log:", err);
    res.status(500).json({ error: 'Failed to write log' });
  }
}
