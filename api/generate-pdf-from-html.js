import chromium from 'chrome-aws-lambda';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { html, filename = "consent-form.pdf", uuid, formID, signatureData } = req.body;

  if (!html || !uuid || !formID) {
    return res.status(400).json({ error: "Missing required data (html, uuid, formID)" });
  }

  const timestamp = new Date().toISOString();
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Inject the HTML content directly
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Optionally embed the signature if passed
    if (signatureData) {
      await page.evaluate((dataURL) => {
        const sigImg = document.querySelector("#participantSignature img");
        if (sigImg) {
          sigImg.src = dataURL;
        }
      }, signatureData);
    }

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

    // Log the event
    const logLine = `${timestamp} | UUID: ${uuid} | Form ID: ${formID} | Filename: ${filename}\n`;
    await fs.appendFile('/tmp/pdf-html-generation-log.txt', logLine);

    await browser.close();

    // Respond with success
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: "PDF generated successfully" });
  } catch (err) {
    console.error("Error generating PDF from HTML:", err);
    if (browser) await browser.close();
    res.status(500).json({ error: "Failed to generate PDF from HTML." });
  }
}
