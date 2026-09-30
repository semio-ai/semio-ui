import { createGlyph } from "./_internal/create-glyph";

// File-add and exclamation-mark follow the Solar catalogue SVGs:
// https://github.com/saoudi-h/solar-icons/tree/main/packages/core/svgs
// Hexagon uses BoxMinimalistic's outer contour. See packages/ui/NOTICE.
// Save preserves the supplied floppy.svg artwork; keyboard marks retain Tabler geometry.

export const IconAdd = createGlyph("IconAdd", <path d="M12 4V20M4 12H20" />);

export const IconClose = createGlyph("IconClose", <path d="M5 5L19 19M19 5L5 19" />);

export const IconCheck = createGlyph("IconCheck", <path d="M4 12L9 17L20 6" />);

export const IconMinus = createGlyph("IconMinus", <path d="M4 12H20" />);

export const IconChevronRightPipe = createGlyph(
  "IconChevronRightPipe",
  <>
    <path d="M7 5L14 12L7 19" />
    <path d="M19 4V20" opacity="0.6" />
  </>,
);

export const IconList = createGlyph(
  "IconList",
  <>
    <path d="M9 5H21M9 12H21M9 19H21" opacity="0.6" />
    <g fill="currentColor" stroke="none">
      <circle cx="4" cy="5" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="19" r="1" />
    </g>
  </>,
);

export const IconFitHorizontal = createGlyph(
  "IconFitHorizontal",
  <>
    <path d="M3 12H21" opacity="0.6" />
    <path d="M7 8L3 12L7 16M17 8L21 12L17 16" />
  </>,
);

export const IconHexagon = createGlyph(
  "IconHexagon",
  <path
    d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  />,
);

export const IconExclamationMark = createGlyph(
  "IconExclamationMark",
  <>
    <path d="M12 2V15.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M12 22H12.0001"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const IconAddFile = createGlyph(
  "IconAddFile",
  <>
    <path
      opacity="0.6"
      d="M13 2.5V5C13 7.35702 13 8.53553 13.7322 9.26777C14.4645 10 15.643 10 18 10H21.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      opacity="0.6"
      d="M11 15H9M9 15L7 15M9 15L9 13M9 15L9 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M3.17139 3.17157C4.34296 2 6.23851 2 10.0296 2C11.5546 2 12.3173 2.00011 13.0093 2.26562C13.7012 2.53114 14.2651 3.03857 15.3929 4.05365L19.3516 7.61621C20.6558 8.78998 21.3078 9.3774 21.6538 10.1543C21.9998 10.9312 22 11.8079 22 13.5625V14C22 17.7712 22 19.6566 20.8284 20.8281C19.6569 21.9997 17.7712 22 14 22L9.9969 21.9997C6.22761 21.9997 4.34284 21.9997 3.17157 20.8284C2 19.6569 2 17.7712 2 14V9.9982C2 6.22817 2 4.34296 3.17139 3.17157Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const IconDataVector2 = createGlyph(
  "IconDataVector2",
  <>
    <path d="M3 3V21H21" opacity="0.6" />
    <g fill="currentColor" stroke="none">
      <circle cx="8" cy="15" r="1.5" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </g>
  </>,
);

export const IconDataVector3 = createGlyph(
  "IconDataVector3",
  <>
    <path d="M12 2V13M12 13L3 19M12 13L21 19" opacity="0.6" />
    <g fill="currentColor" stroke="none">
      <circle cx="6" cy="10" r="1.5" />
      <circle cx="16" cy="7" r="1.5" />
      <circle cx="14" cy="19" r="1.5" />
    </g>
  </>,
);

export const IconArrowBigUp = createGlyph(
  "IconArrowBigUp",
  <path d="M9 20v-8h-3.586a1 1 0 0 1 -.707 -1.707l6.586 -6.586a1 1 0 0 1 1.414 0l6.586 6.586a1 1 0 0 1 -.707 1.707h-3.586v8a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1" />,
);

export const IconAt = createGlyph(
  "IconAt",
  <>
    <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0v-1.5a9 9 0 1 0 -5.5 8.28" />
  </>,
);

export const IconLetterC = createGlyph(
  "IconLetterC",
  <path d="M18 9a5 5 0 0 0 -5 -5h-2a5 5 0 0 0 -5 5v6a5 5 0 0 0 5 5h2a5 5 0 0 0 5 -5" />,
);

export const IconLetterV = createGlyph("IconLetterV", <path d="M6 4l6 16l6 -16" />);

export const IconLetterX = createGlyph(
  "IconLetterX",
  <>
    <path d="M7 4l10 16" />
    <path d="M17 4l-10 16" />
  </>,
);

export const IconLetterZ = createGlyph("IconLetterZ", <path d="M7 4h10l-10 16h10" />);

export const IconSave = createGlyph(
  "IconSave",
  <>
    <path
      d="M3.464,20.535C4.929,22 7.286,22 12,22C16.714,22 19.071,22 20.535,20.535C22,19.071 22,14.714 22,10C22,9.659 22,9.488 21.985,9.314C21.914,8.505 21.586,7.713 21.064,7.09C20.952,6.957 20.828,6.833 20.581,6.586L17.414,3.419C17.167,3.172 17.043,3.048 16.91,2.936C16.287,2.414 15.495,2.086 14.686,2.015C14.512,2 12.341,2 12,2C7.286,2 4.929,2 3.464,3.464C2,4.929 2,7.286 2,12C2,16.714 2,19.071 3.464,20.535Z"
      fill="none"
      fillRule="nonzero"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <g transform="matrix(-0.8,-0,0,-0.794792,21.6,20.384561)">
      <path
        d="M17,21.873L17,21C17,19.114 17,18.172 16.414,17.586C15.828,17 14.886,17 13,17L11,17C9.114,17 8.172,17 7.586,17.586C7,18.172 7,19.114 7,21L7,21.873"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="1.88"
      />
    </g>
    <g transform="matrix(0.857143,0,0,0.857143,1.285714,1.714286)">
      <circle
        cx="12.5"
        cy="15.5"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeMiterlimit="1.5"
      />
    </g>
  </>,
);

export const IconSelector = createGlyph("IconSelector", <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />);
export const IconPointFilled = createGlyph(
  "IconPointFilled",
  <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
);
export const IconPercent = createGlyph(
  "IconPercent",
  <>
    <path d="m5 19 14-14" />
    <g opacity="0.6">
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
    </g>
  </>,
);
export const IconListTree = createGlyph(
  "IconListTree",
  <>
    <path opacity="0.6" d="M9 5h12M12 12h9M15 19h6" />
    <g fill="currentColor" stroke="none">
      <circle cx="4" cy="5" r="1" />
      <circle cx="7" cy="12" r="1" />
      <circle cx="10" cy="19" r="1" />
    </g>
  </>,
);

export const IconBezier = createGlyph(
  "IconBezier",
  <>
    <path d="M3 4a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -2" />
    <path d="M17 18a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -2" />
    <path d="M7 5l7 0" />
    <path d="M10 19l7 0" />
    <path d="M8 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M14 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M7 5.5a5 6.5 0 0 1 5 6.5a5 6.5 0 0 0 5 6.5" />
  </>,
);
export const IconFrame = createGlyph("IconFrame", <path d="M12 5v14" />);
export const IconCircle = createGlyph("IconCircle", <circle cx="12" cy="12" r="9" />);
export const IconPoint = createGlyph("IconPoint", <circle cx="12" cy="12" r="4" />);
