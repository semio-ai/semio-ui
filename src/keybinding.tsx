import { ReactNode } from "react";
import { useKeybinding } from "./keybinding-context";

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
 * Parse a Mantine hotkey combo string ("mod+x", "shift+ArrowLeft") into
 * individual key parts suitable for rendering.
 */
export function parseHotkeyCombo(combo: string): string[] {
  return combo.split("+").map((part) => part.trim());
}

/**
 * Renders a keyboard shortcut as a compact inline sequence.
 * Automatically adapts symbols for macOS (⌘⇧⌥) vs Windows/Linux (Ctrl+Shift+Alt).
 *
 * Use `keys` for explicit key lists, or `combo` for Mantine hotkey syntax strings.
 */
export function Keybinding({
  keys,
  combo,
}: {
  /** Explicit key list (e.g. [KeyCode.Mod, "x"]) */
  keys?: (string | KeyCode)[];
  /** Mantine hotkey syntax string (e.g. "mod+x") — parsed into keys automatically */
  combo?: string;
}): ReactNode {
  const resolvedKeys = keys ?? (combo ? parseHotkeyCombo(combo) : []);
  if (resolvedKeys.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-nowrap text-sm leading-none">
      {resolvedKeys.map((key, i) => {
        const { label, isSymbol } = resolveKeyLabel(key);
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

/**
 * Displays the keybinding hint for a registered action, reading from KeybindingContext.
 * Shows the first key combo of the action's binding. Returns null if the action isn't registered.
 *
 * @example
 * ```tsx
 * <NestedItem right={<KeybindingHint action="animation:delete" />}>Delete</NestedItem>
 * ```
 */
export function KeybindingHint({ action }: { action: string }): ReactNode {
  const binding = useKeybinding(action);
  if (!binding || binding.keys.length === 0) return null;
  // Display the first combo
  return <Keybinding combo={binding.keys[0]} />;
}
