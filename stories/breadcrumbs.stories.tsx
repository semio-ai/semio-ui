import { useState, type ReactNode } from "react";
import type { Meta, StoryObj, ReactRenderer } from "@storybook/react";
import { type ArgsStoryFn } from "@storybook/core/csf";
import {
  type BreadcrumbElement,
  Breadcrumbs,
  IconFileTypeAni,
  IconFileTypeMod,
  IconFileTypeFace,
  IconHome,
  Size,
  Variant,
  type BreadcrumbsProps,
} from "@semio/ui";
import { IconCube, IconDashboard, IconHexagonLetterS, IconShoppingBag } from "@tabler/icons-react";
// import { IconChevronDown } from "@tabler/icons-react";
// import { NestedExample } from "./nested-example";

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  title: "ui/Breadcrumbs",
  decorators: [
    (Story) => (
      <div className="grid place-items-center p-5 h-full">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

function BreadcrumbsRenderer(props: BreadcrumbsProps): ReactNode {
  const [values, setValues] = useState<Record<string, string | undefined>>(props.values);

  return <Breadcrumbs {...props} values={values} onChange={setValues} />;
}

const STATIC_ELEMENTS: BreadcrumbElement[] = [
  {
    id: "root",
    type: "option",
    options: [
      {
        value: "dashboard",
        label: "Dashboard",
        icon: <IconDashboard className="h-3/5 aspect-square" />,
        children: [
          {
            id: "subRoot",
            type: "option",
            options: [
              {
                value: "home",
                label: "Home",
                icon: <IconHome className="h-3/5 aspect-square" />,
                default: true,
                children: [],
              },
              {
                value: "projects",
                label: "Projects",
                icon: <IconCube className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "animations",
                label: "Animations",
                icon: <IconFileTypeAni className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "faces",
                label: "Faces",
                icon: <IconFileTypeFace className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "models",
                label: "Models",
                icon: <IconFileTypeMod className="h-3/5 aspect-square" />,
                children: [],
              },
            ],
          },
        ],
      },
      {
        value: "marketplace",
        label: "Marketplace",
        icon: <IconShoppingBag className="h-3/5 aspect-square" />,
        children: [
          {
            id: "subRoot",
            type: "option",
            options: [
              {
                value: "home",
                label: "Home",
                icon: <IconHome className="h-3/5 aspect-square" />,
                default: true,
                children: [],
              },
              {
                value: "projects",
                label: "Projects",
                icon: <IconCube className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "animations",
                label: "Animations",
                icon: <IconFileTypeAni className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "faces",
                label: "Faces",
                icon: <IconFileTypeFace className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "models",
                label: "Models",
                icon: <IconFileTypeMod className="h-3/5 aspect-square" />,
                children: [],
              },
            ],
          },
        ],
      },
      {
        value: "studio",
        label: "Studio",
        icon: <IconHexagonLetterS className="h-3/5 aspect-square" />,
        children: [
          {
            id: "subRoot",
            type: "option",
            options: [
              {
                value: "aljvnliea",
                label: "Project 1",
                icon: <IconCube className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "sdafskue2",
                label: "Project 2",
                icon: <IconCube className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "sdisd9311",
                label: "Project 3",
                icon: <IconCube className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "lkdfhjweq",
                label: "Project 4",
                icon: <IconCube className="h-3/5 aspect-square" />,
                children: [],
              },
              {
                value: "aseisdjcl",
                label: "Project 5",
                icon: <IconCube className="h-3/5 aspect-square" />,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
  },
};

export const Primary: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    variant: Variant.Tertiary,
  },
};

export const ExtraSmall: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    size: Size.Xs,
  },
};

export const Small: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    size: Size.Sm,
  },
};

export const Medium: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    size: Size.Md,
  },
};

export const Large: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    size: Size.Lg,
  },
};

export const ExtraLarge: Story = {
  render: BreadcrumbsRenderer as ArgsStoryFn<ReactRenderer, BreadcrumbsProps>,
  args: {
    values: { root: "dashboard", subRoot: "projects", subSubRoot: "account" },
    elements: STATIC_ELEMENTS,
    size: Size.Xl,
  },
};
