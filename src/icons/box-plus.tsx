import { createGlyph } from "./_internal/create-glyph";

/** Artwork from the supplied box-plus.svg; geometry and transforms are retained; secondary detail uses shared duotone contrast. */
export const IconBoxPlus = createGlyph(
  "IconBoxPlus",
  <g
    fill="currentColor"
    stroke="none"
    strokeLinejoin="miter"
    strokeMiterlimit={4}
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinecap="round"
  >
    <path
      d="M21,7.5L12,12M12,12L3,7.5M12,12L12,21.5"
      fill="none"
      fillRule="nonzero"
      stroke="currentColor"
      strokeOpacity="0.6"
      strokeWidth="1.5"
    />
    <path
      d="M15.953,20.421L15.578,20.618C13.822,21.539 12.944,22 12,22C11.056,22 10.178,21.539 8.422,20.618L6.422,19.569C4.271,18.439 3.195,17.875 2.597,16.86C2,15.846 2,14.583 2,12.059L2,11.941C2,9.417 2,8.154 2.597,7.14C3.195,6.125 4.271,5.561 6.422,4.432L8.422,3.382C10.178,2.461 11.056,2 12,2C12.944,2 13.822,2.461 15.578,3.382L17.578,4.432C19.729,5.561 20.805,6.125 21.403,7.14C22,8.154 22,9.417 22,11.941L22,12.059C22,14.583 22,15.846 21.403,16.86C21.364,16.926 21.323,16.99 21.281,17.052"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <g transform="matrix(1,0,0,1,10,4)">
      <path
        d="M11,15L9,15M9,15L7,15M9,15L9,13M9,15L9,17"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
    </g>
  </g>,
);
