/**
 * Custom PDF.js extension for saving PDFs to Supabase
 */

// Global variable to store document context passed from parent frame
let documentContext = {
  documentId: null,
  title: "PDF Document",
};

// Global variable to track save state
let isSaving = false;
let saveTimeout = null;
let isInitialized = false;
let saveCallCount = 0;

// Listen for document context messages from parent frame
window.addEventListener("message", function (event) {
  if (event.data.action === "setDocumentContext") {
    documentContext = {
      documentId: event.data.documentId,
      title: event.data.title || "PDF Document",
    };
    console.log("Received document context:", documentContext);
  }
});

// Wait for the PDF.js viewer to be ready
document.addEventListener("DOMContentLoaded", function () {
  // Wait a bit more to ensure PDF.js is fully loaded
  setTimeout(initializePdfSave, 1000);
});

function initializePdfSave() {
  // Prevent multiple initializations
  if (isInitialized) {
    console.log("PDF save already initialized, skipping");
    return;
  }

  console.log("Initializing PDF save functionality...");

  // Primary save button in main toolbar
  const saveButton = document.getElementById("savePdfToSupabaseButton");
  if (saveButton) {
    // Remove any existing listeners first
    saveButton.removeEventListener("click", savePdfToSupabase);
    saveButton.addEventListener("click", savePdfToSupabase);
    console.log("Primary PDF save button initialized");
  } else {
    console.warn("Primary PDF save button not found");
  }

  // Secondary save button in secondary toolbar
  const secondarySaveButton = document.getElementById(
    "secondarySavePdfToSupabase"
  );
  if (secondarySaveButton) {
    // Remove any existing listeners first
    secondarySaveButton.removeEventListener("click", savePdfToSupabase);
    secondarySaveButton.addEventListener("click", savePdfToSupabase);
    console.log("Secondary PDF save button initialized");
  } else {
    console.warn("Secondary PDF save button not found");
  }

  if (!saveButton && !secondarySaveButton) {
    console.error("No PDF save buttons found");
  } else {
    isInitialized = true;
    console.log("PDF save initialization completed");
  }
}

