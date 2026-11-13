import { useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { TooltipProvider } from "./tooltip-provider";
import { TooltipHost } from "./tooltip-host";
import { useTooltipStore } from "./store";
import { useTooltipAnchor } from "./use-tooltip-anchor";

/**
 * A mesh whose tooltip content is inline JSX, a new element on every render, which is how
 * most callers write it. The anchor writes that content to the store after each render,
 * so a component that re-rendered on every store change would render, write and render
 * again until React gave up.
 */
let renders = 0;
function InlineContentMesh({ label }: { label: string }) {
  renders++;
  const { ref } = useTooltipAnchor({ id: "inline-content", content: <span>{label}</span> });
  return (
    <mesh ref={ref as never}>
      <boxGeometry />
    </mesh>
  );
}

function Fixture() {
  const [label, setLabel] = useState("First label");
  return (
    <TooltipProvider>
      <button type="button" onClick={() => setLabel("Second label")}>
        Change content
      </button>
      <TooltipHost style={{ width: 200, height: 200 }}>
        <Canvas>
          <InlineContentMesh label={label} />
        </Canvas>
      </TooltipHost>
    </TooltipProvider>
  );
}

const storedLabel = () => {
  const content = useTooltipStore.getState().anchors.get("inline-content")?.content as
    | { props: { children: ReactNode } }
    | undefined;
  return content?.props.children;
};

test("an anchor with inline content mounts without re-rendering in a loop, and takes a change", async () => {
  renders = 0;
  await render(<Fixture />);
  await expect.poll(storedLabel).toBe("First label");
  await new Promise((resolve) => setTimeout(resolve, 500));
  // A handful of renders from mounting; a loop runs to React's limit of 50 nested updates.
  expect(renders).toBeLessThan(10);

  const before = renders;
  await page.getByRole("button", { name: "Change content" }).click();
  await expect.poll(storedLabel).toBe("Second label");
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(renders - before).toBeLessThan(5);
});
