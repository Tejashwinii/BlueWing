# BlueWing Airlines - Design System Quick Reference

## 🎨 Color Palette

### Primary Colors
- **Deep Navy Blue**: `#001a4d` - Primary brand color, navbar background
- **Ocean Blue**: `#0066ff` - Buttons, links, primary elements
- **Royal Blue**: `#003d99` - Hover states, gradients
- **Cyan Accent**: `#00d4ff` - Highlights, animations, hover effects

### Neutral Colors
- **White**: `#ffffff` - Cards, backgrounds, text
- **Light Gray**: `#f5f7fa` - Secondary backgrounds
- **Lighter Gray**: `#e9ecef` - Tertiary backgrounds
- **Text Primary**: `#333333` - Main text
- **Text Muted**: `#666666` - Secondary text
- **Border**: `#e0e8f5` - Card borders

### Status Colors
- **Success**: `#00a86b` - Green for success messages
- **Error**: `#d9534f` - Red for error states
- **Warning**: `#ff9800` - Orange for warnings
- **Info**: `#0066ff` - Blue for information

---

## 🔤 Typography

### Font Family
```
'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
```

### Heading Hierarchy
```
H1: 48px, Weight 800, Line-height 1.2
H2: 36px, Weight 700, Line-height 1.3
H3: 28px, Weight 700, Line-height 1.4
H4: 22px, Weight 700, Line-height 1.5
H5: 18px, Weight 700, Line-height 1.5
H6: 16px, Weight 700, Line-height 1.6
```

### Body Text
```
Body:      14px, Weight 400, Line-height 1.6
Large:     16px, Weight 400, Line-height 1.6
Small:     12px, Weight 400, Line-height 1.6
Label:     13px, Weight 600, Letter-spacing 0.5px
```

---

## 📏 Spacing Scale

```
xs:   4px   - Tiny gaps
sm:   8px   - Small spacing
md:   16px  - Standard spacing (default)
lg:   24px  - Large spacing
xl:   32px  - Extra large spacing
2xl:  40px  - Massive spacing
```

---

## 🎯 Border Radius

```
sm:   6px    - Slight rounding
md:   12px   - Standard cards
lg:   16px   - Larger components
xl:   20px   - Extra rounded
full: 9999px - Fully rounded (pills)
```

---

## 🎬 Animations

### Timing
```
Fast:  0.15s (Quick interactions)
Base:  0.3s  (Standard animations)
Slow:  0.5s  (Delayed effects)
```

### Easing Function
```
cubic-bezier(0.4, 0, 0.2, 1)
```

### Common Animations
- **Fade In**: Opacity 0 → 1
- **Slide Up**: Transform Y 20px → 0
- **Scale**: Transform 0.95 → 1.0
- **Hover**: Lift effect with shadow increase

---

## 💫 Shadow System

```
SM:  0 2px 8px rgba(0, 26, 77, 0.08)
MD:  0 4px 16px rgba(0, 26, 77, 0.12)
LG:  0 8px 24px rgba(0, 26, 77, 0.15)
XL:  0 12px 40px rgba(0, 26, 77, 0.2)
```

### Usage
- **Rest State**: SM shadow
- **Hover State**: LG shadow
- **Focus State**: MD shadow + color border
- **Modals**: XL shadow

---

## 🎨 Component Styles

### Buttons
```
Primary:
  Background: Linear gradient #0066ff → #0052a3
  Color: White
  Padding: 12px 24px
  Border-radius: 12px
  Shadow: 0 4px 15px rgba(0, 212, 255, 0.3)
  
Hover:
  Transform: translateY(-2px)
  Shadow: 0 6px 20px rgba(0, 212, 255, 0.4)
```

### Cards
```
Background: White
Border: 1px solid rgba(0, 102, 255, 0.1)
Border-radius: 16px
Shadow: 0 4px 16px rgba(0, 26, 77, 0.08)
Padding: 20-32px

Hover:
  Shadow: 0 8px 24px rgba(0, 26, 77, 0.12)
  Border-color: rgba(0, 102, 255, 0.2)
```

### Forms
```
Input:
  Padding: 12px 16px
  Border: 1px solid #e0e8f5
  Border-radius: 12px
  Font-size: 14px
  
Focus:
  Border-color: #0066ff
  Box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1)
  
Error:
  Border-color: #d9534f
  Box-shadow: 0 0 0 3px rgba(217, 83, 79, 0.1)
```

