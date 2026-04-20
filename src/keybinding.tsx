import { ReactNode } from "react";

export enum KeyCode {
  Mod = "mod",
  Shift = "shift",
  Alt = "alt",
  Ctrl = "ctrl",
  Space = "space",
  Delete = "delete",
  Backspace = "backspace",
  Enter = "enter",
  Escape = "escape",
  Tab = "tab",
  ArrowUp = "arrowup",
  ArrowDown = "arrowdown",
  ArrowLeft = "arrowleft",
  ArrowRight = "arrowright",
}

const isMac = typeof navigator !== "undefined" && /mac|iphone|ipad|ipod/i.test(navigator.userAgent);

/** Mac symbol glyphs for modifier and special keys. */
const MAC_SYMBOLS: Record<string, string> = {
  [KeyCode.Mod]: "\u2318", // ⌘
  [KeyCode.Shift]: "\u21E7", // ⇧
  [KeyCode.Alt]: "\u2325", // ⌥
  [KeyCode.Ctrl]: "\u2303", // ⌃
  [KeyCode.Delete]: "\u232B", // ⌫
  [KeyCode.Backspace]: "\u232B", // ⌫
  [KeyCode.Enter]: "\u21A9", // ↩
  [KeyCode.Escape]: "\u238B", // ⎋
  [KeyCode.Tab]: "\u21E5", // ⇥
  [KeyCode.Space]: "\u2423", // ␣
  [KeyCode.ArrowUp]: "\u2191", // ↑
  [KeyCode.ArrowDown]: "\u2193", // ↓
  [KeyCode.ArrowLeft]: "\u2190", // ←
  [KeyCode.ArrowRight]: "\u2192", // →
};

/** Windows/Linux labels for modifier and special keys. */
const PC_LABELS: Record<string, string> = {
  [KeyCode.Mod]: "Ctrl",
  [KeyCode.Shift]: "Shift",
  [KeyCode.Alt]: "Alt",
  [KeyCode.Ctrl]: "Ctrl",
  [KeyCode.Delete]: "Del",
  [KeyCode.Backspace]: "Backspace",
  [KeyCode.Enter]: "Enter",
  [KeyCode.Escape]: "Esc",
  [KeyCode.Tab]: "Tab",
  [KeyCode.Space]: "Space",
  [KeyCode.ArrowUp]: "\u2191",
  [KeyCode.ArrowDown]: "\u2193",
  [KeyCode.ArrowLeft]: "\u2190",
  [KeyCode.ArrowRight]: "\u2192",
};

function resolveKeyLabel(key: string | KeyCode): { label: string; isSymbol: boolean } {
  const lower = key.toLowerCase();
  if (isMac && lower in MAC_SYMBOLS) return { label: MAC_SYMBOLS[lower], isSymbol: true };
  if (!isMac && lower in PC_LABELS) return { label: PC_LABELS[lower], isSymbol: false };
  // Arrow symbols are unicode on both platforms
  if ([KeyCode.ArrowUp, KeyCode.ArrowDown, KeyCode.ArrowLeft, KeyCode.ArrowRight].includes(lower as KeyCode))
    return { label: key, isSymbol: true };
  // Single character keys display uppercase
  if (key.length === 1) return { label: key.toUpperCase(), isSymbol: false };
  return { label: key, isSymbol: false };
}

/**
 * Renders a keyboard shortcut as a compact inline sequence.
 * Automatically adapts symbols for macOS (⌘⇧⌥) vs Windows/Linux (Ctrl+Shift+Alt).
 */
export function Keybinding({ keys = [] }: { keys: (string | KeyCode)[] }): ReactNode {
  if (keys.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-nowrap text-sm leading-none">
      {keys.map((key, i) => {
        const { label, isSymbol } = resolveKeyLabel(key);
        // On PC, add "+" separator between keys (Mac uses symbol juxtaposition)
        const separator = !isMac && i > 0 ? "+" : null;
        return (
          <span key={i} className="inline-flex items-center">
            {separator && <span className="mx-px font-mono">{separator}</span>}
            <span className={isSymbol ? undefined : "font-mono"}>{label}</span>
          </span>
        );
      })}
    </span>
  );
}
