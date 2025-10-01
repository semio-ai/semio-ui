import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

export interface WindowFeatures {
  left?: number;
  top?: number;
  offsetFromParent?: boolean;
  resizable?: boolean;
  scrollbars?: boolean;
  toolbar?: boolean;
  menubar?: boolean;
  location?: boolean;
  status?: boolean;
}

export interface WindowPortalProps {
  /** Whether the window should be open */
  isOpen: boolean;
  /** Unique identifier for the window */
  windowId: string;
  /** Window title */
  title?: string;
  /** Callback when window closes */
  onClose: () => void;
  /** Content to render in the window */
  children: ReactNode;
  /** Window width */
  width?: number;
  /** Window height */
  height?: number;
  /** Window features configuration */
  features?: WindowFeatures;
  /** Whether to copy styles from parent window */
  copyStyles?: boolean;
  /** Additional CSS class names for the window body */
  className?: string;
}

/**
 * WindowPortal component that renders children in a separate browser window.
 * Uses React portals to maintain component hierarchy and context sharing.
 */
export function WindowPortal({
  isOpen,
  windowId,
  title = "Pop-out Window",
  onClose,
  children,
  width = 1200,
  height = 800,
  features = {},
  copyStyles = true,
  className,
}: WindowPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const windowRef = useRef<Window | null>(null);
  const isClosingRef = useRef(false);

  // Memoize window features to prevent recalculation
  const featuresString = useMemo(() => {
    const left = features.offsetFromParent
      ? (window.screenX || window.screenLeft || 0) + 50
      : (features.left ?? window.screen.width / 2 - width / 2);

    const top = features.offsetFromParent
      ? (window.screenY || window.screenTop || 0) + 50
      : (features.top ?? window.screen.height / 2 - height / 2);

    return [
      `width=${String(width)}`,
      `height=${String(height)}`,
      `left=${String(left)}`,
      `top=${String(top)}`,
      `resizable=${features.resizable !== false ? "yes" : "no"}`,
      `scrollbars=${features.scrollbars !== false ? "yes" : "no"}`,
      `toolbar=${features.toolbar ? "yes" : "no"}`,
      `menubar=${features.menubar ? "yes" : "no"}`,
      `location=${features.location ? "yes" : "no"}`,
      `status=${features.status ? "yes" : "no"}`,
    ].join(",");
  }, [width, height, features]);

  // Copy styles helper
  const copyParentStyles = useCallback(
    (targetWindow: Window) => {
      if (!copyStyles) return;

      try {
        const styles = Array.from(document.styleSheets);
        const head = targetWindow.document.head;

        // Clear existing styles
        head.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());

        styles.forEach((styleSheet) => {
          try {
            if (styleSheet.href) {
              // External stylesheet
              const link = targetWindow.document.createElement("link");
              link.rel = "stylesheet";
              link.type = "text/css";
              link.href = styleSheet.href;
              head.appendChild(link);
            } else if (styleSheet.cssRules) {
              // Inline styles
              const style = targetWindow.document.createElement("style");
              style.type = "text/css";

              Array.from(styleSheet.cssRules).forEach((rule) => {
                try {
                  style.appendChild(targetWindow.document.createTextNode(rule.cssText));
                } catch {
                  // Some rules might not be copyable due to CORS restrictions
                  // This is expected behavior and can be safely ignored
                }
              });

              if (style.childNodes.length > 0) {
                head.appendChild(style);
              }
            }
          } catch {
            // StyleSheet might be inaccessible due to CORS restrictions
            // This is expected for cross-origin stylesheets
          }
        });

        // Copy CSS variables
        const computedStyle = window.getComputedStyle(document.documentElement);
        const cssVariables: string[] = [];

        for (const property of Array.from(computedStyle)) {
          if (property.startsWith("--")) {
            cssVariables.push(`${property}: ${computedStyle.getPropertyValue(property)}`);
          }
        }

        if (cssVariables.length > 0) {
          const variableStyle = targetWindow.document.createElement("style");
          variableStyle.textContent = `:root { ${cssVariables.join("; ")} }`;
          head.appendChild(variableStyle);
        }
      } catch (error) {
        console.warn("Error copying styles:", error);
      }
    },
    [copyStyles],
  );

  // Main effect to manage window lifecycle
  useEffect(() => {
    // If we're closing or not open, clean up
    if (!isOpen) {
      if (windowRef.current && !windowRef.current.closed) {
        isClosingRef.current = true;
        windowRef.current.close();
        windowRef.current = null;
      }
      setContainer(null);
      return;
    }

    // Prevent opening if we're in the process of closing
    if (isClosingRef.current) {
      isClosingRef.current = false;
      return;
    }

    // Check if window already exists
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
      return;
    }

    // Open new window
    const newWindow = window.open("about:blank", windowId, featuresString);

    if (!newWindow) {
      console.error("Failed to open window - popup blocker may be active");
      onClose();
      return;
    }

    // Store reference immediately
    windowRef.current = newWindow;

    // Initialize the window document
    newWindow.document.write("<!DOCTYPE html><html><head></head><body></body></html>");
    newWindow.document.close();
    newWindow.document.title = title;

    // Copy body classes for theme support
    newWindow.document.body.className = document.body.className;
    if (className) {
      newWindow.document.body.classList.add(...className.split(" "));
    }

    // Add viewport meta tag
    const viewport = newWindow.document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1.0";
    newWindow.document.head.appendChild(viewport);

    // Copy styles
    copyParentStyles(newWindow);

    // Create container element for React portal
    const containerEl = newWindow.document.createElement("div");
    containerEl.id = `${windowId}-root`;
    containerEl.className = "window-portal-root";
    containerEl.style.cssText = "width: 100%; height: 100%; overflow: auto;";

    // Style the body
    newWindow.document.body.style.cssText =
      "margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden;";
    newWindow.document.body.appendChild(containerEl);

    // Set container for portal
    setContainer(containerEl);

    // Handle window close - only set up once
    const handleWindowClose = () => {
      if (!isClosingRef.current) {
        isClosingRef.current = true;
        windowRef.current = null;
        setContainer(null);
        // Use requestAnimationFrame to avoid React state update issues
        requestAnimationFrame(() => {
          onClose();
        });
      }
    };

    // Add event listener for window close
    newWindow.addEventListener("beforeunload", handleWindowClose);

    // Cleanup function
    return () => {
      if (newWindow && !newWindow.closed) {
        newWindow.removeEventListener("beforeunload", handleWindowClose);
        if (!isClosingRef.current) {
          isClosingRef.current = true;
          newWindow.close();
        }
      }
      windowRef.current = null;
      setContainer(null);
    };
  }, [isOpen, windowId, title, className, featuresString, copyParentStyles, onClose]);

  // Don't render portal if container is not ready
  if (!container || !isOpen) {
    return null;
  }

  // Create portal to render children in the new window
  return createPortal(children, container);
}
