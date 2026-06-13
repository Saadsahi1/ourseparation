// Our Separation — Brand Glyph (PNG from the branding kit).
// The PNG lives at /public/logo-icon.png.
export default function BrandGlyph({ size = 32, style, className, alt = 'Our Separation' }) {
  return (
    <img
      src="/logo-icon.png"
      alt={alt}
      width={size}
      height={size}
      style={{ display: 'inline-block', objectFit: 'contain', ...style }}
      className={className}
    />
  )
}
