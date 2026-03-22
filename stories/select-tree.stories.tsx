import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SelectTree,
  Size,
  Variant,
  type TreeOption,
  type SelectTreeProps,
  ICON_CLASS_NAME,
} from "@semio/ui";
import {
  IconFolder,
  IconFile,
  IconFileTypeJs,
  IconFileTypeCss,
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

const meta: Meta<typeof SelectTree> = {
  component: SelectTree,
  title: "ui/SelectTree",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <div className="w-80 max-w-full">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SelectTree>;

// Controlled wrapper for stories
function SelectTreeWrapper(
  props: Omit<SelectTreeProps, "value" | "onChange"> & { initialValues?: string[] },
): ReactNode {
  const [values, setValues] = useState<string[]>(props.initialValues ?? []);
  return <SelectTree {...props} value={values} onChange={setValues} />;
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
    value: "package.json",
    label: "package.json",
    icon: <IconPackage className={ICON_CLASS_NAME} />,
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

export const Default: Story = {
  render: (props) => <SelectTreeWrapper {...props} />,
  args: {
    options: simpleTreeOptions,
    label: "Select files",
    variant: Variant.Default,
  },
};

export const CompleteSubgroup: Story = {
  render: (props) => <SelectTreeWrapper {...props} initialValues={["keynote", "demo"]} />,
  args: {
    options: simpleTreeOptions,
    label: "Select files",
    variant: Variant.Primary,
  },
};

export const PartialSubgroup: Story = {
  render: (props) => <SelectTreeWrapper {...props} initialValues={["q1-report", "q2-report"]} />,
  args: {
    options: simpleTreeOptions,
    label: "Select files",
    variant: Variant.Secondary,
  },
};

export const MultipleCompleteGroups: Story = {
  render: (props) => (
    <SelectTreeWrapper
      {...props}
      initialValues={[
        "keynote",
        "demo", // Complete "Presentations" group
        "photos",
        "screenshots", // Complete "Images" group
      ]}
    />
  ),
  args: {
    options: simpleTreeOptions,
    label: "Select files",
    variant: Variant.Success,
  },
};

export const SingleSelection: Story = {
  render: (props) => <SelectTreeWrapper {...props} initialValues={["Button.tsx"]} />,
  args: {
    options: projectTreeOptions,
    label: "Project files",
    variant: Variant.Primary,
  },
};

export const ComprehensiveDemo: Story = {
  render: (props) => {
    const [values, setValues] = useState<string[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <SelectTree {...props} value={values} onChange={setValues} />
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          <div className="mb-2 text-sm font-semibold">Demo Scenarios (Click to apply):</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setValues(["keynote", "demo"])}
              className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
            >
              Complete Subgroup (Presentations)
            </button>
            <button
              type="button"
              onClick={() => setValues(["q1-report", "q2-report"])}
              className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
            >
              Partial Group (2/3 Reports)
            </button>
            <button
              type="button"
              onClick={() => setValues(["q1-report", "q2-report", "q3-report", "keynote", "demo"])}
              className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600"
            >
              Complete Documents
            </button>
            <button
              type="button"
              onClick={() => setValues(["keynote", "demo", "photos", "screenshots"])}
              className="rounded bg-yellow-600 px-3 py-1 text-xs text-white hover:bg-yellow-700"
            >
              Multiple Complete Groups
            </button>
            <button
              type="button"
              onClick={() => setValues(["q1-report", "photos"])}
              className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
            >
              Mixed Selection
            </button>
            <button
              type="button"
              onClick={() => setValues([])}
              className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            Selected values: {values.length === 0 ? "None" : values.join(", ")}
          </div>
        </div>
      </div>
    );
  },
  args: {
    options: simpleTreeOptions,
    label: "Interactive Demo",
    variant: Variant.Primary,
    size: Size.Md,
  },
};

export const GroupFullySelected: Story = {
  render: (props) => (
    <SelectTreeWrapper {...props} initialValues={["global.css", "components.css"]} />
  ),
  args: {
    options: projectTreeOptions,
    label: "Project files",
    variant: Variant.Secondary,
  },
};

export const PartialSelection: Story = {
  render: (props) => (
    <SelectTreeWrapper {...props} initialValues={["Button.tsx", "Modal.tsx", "api.ts"]} />
  ),
  args: {
    options: projectTreeOptions,
    label: "Project files",
    variant: Variant.Success,
  },
};

export const CompleteNestedGroup: Story = {
  render: (props) => (
    <SelectTreeWrapper {...props} initialValues={["Button.test.tsx", "Modal.test.tsx"]} />
  ),
  args: {
    options: projectTreeOptions,
    label: "Project files",
    variant: Variant.Info,
  },
};

export const PartialNestedGroup: Story = {
  render: (props) => <SelectTreeWrapper {...props} initialValues={["Button.tsx", "Modal.tsx"]} />,
  args: {
    options: projectTreeOptions,
    label: "Project files",
    variant: Variant.Warning,
  },
};

export const AllSelected: Story = {
  render: (props) => (
    <SelectTreeWrapper
      {...props}
      initialValues={[
        "Button.tsx",
        "Modal.tsx",
        "Card.tsx",
        "global.css",
        "components.css",
        "api.ts",
        "helpers.ts",
        "constants.ts",
        "Button.test.tsx",
        "Modal.test.tsx",
        "api.test.ts",
        "package.json",
      ]}
    />
  ),
  args: {
    options: projectTreeOptions,
    label: "Project files",
    variant: Variant.Warning,
  },
};

export const WithoutChips: Story = {
  render: (props) => (
    <SelectTreeWrapper {...props} initialValues={["react", "nodejs", "postgresql"]} />
  ),
  args: {
    options: serviceCategories,
    label: "Select technologies",
    variant: Variant.Info,
    showChips: false,
  },
};

export const SmallSize: Story = {
  render: (props) => <SelectTreeWrapper {...props} initialValues={["q1-report", "q2-report"]} />,
  args: {
    options: simpleTreeOptions,
    label: "Documents",
    size: Size.Sm,
    variant: Variant.Primary,
  },
};

export const LargeSize: Story = {
  render: (props) => <SelectTreeWrapper {...props} initialValues={["photos", "screenshots"]} />,
  args: {
    options: simpleTreeOptions,
    label: "Media files",
    size: Size.Lg,
    variant: Variant.Secondary,
  },
};

export const WithColors: Story = {
  render: (props) => <SelectTreeWrapper {...props} initialValues={["vue", "python", "mongodb"]} />,
  args: {
    options: serviceCategories,
    label: "Tech stack",
    variant: Variant.Default,
  },
};

export const MixedVariants: Story = {
  render: (props) => (
    <SelectTreeWrapper {...props} initialValues={["react", "angular", "nodejs", "java"]} />
  ),
  args: {
    options: serviceCategories,
    label: "Mixed selection",
    variant: Variant.Default,
  },
};

export const EmptySelection: Story = {
  render: (props) => <SelectTreeWrapper {...props} />,
  args: {
    options: projectTreeOptions,
    label: "Select project files",
    variant: Variant.Error,
  },
};

export const LongTextWithEllipsis: Story = {
  render: (props) => (
    <div className="w-48 overflow-hidden">
      <SelectTreeWrapper
        {...props}
        initialValues={[
          "very-long-file-name-1",
          "very-long-file-name-2",
          "very-long-file-name-3",
          "very-long-file-name-4",
          "very-long-file-name-5",
        ]}
      />
    </div>
  ),
  args: {
    options: [
      {
        value: "very-long-group",
        label: "This is a very long group name that should definitely trigger text ellipsis",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "very-long-file-name-1",
            label: "This is an extremely long file name that will test the ellipsis functionality",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "very-long-file-name-2",
            label: "Another ridiculously long file name to ensure overflow handling works",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "very-long-file-name-3",
            label: "Yet another super long file name for testing purposes",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "very-long-file-name-4",
            label: "One more incredibly lengthy file name to test",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "very-long-file-name-5",
            label: "Final extremely long file name in this group",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "another-long-group",
        label: "Another group with an extraordinarily long name that exceeds normal bounds",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "short-1",
            label: "Short name 1",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "short-2",
            label: "Short name 2",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
    ],
    label: "Files with very long names",
    variant: Variant.Info,
  },
};

export const MultipleGroupsLongNames: Story = {
  render: (props) => (
    <div className="w-64 overflow-hidden">
      <SelectTreeWrapper
        {...props}
        initialValues={[
          // Complete first group
          "file-a1",
          "file-a2",
          "file-a3",
          // Complete second group
          "file-b1",
          "file-b2",
          "file-b3",
          // Complete third group
          "file-c1",
          "file-c2",
          "file-c3",
        ]}
      />
    </div>
  ),
  args: {
    options: [
      {
        value: "group-a",
        label: "Very Long Group Name That Could Cause Issues",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          { value: "file-a1", label: "File A1", icon: <IconFile className={ICON_CLASS_NAME} /> },
          { value: "file-a2", label: "File A2", icon: <IconFile className={ICON_CLASS_NAME} /> },
          { value: "file-a3", label: "File A3", icon: <IconFile className={ICON_CLASS_NAME} /> },
        ],
      },
      {
        value: "group-b",
        label: "Another Extremely Long Group Name For Testing",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          { value: "file-b1", label: "File B1", icon: <IconFile className={ICON_CLASS_NAME} /> },
          { value: "file-b2", label: "File B2", icon: <IconFile className={ICON_CLASS_NAME} /> },
          { value: "file-b3", label: "File B3", icon: <IconFile className={ICON_CLASS_NAME} /> },
        ],
      },
      {
        value: "group-c",
        label: "Yet Another Super Long Group Name Here",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          { value: "file-c1", label: "File C1", icon: <IconFile className={ICON_CLASS_NAME} /> },
          { value: "file-c2", label: "File C2", icon: <IconFile className={ICON_CLASS_NAME} /> },
          { value: "file-c3", label: "File C3", icon: <IconFile className={ICON_CLASS_NAME} /> },
        ],
      },
    ],
    label: "Testing long group names with ellipsis",
    variant: Variant.Warning,
  },
};

