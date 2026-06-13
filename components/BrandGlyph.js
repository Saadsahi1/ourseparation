// Inline brand glyph — per the 2021 Branding Kit. Renders as `currentColor`
// so callers theme it via `color: <brand-purple>` or `color: #fff`.
//
// Two pieces:
//   1. an open ring (C-shape) drawn as a thick stroked partial circle
//   2. a tilted almond/leaf with a hollow interior and a small triangular tail
//
// If you have the official .svg from the kit, drop its paths in place of
// the two paths below — every consumer (Nav, footer, favicon) picks it up.
export default function BrandGlyph({ size = 32, style, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      width={size}
      height={size}
      aria-hidden="true"
      style={style}
      className={className}
    >
      {/* C-ring — stroked arc, butt caps so the ends are flat like the kit */}
      <path
        d="M 89.5 73.6 A 60 60 0 1 1 170 130"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="butt"
        fill="none"
      />
      {/* Leaf with hollow eye + small tail, using even-odd fill */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="
          M 115 138
          C 100 55, 145 38, 213 60
          C 220 90, 220 112, 200 124
          L 224 150
          L 208 154
          L 190 132
          C 165 142, 130 142, 115 138 Z
          M 132 122
          C 122 75, 160 58, 200 78
          C 210 105, 182 130, 132 122 Z
        "
      />
    </svg>
  )
}
