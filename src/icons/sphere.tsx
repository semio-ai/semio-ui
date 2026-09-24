import { createGlyph } from "./_internal/create-glyph";

/** Model file-type artwork with the authored arc transforms and group opacity. */
export const IconSphere = createGlyph(
  "IconSphere",
  <g fill="none" fillRule="evenodd" clipRule="evenodd" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
    <g opacity={0.5}>
      <g transform="matrix(1,0,0,0.5,0,6)">
        <path d="M22,12C22,17.519 17.519,22 12,22C6.481,22 2,17.519 2,12" strokeWidth={1.9} />
      </g>
      <g transform="matrix(0,-1,0.5,0,6,24)">
        <path d="M22,12C22,17.519 17.519,22 12,22C6.481,22 2,17.519 2,12" strokeWidth={1.9} />
      </g>
    </g>
  </g>,
);