export const NarrowContainerEllipsis: Story = {
  render: (props) => (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Container width: 150px - Text should show ellipsis
      </div>
      <div className="w-37.5 overflow-hidden border border-gray-300 p-2 dark:border-gray-700">
        <SelectTreeWrapper
          {...props}
          initialValues={[
            "very-long-file-1",
            "very-long-file-2",
            "very-long-file-3",
            "very-long-file-4",
          ]}
        />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Container width: 200px - Slightly more room
      </div>
      <div className="w-50 overflow-hidden border border-gray-300 p-2 dark:border-gray-700">
        <SelectTreeWrapper
          {...props}
          initialValues={["group1-file1", "group1-file2", "group2-file1", "group2-file2"]}
        />
      </div>
    </div>
  ),
  args: {
    options: [
      {
        value: "group1",
        label: "This is an extremely long group name that definitely won't fit",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "very-long-file-1",
            label: "Very long file name number one",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "very-long-file-2",
            label: "Very long file name number two",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "group2",
        label: "Another ridiculously long group name for testing",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "very-long-file-3",
            label: "Very long file name number three",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "very-long-file-4",
            label: "Very long file name number four",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "group3",
        label: "Short group",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "group1-file1",
            label: "File 1",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "group1-file2",
            label: "File 2",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
      {
        value: "group4",
        label: "Another group",
        icon: <IconFolder className={ICON_CLASS_NAME} />,
        children: [
          {
            value: "group2-file1",
            label: "File A",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
          {
            value: "group2-file2",
            label: "File B",
            icon: <IconFile className={ICON_CLASS_NAME} />,
          },
        ],
      },
    ],
    label: "Narrow container test",
    variant: Variant.Primary,
    size: Size.Sm,
    showChips: false,
  },
};

export const ComplexTree: Story = {
  render: (props) => (
    <SelectTreeWrapper
      {...props}
      initialValues={["q1-report", "keynote", "Button.tsx", "global.css", "api.test.ts"]}
    />
  ),
  args: {
    options: [...simpleTreeOptions, ...projectTreeOptions],
    label: "All files",
    variant: Variant.Tertiary,
  },
};
