import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx } from "clsx";
import { Snippet } from "./snippet";

/**
 * Rendered markdown for **user-authored** prose — an asset's description, a
 * release's notes, a project README.
 *
 * ## Why this library, and why no HTML
 *
 * `react-markdown` builds a React element tree; it never assembles an HTML string
 * and never touches `innerHTML`. That matters more here than performance does,
 * because everything this renders was written by one user and is displayed to
 * others: with a string-producing parser, sanitizing correctly becomes a
 * requirement we own forever, and one miss is stored XSS. The `rehype-raw` plugin
 * would reintroduce exactly that, so it is deliberately absent — raw HTML in the
 * source renders as inert text rather than as markup. `javascript:` URLs are
 * dropped by the library's own default URL transform.
 *
 * ## Why the type scale is compressed
 *
 * The page owns its heading hierarchy; this content is a *guest* inside it. An
 * author writing `#` means "the top of my document", not "louder than this page's
 * title" — so `#` renders at roughly the page's section-heading size and the levels
 * below step down from there. They are also emitted starting at `<h2>`, since the
 * surface embedding this already used `<h1>` for the thing being described, and two
 * `<h1>`s would make the document outline claim there are two subjects.
 */
export interface MarkdownProps {
  /** Markdown source. Empty or whitespace-only renders nothing at all. */
  children: string | null | undefined;
  className?: string;
}

/**
 * Heading elements are shifted down one level (`#` → `<h2>`) so the embedding
 * page keeps sole ownership of `<h1>`. `h5`/`h6` collapse onto the same treatment
 * as `h4`: past four levels the visual difference stops being legible anyway, and
 * inventing four more sizes only makes deep documents look broken.
 */
const HEADING: Record<string, string> = {
  h1: "mt-5 mb-2 text-base font-semibold first:mt-0",
  h2: "mt-4 mb-2 text-sm font-semibold first:mt-0",
  h3: "mt-4 mb-1 text-sm font-semibold first:mt-0",
  h4: "mt-3 mb-1 text-xs font-semibold uppercase first:mt-0",
};

const components: Components = {
  h1: ({ children }) => <h2 className={HEADING.h1}>{children}</h2>,
  h2: ({ children }) => <h3 className={HEADING.h2}>{children}</h3>,
  h3: ({ children }) => <h4 className={HEADING.h3}>{children}</h4>,
  h4: ({ children }) => <h5 className={HEADING.h4}>{children}</h5>,
  h5: ({ children }) => <h6 className={HEADING.h4}>{children}</h6>,
  h6: ({ children }) => <h6 className={HEADING.h4}>{children}</h6>,

  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,

  // `list-outside` with matching padding, not `list-inside`: an inside marker puts
  // the bullet in the text flow, so a wrapped line starts under the bullet instead
  // of aligning with the first line's text.
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,

  a: ({ href, children }) => (
    <a
      href={href}
      // Author-supplied destinations, so `noreferrer noopener` regardless of host:
      // `noopener` denies the opened page a handle on this one, and the pair is
      // simpler to reason about than a same-origin exception.
      target="_blank"
      rel="noreferrer noopener"
      className="underline decoration-neutral-500/50 underline-offset-2 hover:decoration-current"
    >
      {children}
    </a>
  ),

  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through opacity-70">{children}</del>,
  hr: () => <hr className="my-4 border-neutral-500/25" />,

  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-neutral-500/40 pl-3 opacity-80">
      {children}
    </blockquote>
  ),

  /**
   * Inline code only. A fenced block arrives as `<pre><code>`, and `pre` below
   * intercepts that case before this runs — so this never has to distinguish them.
   */
  code: ({ children }) => (
    <code className="rounded-xs bg-neutral-500/15 px-1 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),

  /**
   * Fenced code blocks render through `Snippet`, so markdown gets the product's own
   * syntax highlighting and copy button rather than a second, plainer code style.
   *
   * The language and text are dug out of the child `code` element's props because
   * that is where the parser puts them; a fence with no language still renders,
   * just unhighlighted.
   */
  pre: ({ children }) => {
    const child = children as { props?: { className?: string; children?: ReactNode } } | undefined;
    const language = /language-(\w+)/.exec(child?.props?.className ?? "")?.[1];
    const text = typeof child?.props?.children === "string" ? child.props.children : "";
    return (
      <div className="my-3">
        <Snippet text={text.replace(/\n$/, "")} language={language} />
      </div>
    );
  },

  // A GFM table can be wider than its container, so it scrolls in its own box
  // rather than making the whole page scroll sideways.
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-neutral-500/25 px-2 py-1 text-xs font-semibold uppercase">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-neutral-500/15 px-2 py-1 align-top">{children}</td>
  ),

  img: ({ src, alt }) => (
    <img src={typeof src === "string" ? src : undefined} alt={alt} className="my-3 max-w-full" />
  ),
};

export function Markdown({ children, className }: MarkdownProps) {
  // Nothing to render is not the same as an empty box: a description that was
  // never written should occupy no space, so the caller need not check first.
  if (!children?.trim()) return null;

  return (
    <div className={clsx("text-sm", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
