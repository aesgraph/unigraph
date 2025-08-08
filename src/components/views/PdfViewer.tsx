import * as pdfjsLib from "pdfjs-dist";
import type {
  PDFDocumentProxy,
  TextItem,
} from "pdfjs-dist/types/src/display/api";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Configure PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  url?: string;
  title?: string;
  initialPage?: number;
  initialScale?: number;
  onTextSelection?: (selectedText: string, pageNumber: number) => void;
  onPageChange?: (pageNumber: number) => void;
}

interface PageInfo {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  textLayer: HTMLDivElement;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  url = "https://arxiv.org/pdf/1307.5461", // Quantum hyperbolic geometry in loop quantum gravity
  title:
    _title = "Quantum hyperbolic geometry in loop quantum gravity with cosmological constant",
  initialPage = 1,
  initialScale = 1.0,
  onTextSelection,
  onPageChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scale, setScale] = useState(initialScale);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_renderedPages, setRenderedPages] = useState<Map<number, PageInfo>>(
    new Map()
  );

  console.log("PdfViewer mounting with URL:", url);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadingTask = pdfjsLib.getDocument({
          url,
          // Use a more reliable cmap source or disable if not needed
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);

        console.log("PDF loaded:", pdf.numPages, "pages");
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(
          `Failed to load PDF: ${err instanceof Error ? err.message : String(err)}`
        );
        setLoading(false);
      }
    };

    if (url) {
      loadPDF();
    }

    return () => {
      // Cleanup
      setPdfDoc(null);
      setRenderedPages(new Map());
    };
  }, [url]);

  // Render a specific page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !containerRef.current) return;

      try {
        console.log("Rendering page:", pageNum);
        const page = await pdfDoc.getPage(pageNum);

        // Calculate viewport
        const viewport = page.getViewport({ scale });

        // Create canvas for PDF rendering
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not get canvas context");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.display = "block";
        canvas.style.margin = "0";
        canvas.style.padding = "0";
        canvas.style.boxShadow = "none";
        canvas.style.backgroundColor = "white";
        canvas.style.maxWidth = "none";
        canvas.style.maxHeight = "none";
        canvas.style.width = "auto";
        canvas.style.height = "auto";

        // Render PDF page into canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // Create text layer for text selection
        const textLayerDiv = document.createElement("div");
        textLayerDiv.style.position = "absolute";
        textLayerDiv.style.left = canvas.offsetLeft + "px";
        textLayerDiv.style.top = canvas.offsetTop + "px";
        textLayerDiv.style.height = viewport.height + "px";
        textLayerDiv.style.width = viewport.width + "px";
        textLayerDiv.style.overflow = "hidden";
        textLayerDiv.style.opacity = "0.2";
        textLayerDiv.style.lineHeight = "1.0";
        textLayerDiv.style.pointerEvents = "auto";

        // Get text content and render text layer
        const textContent = await page.getTextContent();

        // Simple text layer rendering
        textContent.items.forEach((item) => {
          if ("str" in item) {
            const textItem = item as TextItem;
            const div = document.createElement("div");
            div.textContent = textItem.str;
            div.style.position = "absolute";
            div.style.left = textItem.transform[4] + "px";
            div.style.top = viewport.height - textItem.transform[5] + "px";
            div.style.fontSize = Math.abs(textItem.transform[0]) + "px";
            div.style.fontFamily = textItem.fontName;
            div.style.whiteSpace = "pre";
            textLayerDiv.appendChild(div);
          }
        });

        // Handle text selection
        textLayerDiv.addEventListener("mouseup", () => {
          const selection = window.getSelection();
          if (selection && selection.toString().trim()) {
            const selectedText = selection.toString();
            console.log("Text selected on page", pageNum, ":", selectedText);
            onTextSelection?.(selectedText, pageNum);
          }
        });

        const pageInfo: PageInfo = {
          pageNumber: pageNum,
          canvas,
          textLayer: textLayerDiv,
        };

        setRenderedPages((prev) => new Map(prev.set(pageNum, pageInfo)));

        return pageInfo;
      } catch (err) {
        console.error("Error rendering page:", err);
        setError(
          `Failed to render page ${pageNum}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    [pdfDoc, scale, onTextSelection]
  );

  // Update display when current page changes
  useEffect(() => {
    if (pdfDoc && containerRef.current) {
      // Clear container
      containerRef.current.innerHTML = "";

      // Render current page
      renderPage(currentPage).then((pageInfo) => {
        if (pageInfo && containerRef.current) {
          const wrapper = document.createElement("div");
          wrapper.style.position = "relative";
          wrapper.style.display = "flex";
          wrapper.style.justifyContent = "center";
          wrapper.style.alignItems = "flex-start";
          wrapper.style.margin = "0";
          wrapper.style.padding = "20px";
          wrapper.style.width = "100%";
          wrapper.style.minHeight = "100%";

          wrapper.appendChild(pageInfo.canvas);
          wrapper.appendChild(pageInfo.textLayer);

          containerRef.current.appendChild(wrapper);
        }
      });

      onPageChange?.(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage, onPageChange]);

  // Re-render when scale changes
  useEffect(() => {
    setRenderedPages(new Map()); // Clear cache when scale changes
  }, [scale]);

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev * 1.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev / 1.2, 0.5));
  const _resetZoom = () => setScale(1.0);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading PDF</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Toolbar - spans full width */}
      <div className="w-full bg-gray-100 border-b border-gray-300 px-2 py-1 flex items-center justify-between text-sm flex-shrink-0">
        {/* Left group - Navigation controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            title="Previous page"
          >
            ←
          </button>

          <span className="text-gray-700 text-xs px-2">
            {currentPage} of {numPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            title="Next page"
          >
            →
          </button>
        </div>

        {/* Right group - Zoom controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={zoomOut}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-xs"
            title="Zoom out"
          >
            −
          </button>

          <button
            onClick={zoomIn}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-xs"
            title="Zoom in"
          >
            +
          </button>

          <select
            value={Math.round(scale * 100)}
            onChange={(e) => setScale(parseInt(e.target.value) / 100)}
            className="bg-transparent text-gray-700 text-xs border-none outline-none cursor-pointer ml-1"
          >
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
            <option value="125">125%</option>
            <option value="150">150%</option>
            <option value="200">200%</option>
          </select>
        </div>
      </div>

      {/* PDF Content - Takes up remaining space */}
      <div
        ref={containerRef}
        className="flex-1 bg-white overflow-auto"
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* PDF pages will be rendered here */}
      </div>
    </div>
  );
};

export default PdfViewer;
