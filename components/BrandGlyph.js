// Our Separation — Brand Glyph (PNG from the 2021 Branding Kit).
// The PNG lives at /public/logo-icon.png. Pass `variant="white"` to use
// the white-on-purple square version (favicon-style).
export default function BrandGlyph({ size = 32, style, className, alt = 'Our Separation' }) {
  return (
    <img
      src="/logo-icon.png"
      alt={alt}
      width={size}
      height={size}
      style={{ display: 'inline-block', borderRadius: '6px', ...style }}
      className={className}
    />
  )
}
