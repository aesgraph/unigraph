/**
 * Custom PDF.js extension for exporting annotations and highlighting data to JSON
 */

// Wait for the PDF.js viewer to be ready
document.addEventListener("DOMContentLoaded", function () {
  // Wait a bit more to ensure PDF.js is fully loaded
  setTimeout(initializeCustomExport, 1000);
});

function initializeCustomExport() {
  // Primary export button in main toolbar
  const exportButton = document.getElementById("exportAnnotationsButton");
  if (exportButton) {
    exportButton.addEventListener("click", exportAnnotationsToJSON);
    console.log("Primary export button initialized");
  } else {
    console.warn("Primary export annotations button not found");
  }

  // Secondary export button in secondary toolbar
  const secondaryExportButton = document.getElementById(
    "secondaryExportAnnotations"
  );
  if (secondaryExportButton) {
    secondaryExportButton.addEventListener("click", exportAnnotationsToJSON);
    console.log("Secondary export button initialized");
  } else {
    console.warn("Secondary export annotations button not found");
  }

  if (!exportButton && !secondaryExportButton) {
    console.error("No export buttons found");
  }
}

async function exportAnnotationsToJSON() {
  try {
    console.log("Starting annotation export...");

    // Access the PDF.js application instance
    const app = window.PDFViewerApplication;
    if (!app || !app.pdfDocument) {
      console.error("PDF.js application or document not available");
      console.log(
        "Available window properties:",
        Object.keys(window).filter((key) => key.includes("PDF"))
      );
      return;
    }

    // Debug: log available properties
    console.log("PDF.js app properties:", Object.keys(app));
    console.log("PDF document properties:", Object.keys(app.pdfDocument));
    console.log(
      "PDF viewer properties:",
      app.pdfViewer ? Object.keys(app.pdfViewer) : "No pdfViewer"
    );
    console.log(
      "Annotation editor manager:",
      app.annotationEditorUIManager ? "Available" : "Not available"
    );

    const pdfDocument = app.pdfDocument;
    const exportData = {
      documentInfo: {
        title: app.documentInfo?.Title || "Unknown",
        author: app.documentInfo?.Author || "Unknown",
        subject: app.documentInfo?.Subject || "",
        creator: app.documentInfo?.Creator || "",
        producer: app.documentInfo?.Producer || "",
        creationDate: app.documentInfo?.CreationDate || "",
        modificationDate: app.documentInfo?.ModDate || "",
        totalPages: pdfDocument.numPages,
      },
      userCreatedAnnotations: [],
      userCreatedHighlights: [],
      userEditorData: {},
      exportTimestamp: new Date().toISOString(),
    };

    console.log(`Processing ${pdfDocument.numPages} pages...`);

    // Focus on user-created content only (annotations/highlights made with PDF.js editor tools)
    console.log("Looking for user-created annotations and highlights...");

    // Process each page to find user-created editor elements
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum} for user-created content...`);

        const pageView = app.pdfViewer.getPageView(pageNum - 1);
        if (!pageView) continue;

        // Look for annotation editor elements (user-created annotations)
        if (pageView.annotationEditorLayer) {
          const editorDiv = pageView.annotationEditorLayer.div;
          console.log(`Page ${pageNum} has annotation editor layer`);

          // Find all editor elements (highlights, freetext, ink, etc.)
          const editorElements = editorDiv.querySelectorAll(
            "[data-editor-rotation]"
          );
          console.log(
            `Found ${editorElements.length} editor elements on page ${pageNum}`
          );

          editorElements.forEach((element, index) => {
            const annotation = {
              pageNumber: pageNum,
              elementIndex: index,
              type:
                element.getAttribute("data-annotation-type") ||
                "editor-element",
              id:
                element.getAttribute("data-annotation-id") ||
                `user-annotation-${pageNum}-${index}`,
              className: element.className,
              innerHTML: element.innerHTML,
              textContent: element.textContent,
              position: {
                left: element.style.left,
                top: element.style.top,
                width: element.style.width,
                height: element.style.height,
              },
              transform: element.style.transform,
              backgroundColor: element.style.backgroundColor,
              color: element.style.color,
              borderColor: element.style.borderColor,
              rotation: element.getAttribute("data-editor-rotation"),
              rawElement: {
                tagName: element.tagName,
                attributes: Array.from(element.attributes).reduce(
                  (acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                  },
                  {}
                ),
                style: element.style.cssText,
              },
            };
            exportData.userCreatedAnnotations.push(annotation);
          });
        }

        // Look for highlight annotations specifically (user-created highlights)
        if (pageView.annotationEditorLayer) {
          const highlightElements =
            pageView.annotationEditorLayer.div.querySelectorAll(
              '.highlightEditor, [data-annotation-type="highlight"]'
            );
          console.log(
            `Found ${highlightElements.length} highlight elements on page ${pageNum}`
          );

          highlightElements.forEach((element, index) => {
            const highlight = {
              pageNumber: pageNum,
              elementIndex: index,
              id:
                element.getAttribute("data-annotation-id") ||
                `user-highlight-${pageNum}-${index}`,
              className: element.className,
              textContent: element.textContent,
              backgroundColor: element.style.backgroundColor,
              position: {
                left: element.style.left,
                top: element.style.top,
                width: element.style.width,
                height: element.style.height,
              },
              transform: element.style.transform,
              quadPoints: element.getAttribute("data-quad-points"),
              rawElement: {
                outerHTML: element.outerHTML,
                style: element.style.cssText,
              },
            };
            exportData.userCreatedHighlights.push(highlight);
          });
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
      }
    }

    // Try to get user editor data from annotation storage (this contains user-created modifications)
    try {
      if (app.pdfDocument && app.pdfDocument.annotationStorage) {
        console.log("Accessing annotation storage for user-created data...");
        console.log(
          "Available annotation storage methods:",
          Object.getOwnPropertyNames(app.pdfDocument.annotationStorage)
        );

        // Try different methods to get user annotation storage data
        if (typeof app.pdfDocument.annotationStorage.getAll === "function") {
          exportData.userEditorData =
            app.pdfDocument.annotationStorage.getAll();
          console.log("Used getAll() method for user data");
        } else if (
          typeof app.pdfDocument.annotationStorage.serializable === "object"
        ) {
          exportData.userEditorData =
            app.pdfDocument.annotationStorage.serializable;
          console.log("Used serializable property for user data");
        } else if (app.pdfDocument.annotationStorage._storage) {
          exportData.userEditorData =
            app.pdfDocument.annotationStorage._storage;
          console.log("Used _storage property for user data");
        } else if (
          typeof app.pdfDocument.annotationStorage.serialize === "function"
        ) {
          exportData.userEditorData =
            app.pdfDocument.annotationStorage.serialize();
          console.log("Used serialize() method for user data");
        } else {
          exportData.userEditorData = {};
          console.log("No user annotation storage data found");
        }

        console.log(
          "User editor data keys:",
          Object.keys(exportData.userEditorData)
        );
      } else {
        console.log("No annotation storage available");
        exportData.userEditorData = {};
      }
    } catch (annotationStorageError) {
      console.warn(
        "Could not access annotation storage:",
        annotationStorageError
      );
      exportData.userEditorData = {};
    }

    // Try to get any annotation manager data
    if (app.annotationEditorUIManager) {
      exportData.editorUIState = {
        mode: app.annotationEditorUIManager.getMode(),
        isEnabled: app.annotationEditorUIManager.isEnabled,
      };
    }

    // Log the exported data to console
    console.log("=== EXPORTED ANNOTATIONS & HIGHLIGHTS DATA ===");
    console.log(JSON.stringify(exportData, null, 2));
    console.log("=== END EXPORT DATA ===");

    // Also create a downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `user-pdf-annotations-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show summary in console
    console.log(`=== USER-CREATED CONTENT EXPORT COMPLETED ===`);
    console.log(
      `User-created annotations: ${exportData.userCreatedAnnotations.length}`
    );
    console.log(
      `User-created highlights: ${exportData.userCreatedHighlights.length}`
    );
    console.log(
      `User editor data entries: ${Object.keys(exportData.userEditorData).length}`
    );
    console.log(`File downloaded as: user-pdf-annotations-${Date.now()}.json`);

    if (
      exportData.userCreatedAnnotations.length === 0 &&
      exportData.userCreatedHighlights.length === 0 &&
      Object.keys(exportData.userEditorData).length === 0
    ) {
      console.log("⚠️  No user-created annotations or highlights found!");
      console.log(
        "💡 To create annotations: Use the highlight tool or annotation tools in the PDF.js toolbar"
      );
    }
  } catch (error) {
    console.error("Error exporting annotations:", error);
    console.error("Stack trace:", error.stack);

    // Show error in a non-modal way since alerts are blocked in sandboxed iframes
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #f44336;
      color: white;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      max-width: 300px;
      font-family: sans-serif;
      font-size: 14px;
    `;
    errorDiv.textContent = `Error exporting annotations: ${error.message}. Check console for details.`;

    document.body.appendChild(errorDiv);

    // Remove error message after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Global function to manually trigger export (for debugging)
window.exportPDFAnnotations = exportAnnotationsToJSON;

console.log("Custom PDF.js annotations export script loaded");
