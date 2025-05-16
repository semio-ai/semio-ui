import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { omit } from "lodash";
import { clsx } from "clsx";
import { IconClipboardCheck, IconClipboardPlus } from "@tabler/icons-react";
import { useTheme } from "./hooks/use-theme";
import { Tooltip } from "./floating/tooltip";
import { Button } from "./buttons/button";
import { Variant, Theme } from "./types";

interface SnippetProps {
  text: string;
  language?: string;
  className?: string;
}

export function Snippet({ text, language, className }: SnippetProps) {
  const { resolvedTheme } = useTheme();
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied, setIsCopied]);

  return (
    <div
      className={clsx(
        "rounded-sm w-full bg-neutral-200 dark:bg-neutral-800 overflow-clip",
        className,
      )}
    >
      {language && (
        <div className={clsx("py-1 px-4 w-full italic bg-neutral-300 dark:bg-neutral-700")}>
          {language}
        </div>
      )}
      <div className="relative dark:bg-neutral-800 bg-neutral-200 p-1 min-h-12">
        <Highlight
          theme={resolvedTheme === Theme.Dark ? themes.vsDark : themes.vsLight}
          code={text}
          language={language ?? "plaintext"}
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={omit(style, "backgroundColor")} className="p-2">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span>{i + 1}</span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
        <Tooltip
          variant={isCopied ? Variant.Success : Variant.Default}
          content={isCopied ? "Copied!" : "Copy"}
          side="right"
          controlledState={isCopied ? [true, () => {}] : undefined}
        >
          <Button
            invert
            variant={isCopied ? Variant.Success : Variant.Default}
            onClick={() => {
              navigator.clipboard
                .writeText(text)
                .then(() => {
                  setIsCopied(true);
                })
                .catch(() => {
                  // TODO: report to crashlytics
                  setIsCopied(false);
                });
            }}
            leftIcon={isCopied ? <IconClipboardCheck /> : <IconClipboardPlus />}
            className="absolute top-2 right-2"
          />
        </Tooltip>
      </div>
    </div>
  );
}