async function savePdfToSupabase() {
  saveCallCount++;
  console.log(`[iframe] savePdfToSupabase called (call #${saveCallCount})`);

  // Prevent multiple simultaneous saves
  if (isSaving) {
    console.log("Save already in progress, ignoring request");
    showNotification("Save already in progress...", "info");
    return;
  }

  // Clear any pending save timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  // Set debounce timeout to prevent rapid clicks
  saveTimeout = setTimeout(async () => {
    if (isSaving) return; // Double check

    isSaving = true;
    console.log("[iframe] Setting isSaving = true, starting save operation");

    try {
      console.log("Starting PDF save to Supabase with annotations...");
      showNotification("Saving PDF with annotations to Supabase...", "info");

      // Access the PDF.js application instance
      const app = window.PDFViewerApplication;
      if (!app || !app.pdfDocument) {
        console.error("PDF.js application or document not available");
        showNotification("No PDF document loaded", "error");
        return;
      }

      // Get document info
      const documentInfo = app.documentInfo || {};
      const docTitle = documentInfo.Title || "Untitled PDF";

      console.log("Document info:", documentInfo);

      // Get the PDF URL (could be blob URL or original URL)
      const pdfUrl = app.url;
      console.log("PDF URL:", pdfUrl);

      // Use the correct method to save PDF with annotations
      let pdfBlob;
      try {
        console.log("Attempting to save PDF with annotations...");

        // Access the PDF document properly
        const pdfDoc = app.pdfDocument;

        // Use saveDocument with annotation storage - this is the correct approach
        const pdfData = await pdfDoc.saveDocument(pdfDoc.annotationStorage);
        pdfBlob = new Blob([pdfData], { type: "application/pdf" });

        console.log("PDF saved with annotations, size:", pdfBlob.size, "bytes");

        // Check annotation storage for debugging
        if (pdfDoc.annotationStorage) {
          const annotationCount = pdfDoc.annotationStorage.size || 0;
          console.log("Annotation storage size:", annotationCount);

          if (annotationCount > 0) {
            console.log("Annotations detected and included in save");
          } else {
            console.log("No annotations detected in storage");
          }
        }
      } catch (saveError) {
        console.error("Error saving PDF with annotations:", saveError);

        // Fallback to original PDF if save with annotations fails
        console.log("Falling back to original PDF...");
        try {
          if (pdfUrl.startsWith("blob:")) {
            const response = await fetch(pdfUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch PDF blob: ${response.status}`);
            }
            pdfBlob = await response.blob();
            console.log(
              "Fetched original PDF blob, size:",
              pdfBlob.size,
              "bytes"
            );
          } else {
            const response = await fetch(pdfUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch PDF: ${response.status}`);
            }
            pdfBlob = await response.blob();
            console.log(
              "Fetched original PDF from URL, size:",
              pdfBlob.size,
              "bytes"
            );
          }
        } catch (fetchError) {
          console.error("Error fetching original PDF:", fetchError);
          showNotification("Failed to fetch PDF data", "error");
          return;
        }
      }

      // Final check to ensure pdfBlob is defined
      if (!pdfBlob) {
        console.error("pdfBlob is still undefined after all attempts");
        showNotification("Failed to create PDF blob", "error");
        return;
      }

      console.log("Final PDF blob size:", pdfBlob.size, "bytes");

      // Check if we're in the parent window (Unigraph app) context
      if (window.parent === window) {
        // We're not in an iframe, try to access Unigraph API directly
        showNotification(
          "Cannot access Unigraph API from standalone PDF viewer",
          "error"
        );
        return;
      }

      // Get a clean title for the PDF
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const cleanTitle =
        docTitle.replace(/[^a-zA-Z0-9\s-_]/g, "") || `PDF-${timestamp}`;

      // Prepare the data to send to the parent window
      const requestId = Math.random().toString(36).substr(2, 9);
      const saveData = {
        action: "savePdfToSupabase",
        requestId: requestId,
        title: cleanTitle,
        documentId: documentContext.documentId, // Include document ID for updates
        originalUrl: pdfUrl.startsWith("blob:") ? null : pdfUrl,
        metadata: {
          title: docTitle,
          author: documentInfo.Author,
          subject: documentInfo.Subject,
          creator: documentInfo.Creator,
          producer: documentInfo.Producer,
          creationDate: documentInfo.CreationDate,
          modificationDate: documentInfo.ModDate,
          fileSize: pdfBlob ? pdfBlob.size : 0,
        },
      };

      // Convert blob to base64 for postMessage using FileReader (more reliable for large files)
      console.log(
        "Converting PDF to base64, size:",
        pdfBlob ? pdfBlob.size : "undefined",
        "bytes"
      );

      if (!pdfBlob || pdfBlob.size > 50 * 1024 * 1024) {
        // 50MB limit or undefined blob
        throw new Error(
          pdfBlob
            ? "PDF file is too large (max 50MB supported)"
            : "PDF blob is undefined"
        );
      }

      // Use FileReader for more reliable base64 conversion
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Remove the data URL prefix (data:application/pdf;base64,)
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read PDF file"));
        reader.readAsDataURL(pdfBlob);
      });

      console.log("Base64 conversion completed, length:", base64Data.length);
      saveData.pdfData = base64Data;

      console.log(
        `[iframe] Sending PDF save request to parent window, requestId: ${requestId}`
      );
      showNotification("Saving PDF to Supabase...", "info");

      // Send the data to the parent window
      window.parent.postMessage(saveData, "*");

      // Listen for response from parent
      const responseHandler = (event) => {
        if (event.data.action === "savePdfToSupabaseResponse") {
          window.removeEventListener("message", responseHandler);
          isSaving = false; // Reset saving state
          console.log("[iframe] Received response, setting isSaving = false");

          if (event.data.success) {
            // Parent already logged success, just show notification
            showNotification(
              `PDF saved with annotations as "${event.data.document.title}"`,
              "success"
            );
          } else {
            console.error("Failed to save PDF:", event.data.error);
            showNotification(
              `Failed to save PDF: ${event.data.error}`,
              "error"
            );
          }
        }
      };

      window.addEventListener("message", responseHandler);

      // Set a timeout in case we don't get a response
      setTimeout(() => {
        window.removeEventListener("message", responseHandler);
        isSaving = false; // Reset saving state on timeout
        console.log("[iframe] Save timed out, setting isSaving = false");
        showNotification("Save operation timed out", "error");
      }, 30000); // 30 second timeout
    } catch (error) {
      console.error("Error saving PDF to Supabase:", error);
      console.error("Stack trace:", error.stack);
      showNotification(`Error saving PDF: ${error.message}`, "error");
      isSaving = false; // Reset saving state on error
      console.log("[iframe] Error occurred, setting isSaving = false");
    }
  }, 500); // 500ms debounce delay
}

function showNotification(message, type = "info") {
  // Create a notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 12px 16px;
    border-radius: 6px;
    z-index: 10000;
    max-width: 350px;
    font-family: sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;

  // Set colors based on type
  switch (type) {
    case "success":
      notification.style.background = "#4caf50";
      notification.style.color = "white";
      break;
    case "error":
      notification.style.background = "#f44336";
      notification.style.color = "white";
      break;
    case "info":
    default:
      notification.style.background = "#2196f3";
      notification.style.color = "white";
      break;
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Global function to manually trigger save (for debugging)
window.savePdfToSupabase = savePdfToSupabase;

console.log("Custom PDF.js save to Supabase script loaded");