### Gradients
```
Navbar: linear-gradient(135deg, #001a4d 0%, #003d99 100%)
Hero: linear-gradient(135deg, #001a4d 0%, #003d99 50%, #0066ff 100%)
Button: linear-gradient(135deg, #0066ff, #0052a3)
Login CTA: linear-gradient(135deg, #00d4ff, #0099ff)
Background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)
```

---

## 📱 Responsive Breakpoints

```
Desktop:  > 1024px (Full layout)
Tablet:   768px - 1024px (2 columns)
Mobile:   < 768px (Single column)
Small Mobile: < 480px (Optimized layout)
```

### Navbar Height
```
Desktop: 70px
Mobile: 60px
```

### Typography Scaling
```
Desktop H1: 48px → Tablet: 40px → Mobile: 32px → Small: 24px
Desktop H2: 36px → Tablet: 32px → Mobile: 28px → Small: 20px
```

---

## 🎯 Z-Index Scale

```
0:    Default
10:   Dropdowns
100:  Modals
1000: Navbar
1001: Navbar dropdowns
1002: Profile dropdown
```

---

## ✨ Design Principles

1. **Simplicity**: Clean, uncluttered interfaces
2. **Consistency**: Unified design language across all pages
3. **Accessibility**: High contrast, keyboard navigation
4. **Performance**: Hardware-accelerated animations
5. **Responsiveness**: Mobile-first approach
6. **Professionalism**: Airline-grade quality

---

## 🚀 Component Quick Start

### Use Primary Button
```jsx
<button className="btn btn-primary">Action</button>
```

### Use Card Component
```jsx
<div className="card">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

### Use Utility Classes
```html
<div class="mt-lg mb-md p-lg rounded-lg">
  Content with spacing and rounded corners
</div>
```

---

## 📋 Accessibility Checklist

- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Minimum touch target size: 44×44px
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ ARIA labels where needed
- ✅ Semantic HTML structure
- ✅ Alt text for images

---

## 🔍 Quality Checklist

Before shipping any component:

- [ ] Styling matches design system
- [ ] Colors from palette
- [ ] Typography follows hierarchy
- [ ] Spacing uses scale
- [ ] Animations use proper timing
- [ ] Responsive at all breakpoints
- [ ] Accessible to keyboard & screen readers
- [ ] Hover/focus states implemented
- [ ] No layout shifts
- [ ] Performance optimized

---

## 📚 Files Structure

```
BlueWing/
├── src/
│   ├── index.css (Global design system)
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── TicketCard.jsx
│   ├── pages/
│   │   ├── BluewingLogin.jsx
│   │   ├── HomePage.jsx
│   │   ├── FlightSelection.jsx
│   │   ├── Help.jsx
│   │   └── TicketSummary.jsx
│   └── styles/
│       ├── Navbar.css
│       ├── BlueWingLogin.css
│       ├── HomePage.css
│       ├── FlightSelection.css
│       ├── FlightCard.css
│       ├── Help.css
│       ├── TicketSummary.css
│       └── AuthPage.css
```

---

## 🎓 Design Tokens Usage

### CSS Custom Properties
```css
/* Colors */
var(--color-primary)       /* #0066ff */
var(--color-primary-dark)  /* #001a4d */
var(--color-secondary)     /* #00d4ff */

/* Typography */
var(--font-family)         /* Segoe UI */
var(--font-weight-bold)    /* 700 */
var(--font-size-lg)        /* 16px */

/* Spacing */
var(--spacing-md)          /* 16px */
var(--spacing-lg)          /* 24px */

/* Effects */
var(--shadow-lg)           /* 0 8px 24px ... */
var(--transition-base)     /* 0.3s ease */
var(--radius-lg)           /* 16px */
```

---

## 🚢 Production Ready

- ✅ All pages responsive
- ✅ All animations smooth
- ✅ All colors consistent
- ✅ All typography aligned
- ✅ Build passes without errors
- ✅ Performance optimized
- ✅ Accessibility verified

---

**Design System Version**: 2.0 Premium
**Last Updated**: May 10, 2026
**Status**: ✅ Production Ready
