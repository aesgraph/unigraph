// Simple proxy for external PDFs (for development only)
// In production, implement this as a proper backend endpoint

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parameter required" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/pdf")) {
      throw new Error("URL does not point to a PDF file");
    }

    // Set appropriate headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    // Stream the PDF
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch PDF" });
  }
}
