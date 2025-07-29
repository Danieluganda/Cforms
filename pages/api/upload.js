// pages/api/generate-pdf.js pages/api/upload.js
// pages/api/upload.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { formUrl, formId } = req.body;

  try {
    // Call the internal PDF generator endpoint
    const response = await fetch(`${req.headers.origin}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formUrl, formId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate PDF: ${errorText}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    // Send back the generated PDF to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="submission.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error in /api/upload:', error);
    res.status(500).json({ error: 'Error processing upload.' });
  }
}
