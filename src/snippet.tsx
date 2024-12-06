import useClipboard from "react-use-clipboard";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { clsx } from "clsx";
import { IconClipboardCheck, IconClipboardPlus } from "@tabler/icons-react";
import { useTheme } from "./hooks/use-theme";
import { Tooltip } from "./tooltip";
import { Button } from "./buttons/button";
import { Variant, Theme } from "./types";

interface SnippetProps {
  text: string;
  language?: string;
  className?: string;
}

export function Snippet({ text, language, className }: SnippetProps) {
  const { resolvedTheme } = useTheme();
  const [isCopied, setCopied] = useClipboard(text, { successDuration: 2000 });

  return (
    <div className={clsx("w-full bg-neutral-200 dark:bg-neutral-800", className)}>
      {language && (
        <div className={clsx("py-1 px-4 w-full italic bg-neutral-300 dark:bg-neutral-700")}>
          {language}
        </div>
      )}
      <div className="relative dark:bg-neutral-800 bg-neutral-200">
        <SyntaxHighlighter
          customStyle={{ margin: 0, padding: "1rem", overflow: "auto", background: "transparent" }}
          language={language}
          style={resolvedTheme === Theme.Dark ? atomOneDark : atomOneLight}
          codeTagProps={{ className: "bg-transparent" }}
        >
          {text}
        </SyntaxHighlighter>
        <Tooltip
          variant={isCopied ? Variant.Success : Variant.Default}
          content={isCopied ? "Copied!" : "Copy"}
          side="right"
          controlledState={isCopied ? [true, () => {}] : undefined}
        >
          <Button
            invert
            variant={isCopied ? Variant.Success : Variant.Default}
            onClick={setCopied}
            leftIcon={isCopied ? <IconClipboardCheck /> : <IconClipboardPlus />}
            className="absolute top-3 right-3"
          />
        </Tooltip>
      </div>
    </div>
  );
}
