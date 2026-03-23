import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Dropdown,
  ContextMenu,
  Size,
  Variant,
  NestedCheckboxTree,
  type TreeOption,
  type NestedCheckboxTreeProps,
  NestedParentProvider,
  NestedParent,
  ICON_CLASS_NAME,
} from "@semio/ui";
import {
  IconChevronDown,
  IconFolder,
  IconFile,
  IconFileTypeJs,
  IconFileTypeCss,
  IconFileTypeHtml,
  IconBrandReact,
  IconBrandNodejs,
  IconPackage,
  IconCode,
  IconDatabase,
  IconApi,
  IconServer,
  IconDeviceDesktop,
  IconTestPipe,
} from "@tabler/icons-react";

const meta: Meta<typeof NestedCheckboxTree> = {
  component: NestedCheckboxTree,
  title: "ui/NestedCheckboxTree",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NestedCheckboxTree>;

// Wrapper for dropdown context
function DropdownCheckboxTree(props: NestedCheckboxTreeProps): ReactNode {
  const [values, setValues] = useState<string[]>(props.values);

  return (
    <Dropdown
      variant={props.variant}
      trigger={
        <Button
          variant={props.variant}
          rightIcon={<IconChevronDown className="h-3/5 w-3/5" />}
          size={Size.Sm}
        >
          Select Items ({values.length} selected)
        </Button>
      }
    >
      <NestedParentProvider value={NestedParent.Dropdown}>
        <NestedCheckboxTree {...props} values={values} onChange={setValues} />
      </NestedParentProvider>
    </Dropdown>
  );
}

// Wrapper for context menu
function ContextMenuCheckboxTree(props: NestedCheckboxTreeProps): ReactNode {
  const [values, setValues] = useState<string[]>(props.values);

  return (
    <ContextMenu
      variant={props.variant}
      content={
        <NestedParentProvider value={NestedParent.Context}>
          <NestedCheckboxTree {...props} values={values} onChange={setValues} />
        </NestedParentProvider>
      }
    >
      <div
        className={`card grid h-52 w-96 place-items-center p-5 ${props.variant ?? "default"} variant-static-text`}
      >
        Right Click Me
        <div className="mt-2 text-sm opacity-60">{values.length} items selected</div>
      </div>
    </ContextMenu>
  );
}

// Simple tree options
const simpleTreeOptions: TreeOption[] = [
  {
    value: "documents",
    label: "Documents",
    icon: <IconFolder className={ICON_CLASS_NAME} />,
    children: [
      {
        value: "reports",
        label: "Reports",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "q1-report",
            label: "Q1 Report",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "q2-report",
            label: "Q2 Report",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "q3-report",
            label: "Q3 Report",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "presentations",
        label: "Presentations",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "keynote",
            label: "Keynote",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "demo",
            label: "Demo",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
    ],
  },
  {
    value: "images",
    label: "Images",
    icon: <IconFolder className={ICON_CLASS_NAME} />,
    children: [
      {
        value: "photos",
        label: "Photos",
        icon: <IconFile className={ICON_CLASS_NAME} />,
      },
      {
        value: "screenshots",
        label: "Screenshots",
        icon: <IconFile className={ICON_CLASS_NAME} />,
      },
    ],
  },
];

// Project structure tree options
const projectTreeOptions: TreeOption[] = [
  {
    value: "src",
    label: "src",
    icon: <IconFolder className={ICON_CLASS_NAME} />,
    color: "#3498db",
    children: [
      {
        value: "components",
        label: "components",
        icon: <IconBrandReact className={ICON_CLASS_NAME} />,
        color: "#61DAFB",
        children: [
          {
            value: "Button.tsx",
            label: "Button.tsx",
            icon: <IconBrandReact className={ICON_CLASS_NAME} />,
          },
          {
            value: "Modal.tsx",
            label: "Modal.tsx",
            icon: <IconBrandReact className={ICON_CLASS_NAME} />,
          },
          {
            value: "Card.tsx",
            label: "Card.tsx",
            icon: <IconBrandReact className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "styles",
        label: "styles",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        color: "#9b59b6",
        children: [
          {
            value: "global.css",
            label: "global.css",
            icon: <IconFileTypeCss className={ICON_CLASS_NAME} />,
          },
          {
            value: "components.css",
            label: "components.css",
            icon: <IconFileTypeCss className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "utils",
        label: "utils",
        icon: <IconCode className={ICON_CLASS_NAME} />,
        color: "#2ecc71",
        children: [
          {
            value: "api.ts",
            label: "api.ts",
            icon: <IconApi className={ICON_CLASS_NAME} />,
          },
          {
            value: "helpers.ts",
            label: "helpers.ts",
            icon: <IconFileTypeJs className={ICON_CLASS_NAME} />,
          },
          {
            value: "constants.ts",
            label: "constants.ts",
            icon: <IconFileTypeJs className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "pages",
        label: "pages",
        icon: <IconFileTypeHtml className={ICON_CLASS_NAME} />,
        color: "#e74c3c",
        children: [
          {
            value: "index.html",
            label: "index.html",
            icon: <IconFileTypeHtml className={ICON_CLASS_NAME} />,
          },
          {
            value: "about.html",
            label: "about.html",
            icon: <IconFileTypeHtml className={ICON_CLASS_NAME} />,
          },
        ],
      },
    ],
  },
  {
    value: "tests",
    label: "tests",
    icon: <IconTestPipe className={ICON_CLASS_NAME} />,
    color: "#f39c12",
    children: [
      {
        value: "unit",
        label: "unit",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "Button.test.tsx",
            label: "Button.test.tsx",
            icon: <IconTestPipe className={ICON_CLASS_NAME} />,
          },
          {
            value: "Modal.test.tsx",
            label: "Modal.test.tsx",
            icon: <IconTestPipe className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "integration",
        label: "integration",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "api.test.ts",
            label: "api.test.ts",
            icon: <IconTestPipe className={ICON_CLASS_NAME} />,
          },
        ],
      },
    ],
  },
  {
    value: "node_modules",
    label: "node_modules",
    icon: <IconBrandNodejs className={ICON_CLASS_NAME} />,
    disabled: true,
    children: [],
  },
  {
    value: "package.json",
    label: "package.json",
    icon: <IconPackage className={ICON_CLASS_NAME} />,
  },
];

// Deep nested tree options
const deepTreeOptions: TreeOption[] = [
  {
    value: "level-1",
    label: "Level 1",
    children: [
      {
        value: "level-1-1",
        label: "Level 1.1",
        children: [
          {
            value: "level-1-1-1",
            label: "Level 1.1.1",
            children: [
              {
                value: "level-1-1-1-1",
                label: "Level 1.1.1.1",
                children: [
                  {
                    value: "level-1-1-1-1-1",
                    label: "Level 1.1.1.1.1 (Leaf)",
                  },
                ],
              },
            ],
          },
          {
            value: "level-1-1-2",
            label: "Level 1.1.2",
          },
        ],
      },
      {
        value: "level-1-2",
        label: "Level 1.2",
        children: [
          {
            value: "level-1-2-1",
            label: "Level 1.2.1",
          },
        ],
      },
    ],
  },
  {
    value: "level-2",
    label: "Level 2",
    children: [
      {
        value: "level-2-1",
        label: "Level 2.1",
      },
    ],
  },
];

// Service categories tree
const serviceCategories: TreeOption[] = [
  {
    value: "frontend",
    label: "Frontend",
    icon: <IconDeviceDesktop className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    children: [
      {
        value: "react",
        label: "React",
        icon: <IconBrandReact className={ICON_CLASS_NAME} />,
      },
      {
        value: "vue",
        label: "Vue",
        color: "#4FC08D",
      },
      {
        value: "angular",
        label: "Angular",
        color: "#DD0031",
      },
    ],
  },
  {
    value: "backend",
    label: "Backend",
    icon: <IconServer className={ICON_CLASS_NAME} />,
    variant: Variant.Secondary,
    children: [
      {
        value: "nodejs",
        label: "Node.js",
        icon: <IconBrandNodejs className={ICON_CLASS_NAME} />,
      },
      {
        value: "python",
        label: "Python",
        color: "#3776AB",
      },
      {
        value: "java",
        label: "Java",
        color: "#007396",
      },
    ],
  },
  {
    value: "database",
    label: "Database",
    icon: <IconDatabase className={ICON_CLASS_NAME} />,
    variant: Variant.Tertiary,
    children: [
      {
        value: "postgresql",
        label: "PostgreSQL",
        color: "#4169E1",
      },
      {
        value: "mongodb",
        label: "MongoDB",
        color: "#47A248",
      },
      {
        value: "redis",
        label: "Redis",
        color: "#DC382D",
      },
    ],
  },
];

export const BasicDropdown: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    values: [],
    options: simpleTreeOptions,
    variant: Variant.Default,
  },
};

export const BasicContextMenu: Story = {
  render: (props) => <ContextMenuCheckboxTree {...props} />,
  args: {
    values: [],
    options: simpleTreeOptions,
    variant: Variant.Default,
  },
};

export const ProjectStructure: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    // Shows mixed selection states (groups automatically reflect children):
    // - components: indeterminate (2/3 files selected)
    // - src: indeterminate (components partially selected)
    // Note: only leaf values are stored, groups auto-calculate their state from children
    values: ["Button.tsx", "Modal.tsx"],
    options: projectTreeOptions,
    variant: Variant.Primary,
  },
};

export const DeepNesting: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    values: ["level-1-1-1", "level-1-1-1-1", "level-1-1-1-1-1"],
    options: deepTreeOptions,
    variant: Variant.Secondary,
  },
};

