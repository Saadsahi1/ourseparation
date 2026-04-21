# Logo Setup Guide

## Logo Files Needed

Place the following logo files in the `public/` directory:

### Current Files (provided - batch 1 of 2):
1. **avatar-c.png** - Square avatar with purple background and white glyph
2. **avatar-c.jpg** - Same as above in JPG format
3. **avatar-d.png** - Square avatar with black background and white glyph
4. **glyph-c.png** - Logo glyph only (purple) - **Currently used in app**
5. **glyph-d.png** - Logo glyph only (black)

### Pending Files (batch 2):
6-9. *Awaiting 4 more logo files*

## Current Logo Usage in App

- **Auth Pages (Login/SignUp)**: `/glyph-c.png` (16x16 display)
- **Dashboard Navigation**: `/glyph-c.png` (10x10 display)

## Installation Instructions

Once all logo files are provided:

```bash
# Copy logo files to public directory
cp avatar-c.png public/
cp avatar-c.jpg public/
cp avatar-d.png public/
cp glyph-c.png public/
cp glyph-d.png public/
# ... and remaining 4 files
```

## Logo Variants Expected

Based on branding kit, we expect:
- Glyph versions (icon only)
  - Color (c)
  - Dark (d)
  - White (w) ✓ *already exists*
- Full logo versions with text
  - Color (long-c) ✓ *already exists*
  - Dark (long-d) ✓ *already exists*
  - White (long-w) ✓ *already exists*
- Avatar versions (square backgrounds)
  - Color background (avatar-c)
  - Dark background (avatar-d)

## Next Steps

1. Receive remaining 4 logo files
2. Copy all 9 files to `public/` directory
3. Verify display in application
4. Adjust sizing if needed
