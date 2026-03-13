import { useState, type ReactNode } from "react";
import type { Meta, StoryObj, ReactRenderer } from "@storybook/react-vite";
import { ArgsStoryFn } from "storybook/internal/csf";
import {
  type BreadcrumbElement,
  Breadcrumbs,
  ICON_CLASS_NAME,
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
        icon: <IconDashboard className={ICON_CLASS_NAME} />,
        children: [
          {
            id: "subRoot",
            type: "option",
            options: [
              {
                value: "home",
                label: "Home",
                icon: <IconHome className={ICON_CLASS_NAME} />,
                default: true,
                children: [],
              },
              {
                value: "projects",
                label: "Projects",
                icon: <IconCube className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "animations",
                label: "Animations",
                icon: <IconFileTypeAni className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "faces",
                label: "Faces",
                icon: <IconFileTypeFace className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "models",
                label: "Models",
                icon: <IconFileTypeMod className={ICON_CLASS_NAME} />,
                children: [],
              },
            ],
          },
        ],
      },
      {
        value: "marketplace",
        label: "Marketplace",
        icon: <IconShoppingBag className={ICON_CLASS_NAME} />,
        children: [
          {
            id: "subRoot",
            type: "option",
            options: [
              {
                value: "home",
                label: "Home",
                icon: <IconHome className={ICON_CLASS_NAME} />,
                default: true,
                children: [],
              },
              {
                value: "projects",
                label: "Projects",
                icon: <IconCube className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "animations",
                label: "Animations",
                icon: <IconFileTypeAni className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "faces",
                label: "Faces",
                icon: <IconFileTypeFace className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "models",
                label: "Models",
                icon: <IconFileTypeMod className={ICON_CLASS_NAME} />,
                children: [],
              },
            ],
          },
        ],
      },
      {
        value: "studio",
        label: "Studio",
        icon: <IconHexagonLetterS className={ICON_CLASS_NAME} />,
        children: [
          {
            id: "subRoot",
            type: "option",
            options: [
              {
                value: "aljvnliea",
                label: "Project 1",
                icon: <IconCube className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "sdafskue2",
                label: "Project 2",
                icon: <IconCube className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "sdisd9311",
                label: "Project 3",
                icon: <IconCube className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "lkdfhjweq",
                label: "Project 4",
                icon: <IconCube className={ICON_CLASS_NAME} />,
                children: [],
              },
              {
                value: "aseisdjcl",
                label: "Project 5",
                icon: <IconCube className={ICON_CLASS_NAME} />,
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