export const ServiceCategories: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    // Groups automatically reflect their children's state:
    // - frontend: indeterminate (1/3 selected - only react)
    // - backend: indeterminate (1/3 selected - only nodejs)
    // - database: unchecked (0/3 selected)
    // Note: only leaf node values are stored in the array
    values: ["react", "nodejs"],
    options: serviceCategories,
    variant: Variant.Default,
  },
};

export const WithColors: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    values: ["src", "components", "styles"],
    options: projectTreeOptions,
    variant: Variant.Info,
  },
};

export const PartiallySelected: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    // Groups automatically show state based on their children:
    // - components: indeterminate (2/3 selected)
    // - styles: indeterminate (1/2 selected)
    // - utils: checked (all 3/3 children selected)
    // - pages: unchecked (0/2 selected)
    // - src: indeterminate (mixed children)
    // Only leaf values are stored:
    values: [
      "Button.tsx",
      "Modal.tsx",
      "global.css",
      // All utils leaf nodes (group shows as checked automatically)
      "api.ts",
      "helpers.ts",
      "constants.ts",
    ],
    options: projectTreeOptions,
    variant: Variant.Success,
  },
};

export const IndeterminateStates: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    // Groups automatically reflect their leaf children:
    // - src/components: indeterminate (1/3 selected - only Button.tsx)
    // - src/styles: checked (all 2/2 leaf nodes selected)
    // - src/utils: unchecked (0/3 selected)
    // - src/pages: checked (all 2/2 leaf nodes selected)
    // - src: indeterminate (mixed children)
    // - tests/unit: indeterminate (1/2 selected - only Button.test.tsx)
    // - tests/integration: unchecked (0/1 selected)
    // - tests: indeterminate (mixed children)
    // Only leaf node values in array:
    values: [
      "Button.tsx",
      // All styles leaf nodes
      "global.css",
      "components.css",
      // All pages leaf nodes
      "index.html",
      "about.html",
      "Button.test.tsx",
    ],
    options: projectTreeOptions,
    variant: Variant.Info,
  },
};

