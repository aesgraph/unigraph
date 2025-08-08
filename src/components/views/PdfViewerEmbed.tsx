import React from "react";

interface PdfViewerEmbedProps {
  fileUrl: string; // Should be a full URL or relative to /public
}

const PdfViewerEmbed: React.FC<PdfViewerEmbedProps> = ({ fileUrl }) => {
  // For external URLs, use our proxy-enabled viewer
  // For local files, use the encoded path
  const isExternalUrl =
    fileUrl.startsWith("http://") || fileUrl.startsWith("https://");

  let viewerSrc: string;
  let encodedFileUrl: string;

  if (isExternalUrl) {
    // Use our custom viewer that allows external files
    encodedFileUrl = encodeURIComponent(fileUrl);
    viewerSrc = `/pdfjs/web/viewer-custom.html?file=${encodedFileUrl}`;
  } else {
    // Use the original viewer for local files
    const relativeFileUrl = fileUrl.startsWith("/")
      ? fileUrl.substring(1)
      : fileUrl;
    encodedFileUrl = encodeURIComponent(relativeFileUrl);
    viewerSrc = `/pdfjs/web/viewer.html?file=${encodedFileUrl}`;
  }

  console.log("PdfViewerEmbed: Loading PDF from:", fileUrl);
  console.log("PdfViewerEmbed: Is external URL:", isExternalUrl);
  console.log("PdfViewerEmbed: Encoded URL:", encodedFileUrl);
  console.log("PdfViewerEmbed: Full iframe src:", viewerSrc);

  return (
    <iframe
      src={viewerSrc}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
      title="PDF Viewer"
      onLoad={() => {
        console.log("PdfViewerEmbed: iframe loaded");
        console.log("PdfViewerEmbed: iframe src:", viewerSrc);
      }}
      onError={(e) => console.error("PdfViewerEmbed: iframe error:", e)}
      allow="fullscreen"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
    />
  );
};

export default PdfViewerEmbed;
