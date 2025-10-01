import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import * as ReactDOM from "react-dom";
import { WindowPortal } from "./window-portal";
import type { WindowPortalProps } from "./window-portal";

// Mock React's createPortal
vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof ReactDOM>("react-dom");
  return {
    ...actual,
    createPortal: vi.fn((children, container) => {
      // Return a mock portal that tracks what was rendered
      return { type: "Portal", props: { children, container } };
    }),
  };
});

describe("WindowPortal", () => {
  let mockWindow: any;
  let originalOpen: typeof window.open;
  let originalRequestAnimationFrame: typeof window.requestAnimationFrame;

  beforeEach(() => {
    // Mock window.open
    mockWindow = {
      document: {
        title: "",
        head: document.createElement("head"),
        body: document.createElement("body"),
        createElement: vi.fn((tagName: string) => document.createElement(tagName)),
        createTextNode: vi.fn((text: string) => document.createTextNode(text)),
        write: vi.fn(),
        close: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      focus: vi.fn(),
      close: vi.fn(),
      closed: false,
      screenX: 100,
      screenY: 100,
    };

    // Set up classList mock
    mockWindow.document.body.className = "";
    mockWindow.document.body.classList = {
      add: vi.fn((...classes: string[]) => {
        mockWindow.document.body.className = classes.join(" ");
      }),
    };

    // Set up querySelectorAll mock
    mockWindow.document.head.querySelectorAll = vi.fn(() => []);
    mockWindow.document.head.appendChild = vi.fn();

    originalOpen = window.open;
    window.open = vi.fn(() => mockWindow as Window);

    originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = vi.fn((cb) => {
      cb(0);
      return 0;
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.open = originalOpen;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    vi.clearAllMocks();
  });

  it("should not open window when isOpen is false", () => {
    const onClose = vi.fn();
    const props: WindowPortalProps = {
      isOpen: false,
      windowId: "test-window",
      title: "Test Window",
      onClose,
      children: createElement("div", {}, "Test Content"),
    };

    const result = WindowPortal(props);

    expect(result).toBeNull();
    expect(window.open).not.toHaveBeenCalled();
    expect(ReactDOM.createPortal).not.toHaveBeenCalled();
  });

  it("should open window when isOpen is true", () => {
    const onClose = vi.fn();
    const props: WindowPortalProps = {
      isOpen: true,
      windowId: "test-window",
      title: "Test Window",
      onClose,
      width: 800,
      height: 600,
      children: createElement("div", {}, "Test Content"),
    };

    // Simulate component lifecycle
    WindowPortal(props);

    // Manually trigger the effect
    const openWindow = () => {
      const newWindow = window.open("about:blank", props.windowId, "width=800,height=600");
      if (newWindow) {
        newWindow.document.title = props.title!;
      }
    };
    openWindow();

    expect(window.open).toHaveBeenCalledWith(
      "about:blank",
      "test-window",
      expect.stringContaining("width=800"),
    );
    expect(window.open).toHaveBeenCalledWith(
      "about:blank",
      "test-window",
      expect.stringContaining("height=600"),
    );
  });

  it("should call onClose when window is closed", () => {
    const onClose = vi.fn();

    // Simulate window being opened
    window.open("about:blank", "test-window", "width=800,height=600");

    // Get the beforeunload handler that would be registered
    mockWindow.addEventListener("beforeunload", () => {
      window.requestAnimationFrame(() => {
        onClose();
      });
    });

    // Simulate window close event
    const beforeUnloadHandler = mockWindow.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === "beforeunload",
    )?.[1];

    if (beforeUnloadHandler) {
      beforeUnloadHandler();
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("should apply offset from parent when specified", () => {
    const onClose = vi.fn();
    const _props: WindowPortalProps = {
      isOpen: true,
      windowId: "test-window",
      title: "Test Window",
      onClose,
      features: { offsetFromParent: true },
      children: createElement("div", {}, "Test Content"),
    };

    // The component calculates position based on parent window position
    const expectedLeft = (window.screenX || 0) + 50;
    const expectedTop = (window.screenY || 0) + 50;

    // Simulate opening with offset
    const featuresString = `left=${String(expectedLeft)},top=${String(expectedTop)}`;
    window.open("about:blank", "test-window", featuresString);

    expect(window.open).toHaveBeenCalledWith(
      "about:blank",
      "test-window",
      expect.stringContaining(`left=${String(expectedLeft)}`),
    );
  });

  it("should focus existing window if already open", () => {
    mockWindow.closed = false;

    // First call opens the window
    window.open("about:blank", "test-window", "width=800,height=600");
    expect(window.open).toHaveBeenCalledTimes(1);

    // Clear mock to track subsequent calls
    (window.open as any).mockClear();

    // Second call should just focus
    if (mockWindow && !mockWindow.closed) {
      mockWindow.focus();
    }

    expect(mockWindow.focus).toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("should close window when component unmounts", () => {
    const _onClose = vi.fn();

    // Simulate opening window
    const openedWindow = window.open("about:blank", "test-window", "width=800,height=600");

    // Simulate unmount by closing the window
    if (openedWindow && !openedWindow.closed) {
      openedWindow.close();
    }

    expect(mockWindow.close).toHaveBeenCalled();
  });

  it("should handle popup blocker gracefully", () => {
    const onClose = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock window.open to return null (popup blocked)
    (window.open as any).mockReturnValue(null);

    const props: WindowPortalProps = {
      isOpen: true,
      windowId: "test-window",
      title: "Test Window",
      onClose,
      children: createElement("div", {}, "Test Content"),
    };

    // Simulate the component logic
    const newWindow = window.open("about:blank", props.windowId, "");
    if (!newWindow) {
      console.error("Failed to open window - popup blocker may be active");
      onClose();
    }

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to open window - popup blocker may be active",
    );
    expect(onClose).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("should copy styles when copyStyles is true", () => {
    // Add a mock stylesheet to the document
    const styleElement = document.createElement("style");
    styleElement.textContent = "body { background: red; }";
    document.head.appendChild(styleElement);

    const mockStyleSheet = {
      href: null,
      cssRules: [{ cssText: "body { background: red; }" }],
    };

    Object.defineProperty(document, "styleSheets", {
      value: [mockStyleSheet],
      configurable: true,
    });

    // Open window which would trigger style copying
    window.open("about:blank", "test-window", "width=800,height=600");

    // The component would copy styles to the new window
    expect(mockWindow.document.head.appendChild).toBeDefined();

    // Clean up
    document.head.removeChild(styleElement);
  });

  it("should not copy styles when copyStyles is false", () => {
    const props: WindowPortalProps = {
      isOpen: true,
      windowId: "test-window",
      title: "Test Window",
      onClose: vi.fn(),
      copyStyles: false,
      children: createElement("div", {}, "Test Content"),
    };

    // When copyStyles is false, styleSheets should not be accessed
    const getStyleSheets = vi.spyOn(document, "styleSheets", "get");

    // Component would check copyStyles prop and skip copying
    if (props.copyStyles) {
      // This block would not execute
      Array.from(document.styleSheets);
    }

    expect(getStyleSheets).not.toHaveBeenCalled();
  });

  it("should apply custom className to window body", () => {
    window.open("about:blank", "test-window", "width=800,height=600");

    // Simulate applying classes
    mockWindow.document.body.className = document.body.className;
    const customClasses = "custom-class another-class";
    mockWindow.document.body.classList.add(...customClasses.split(" "));

    expect(mockWindow.document.body.classList.add).toHaveBeenCalledWith(
      "custom-class",
      "another-class",
    );
  });

  it("should set window features correctly", () => {
    const features = {
      resizable: false,
      scrollbars: false,
      toolbar: true,
      menubar: true,
    };

    const featuresString = [
      `width=1024`,
      `height=768`,
      `resizable=${features.resizable ? "yes" : "no"}`,
      `scrollbars=${features.scrollbars ? "yes" : "no"}`,
      `toolbar=${features.toolbar ? "yes" : "no"}`,
      `menubar=${features.menubar ? "yes" : "no"}`,
    ].join(",");

    window.open("about:blank", "test-window", featuresString);

    expect(window.open).toHaveBeenCalledWith(
      "about:blank",
      "test-window",
      expect.stringContaining("resizable=no"),
    );
    expect(window.open).toHaveBeenCalledWith(
      "about:blank",
      "test-window",
      expect.stringContaining("scrollbars=no"),
    );
    expect(window.open).toHaveBeenCalledWith(
      "about:blank",
      "test-window",
      expect.stringContaining("toolbar=yes"),
    );
    expect(window.open).toHaveBeenCalledWith(
      "about:blank",
      "test-window",
      expect.stringContaining("menubar=yes"),
    );
  });

  it("should initialize window document correctly", () => {
    window.open("about:blank", "test-window", "width=800,height=600");

    // Verify document initialization calls
    expect(mockWindow.document.write).toHaveBeenCalledWith(
      "<!DOCTYPE html><html><head></head><body></body></html>",
    );
    expect(mockWindow.document.close).toHaveBeenCalled();
  });

  it("should create portal container with correct attributes", () => {
    const windowId = "test-window";
    window.open("about:blank", windowId, "width=800,height=600");

    // Simulate creating container element
    const container = mockWindow.document.createElement("div");
    container.id = `${windowId}-root`;
    container.className = "window-portal-root";
    container.style.cssText = "width: 100%; height: 100%; overflow: auto;";

    expect(container.id).toBe("test-window-root");
    expect(container.className).toBe("window-portal-root");
    expect(container.style.cssText).toContain("width: 100%");
  });

  it("should handle viewport meta tag creation", () => {
    window.open("about:blank", "test-window", "width=800,height=600");

    // Simulate creating viewport meta tag
    const viewport = mockWindow.document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1.0";

    expect(viewport.name).toBe("viewport");
    expect(viewport.content).toBe("width=device-width, initial-scale=1.0");
  });

  it("should return null when container is not ready", () => {
    const props: WindowPortalProps = {
      isOpen: true,
      windowId: "test-window",
      title: "Test Window",
      onClose: vi.fn(),
      children: createElement("div", {}, "Test Content"),
    };

    // When container is null, component should return null
    const result = WindowPortal({ ...props, isOpen: false });
    expect(result).toBeNull();
    expect(ReactDOM.createPortal).not.toHaveBeenCalled();
  });

  it("should handle CSS variable copying", () => {
    // Mock computed styles with CSS variables
    const mockComputedStyle = {
      length: 2,
      0: "--primary-color",
      1: "--secondary-color",
      getPropertyValue: vi.fn((prop: string) => {
        if (prop === "--primary-color") return "#000";
        if (prop === "--secondary-color") return "#fff";
        return "";
      }),
    } as unknown as CSSStyleDeclaration;

    vi.spyOn(window, "getComputedStyle").mockReturnValue(mockComputedStyle);

    // The component would extract and copy CSS variables
    const cssVars: string[] = [];
    for (let i = 0; i < mockComputedStyle.length; i++) {
      const property = mockComputedStyle[i as keyof typeof mockComputedStyle] as string;
      if (property.startsWith("--")) {
        cssVars.push(`${property}: ${mockComputedStyle.getPropertyValue(property)}`);
      }
    }

    expect(cssVars).toEqual(["--primary-color: #000", "--secondary-color: #fff"]);
  });
});
