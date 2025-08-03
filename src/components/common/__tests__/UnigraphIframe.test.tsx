import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import UnigraphIframe from "../UnigraphIframe";

// Mock the lucide-react icons
jest.mock("lucide-react", () => ({
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
  Maximize2: () => <div data-testid="maximize-icon">Maximize2</div>,
  Minimize2: () => <div data-testid="minimize-icon">Minimize2</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
}));

describe("UnigraphIframe", () => {
  const defaultProps = {
    src: "https://example.com",
    title: "Test Iframe",
  };

  beforeEach(() => {
    // Mock window.open
    Object.defineProperty(window, "open", {
      value: jest.fn(),
      writable: true,
    });

    // Mock requestFullscreen and exitFullscreen
    Object.defineProperty(document, "exitFullscreen", {
      value: jest.fn(),
      writable: true,
    });
  });

  it("renders with default props", () => {
    render(<UnigraphIframe {...defaultProps} />);

    const iframe = screen.getByTitle("Test Iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://example.com");
  });

  it("renders with custom width and height", () => {
    render(<UnigraphIframe {...defaultProps} width={800} height={600} />);

    const container = screen
      .getByTitle("Test Iframe")
      .closest(".unigraph-iframe-container");
    expect(container).toHaveStyle({ width: "800px", height: "600px" });
  });

  it("shows loading state by default", () => {
    render(<UnigraphIframe {...defaultProps} />);

    expect(
      screen.getByText("Loading interactive content...")
    ).toBeInTheDocument();
  });

  it("hides loading state when showLoading is false", () => {
    render(<UnigraphIframe {...defaultProps} showLoading={false} />);

    expect(
      screen.queryByText("Loading interactive content...")
    ).not.toBeInTheDocument();
  });

  it("shows controls by default", () => {
    render(<UnigraphIframe {...defaultProps} />);

    expect(screen.getByTitle("Refresh content")).toBeInTheDocument();
    expect(screen.getByTitle("Enter fullscreen")).toBeInTheDocument();
    expect(screen.getByTitle("Open in new tab")).toBeInTheDocument();
  });

  it("hides controls when showControls is false", () => {
    render(<UnigraphIframe {...defaultProps} showControls={false} />);

    expect(screen.queryByTitle("Refresh content")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Enter fullscreen")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Open in new tab")).not.toBeInTheDocument();
  });

  it("calls onLoad when iframe loads", async () => {
    const onLoad = jest.fn();
    render(<UnigraphIframe {...defaultProps} onLoad={onLoad} />);

    const iframe = screen.getByTitle("Test Iframe");
    fireEvent.load(iframe);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it("calls onError when iframe fails to load", async () => {
    const onError = jest.fn();
    render(<UnigraphIframe {...defaultProps} onError={onError} />);

    const iframe = screen.getByTitle("Test Iframe");
    fireEvent.error(iframe);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("opens external link when external link button is clicked", () => {
    const mockOpen = jest.fn();
    Object.defineProperty(window, "open", {
      value: mockOpen,
      writable: true,
    });

    render(<UnigraphIframe {...defaultProps} />);

    const externalLinkButton = screen.getByTitle("Open in new tab");
    fireEvent.click(externalLinkButton);

    expect(mockOpen).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("applies custom className", () => {
    render(<UnigraphIframe {...defaultProps} className="custom-class" />);

    const container = screen
      .getByTitle("Test Iframe")
      .closest(".unigraph-iframe-container");
    expect(container).toHaveClass("custom-class");
  });

  it("applies custom styles", () => {
    const customStyle = { border: "2px solid red" };
    render(<UnigraphIframe {...defaultProps} style={customStyle} />);

    const container = screen
      .getByTitle("Test Iframe")
      .closest(".unigraph-iframe-container");
    expect(container).toHaveStyle(customStyle);
  });

  it("passes additional iframe props", () => {
    render(
      <UnigraphIframe
        {...defaultProps}
        iframeProps={{
          sandbox: "allow-scripts",
          referrerPolicy: "no-referrer",
        }}
      />
    );

    const iframe = screen.getByTitle("Test Iframe");
    expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
    expect(iframe).toHaveAttribute("referrerpolicy", "no-referrer");
  });

  it("shows resize handle when resizable is true", () => {
    render(<UnigraphIframe {...defaultProps} resizable={true} />);

    expect(screen.getByTitle("Drag to resize")).toBeInTheDocument();
  });

  it("hides resize handle when resizable is false", () => {
    render(<UnigraphIframe {...defaultProps} resizable={false} />);

    expect(screen.queryByTitle("Drag to resize")).not.toBeInTheDocument();
  });

  it("disables fullscreen when allowFullscreen is false", () => {
    render(<UnigraphIframe {...defaultProps} allowFullscreen={false} />);

    expect(screen.queryByTitle("Enter fullscreen")).not.toBeInTheDocument();
  });
});
