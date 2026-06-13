// Inline brand glyph — per the 2021 Branding Kit. Renders as `currentColor`
// so callers theme it via `color: <brand-purple>` or `color: #fff`.
export default function BrandGlyph({ size = 32, style, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path d="M 120 40 C 76 40, 40 76, 40 120 C 40 164, 76 200, 120 200 C 152 200, 180 182, 194 154 L 167 140 C 159 158, 141 170, 120 170 C 92 170, 70 148, 70 120 C 70 92, 92 70, 120 70 L 120 40 Z" />
      <path fillRule="evenodd" d="M 134 28 C 167 28, 195 47, 211 76 L 222 96 L 198 90 C 192 110, 175 122, 154 122 C 134 122, 117 110, 110 92 C 116 60, 124 42, 134 28 Z M 146 60 C 158 74, 174 86, 192 94 C 180 80, 165 67, 150 60 Z" />
    </svg>
  )
}
