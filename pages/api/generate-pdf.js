import chromium from 'chrome-aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { formUrl, formId } = JSON.parse(req.body);
  const uuid = uuidv4();
  const timestamp = new Date().toISOString();

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto(formUrl, {
      waitUntil: 'networkidle0',
      timeout: 0,
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '40px',
        bottom: '40px',
        left: '40px',
        right: '40px',
      },
    });

    // Log the generation event
    const logLine = `${timestamp} | UUID: ${uuid} | Form ID: ${formId} | URL: ${formUrl}\n`;
    await fs.appendFile('/tmp/pdf-generation-log.txt', logLine);

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="consent-${uuid}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
}
