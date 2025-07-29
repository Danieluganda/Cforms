async function submitConsentForm() {
  const name = document.getElementById("participantName").value.trim();
  const date = document.getElementById("participantDate").value;
  const today = getFormattedDate();

  if (!name || !date) {
    alert("⚠️ Please fill in all fields before submitting.");
    return;
  }

  if (date !== today) {
    alert("⚠️ The date of signing must be today.");
    return;
  }

  if (!validateConsentCheckboxes()) {
    alert("⚠️ Please check at least TWO items under data collected.");
    return;
  }

  const signatureData = uploadedSignature || getSignatureDataURL("participantSignature");
  const uuid = generateUUID();
  const formID = generateFormID(name);

  // Extract the full HTML content (or build a dedicated HTML string if needed)
  const htmlContent = document.documentElement.outerHTML;

  try {
    const response = await fetch("/api/generate-pdf-from-html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        filename: `Consent_Form_${formID}.pdf`,
        signatureData,
        uuid,
        formID,
      }),
    });

    if (!response.ok) throw new Error("Server error");

    const result = await response.json();
    console.log("✅ PDF Generated:", result.url || result.message);

    document.getElementById("statusMessage").textContent = "✅ Form submitted and PDF generated.";
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    document.getElementById("statusMessage").textContent = "❌ Failed to generate the PDF.";
  }
}
