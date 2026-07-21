import figma from "@figma/code-connect";
import { Tabs } from "./tabs";

/**
 * Code Connect for Tabs.
 *
 * Validated on the Professional plan via `npx figma connect parse`. File key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * Tabs is data-driven (a `children: TabChild[]` array; the active tab's `variant`
 * drives the indicator color — the Figma `Variant` axis). Rather than force an
 * array through a variant map, the example is illustrative — a small tab set.
 * A tabbed modal is composed from the base Modal + this Tabs row in Figma.
 */
figma.connect(Tabs, "<SEMIO_UI_LIBRARY>?node-id=578-841", {
  example: () => (
    <Tabs selected="tab1" onTabChange={() => undefined}>
      {[
        { key: "tab1", title: "Tab 1", content: null },
        { key: "tab2", title: "Tab 2", content: null },
        { key: "tab3", title: "Tab 3", content: null },
      ]}
    </Tabs>
  ),
});