export const AllSelected: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    // All leaf nodes selected - groups automatically show as checked:
    // - src: checked (all leaf descendants selected)
    // - tests: checked (all leaf descendants selected)
    // Note: array contains only leaf node IDs, no group IDs
    values: [
      // All component files
      "Button.tsx",
      "Modal.tsx",
      "Card.tsx",
      // All style files
      "global.css",
      "components.css",
      // All util files
      "api.ts",
      "helpers.ts",
      "constants.ts",
      // All page files
      "index.html",
      "about.html",
      // All test files
      "Button.test.tsx",
      "Modal.test.tsx",
      "api.test.ts",
      // Root file
      "package.json",
    ],
    options: projectTreeOptions,
    variant: Variant.Warning,
  },
};

export const WithDisabled: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    values: [],
    options: projectTreeOptions,
    variant: Variant.Error,
  },
};

export const ThreeStateDemo: Story = {
  render: (props) => <DropdownCheckboxTree {...props} />,
  args: {
    // Groups automatically reflect their leaf children's state:
    // 1. UNCHECKED: "utils" - no leaf nodes selected (shows point/dot)
    // 2. INDETERMINATE: "components" - 1/3 leaf nodes selected (shows minus in outlined box)
    // 3. CHECKED: "styles" - all leaf nodes selected (shows check in filled box)
    // Only leaf values in array:
    values: [
      // For INDETERMINATE state - select only 1 of 3 component files
      "Button.tsx",
      // For CHECKED state - select all style files
      "global.css",
      "components.css",
      // Leave utils completely unchecked for comparison
    ],
    options: projectTreeOptions
      .filter(
        (opt) =>
          // Only show src folder to focus on the three states
          opt.value === "src",
      )
      .map((src) => ({
        ...src,
        children: src.children?.filter((child) =>
          // Only show components, styles, and utils for clear comparison
          ["components", "styles", "utils"].includes(child.value),
        ),
      })),
    variant: Variant.Primary,
  },
};
