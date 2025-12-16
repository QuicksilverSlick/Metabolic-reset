# Metabolic Reset - Design System & Style Guide

## Overview
This style guide documents the design patterns, color palette, typography, animations, and component styles used throughout the Metabolic Reset application to ensure visual consistency.

---

## 1. Color Palette

### Primary Brand Colors
```css
/* Deep Navy Blue (Primary Background) */
--navy-900: #0F172A;    /* Main background */
--navy-950: #020617;    /* Darkest sections */
--navy-800: #1E293B;    /* Cards, elevated surfaces */
--navy-700: #334155;    /* Borders, secondary surfaces */

/* Gold (Primary Accent) */
--gold-500: #F59E0B;    /* Primary CTA, highlights */
--gold-400: #FBBF24;    /* Hover states, lighter accent */
--gold-300: #FCD34D;    /* Subtle highlights */
--gold-600: #D97706;    /* Darker gold for contrast */

/* Slate (Secondary Text & Borders) */
--slate-400: #94A3B8;   /* Secondary text */
--slate-500: #64748B;   /* Muted text */
--slate-300: #CBD5E1;   /* Light text on dark backgrounds */
```

### Semantic Colors
```css
/* Success */
--green-500: #22C55E;
--green-400: #4ADE80;

/* Information / Coach Theme */
--blue-500: #3B82F6;
--blue-400: #60A5FA;

/* Error */
--red-500: #EF4444;
--red-400: #F87171;
```

### CSS Variables (defined in index.css)
```css
--background: 222 47% 11%;      /* #0F172A */
--foreground: 210 40% 98%;      /* #F8FAFC */
--primary: 38 92% 50%;          /* #F59E0B */
--primary-foreground: 222 47% 11%;
--card: 217 33% 17%;            /* #1E293B */
--border: 217 33% 17%;
--ring: 38 92% 50%;             /* Gold for focus states */
```

---

## 2. Typography

### Font Families
```css
/* Display / Headings */
font-family: 'Montserrat', 'Cal Sans', 'Inter', system-ui, sans-serif;
/* Usage: font-display */

/* Body Text */
font-family: 'Open Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
/* Usage: font-sans */

/* Monospace / Code */
font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
/* Usage: font-mono */
```

### Type Scale
```
Hero Title:        text-5xl md:text-6xl lg:text-7xl font-display font-bold
Section Title:     text-3xl md:text-4xl lg:text-5xl font-display font-bold
Card Title:        text-xl md:text-2xl font-bold
Body Large:        text-lg md:text-xl font-sans
Body:              text-base font-sans
Small/Caption:     text-sm font-sans
Tiny/Label:        text-xs font-semibold uppercase tracking-wider
```

---

## 3. Spacing System

### Standard Spacing (Tailwind scale)
```
Container padding:     px-4 sm:px-6 lg:px-8
Section padding:       py-24
Card padding:          p-6 md:p-8
Component gap:         gap-4 (default), gap-6 (medium), gap-8 (large)
Form field spacing:    space-y-4 or space-y-6
Button padding:        px-8 py-6 (large), px-6 py-4 (medium)
```

### Container Widths
```
max-w-7xl    - Main content container
max-w-6xl    - Registration/form pages
max-w-4xl    - Narrow content sections
max-w-3xl    - Single-column forms
max-w-md     - Modals, small cards
```

---

## 4. Border Radius

### Standard Radii
```
rounded-full    - Buttons, badges, avatars
rounded-2xl     - Cards, major containers (1rem)
rounded-xl      - Input fields, smaller cards (0.75rem)
rounded-lg      - Small elements (0.5rem)
```

---

## 5. Shadows & Depth

### Standard Shadows
```css
/* Soft shadow for cards */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
shadow-soft: 0 4px 20px -2px rgba(15, 23, 42, 0.5);

/* Gold glow for CTAs */
shadow-[0_0_20px_rgba(245,158,11,0.3)]
shadow-[0_0_30px_rgba(245,158,11,0.5)]  /* hover */

/* Card shadow on dark background */
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## 6. Glassmorphism Effects (Apple Liquid Glass)

### On Dark Backgrounds (Navy)
```css
/* Base glass effect */
bg-white/[0.04]
backdrop-blur-xl
border border-white/[0.18]
shadow-[0_8px_32px_rgba(15,23,42,0.4),inset_0_0_0_2px_rgba(15,23,42,0.5),inset_0_3px_6px_rgba(15,23,42,0.4)]

/* Hover state */
bg-white/[0.07]
border-white/[0.3]
shadow-[0_12px_40px_rgba(15,23,42,0.5),inset_0_0_0_2px_rgba(15,23,42,0.6),inset_0_4px_8px_rgba(15,23,42,0.5)]
```

### On Light/Gold Backgrounds
```css
/* Base glass effect */
bg-white/[0.15]
backdrop-blur-sm
border border-white/[0.35]
shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(180,83,9,0.1)]

/* Hover state */
bg-white/[0.22]
border-white/[0.5]
shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(180,83,9,0.15)]
```

### Feature Cards (FeatureCard component)
```css
/* Base */
bg-white/[0.04] backdrop-blur-xl
shadow-[0_8px_32px_rgba(15,23,42,0.4),inset_0_0_0_2px_rgba(15,23,42,0.5),inset_0_3px_6px_rgba(15,23,42,0.4)]
border border-white/[0.18]

/* Active/Hover */
bg-white/[0.07] border-white/[0.3]
shadow-[0_12px_40px_rgba(15,23,42,0.5),inset_0_0_0_2px_rgba(15,23,42,0.6),inset_0_4px_8px_rgba(15,23,42,0.5)]
```

---

## 7. Buttons

### Primary CTA (Gold on Dark)
```jsx
<Button className="
  bg-gold-500 hover:bg-gold-400
  text-navy-900
  text-lg md:text-xl
  px-10 py-8
  rounded-full
  font-bold
  transition-all duration-300
  shadow-[0_0_20px_rgba(245,158,11,0.3)]
  hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]
">
```

### Secondary CTA (Glass on Dark - Quiz Button)
```jsx
<Button className="
  bg-white/[0.04] hover:bg-white/[0.07]
  text-white
  border border-white/[0.18] hover:border-white/[0.3]
  text-lg md:text-xl px-8 py-8
  rounded-full
  font-semibold
  backdrop-blur-xl
  transition-all duration-300
  shadow-[0_8px_32px_rgba(15,23,42,0.4),inset_0_0_0_2px_rgba(15,23,42,0.5),inset_0_3px_6px_rgba(15,23,42,0.4)]
  hover:shadow-[0_12px_40px_rgba(15,23,42,0.5),inset_0_0_0_2px_rgba(15,23,42,0.6),inset_0_4px_8px_rgba(15,23,42,0.5)]
">
```

### Secondary Glass (on Gold Background)
```jsx
<Button className="
  bg-white/[0.15] hover:bg-white/[0.22]
  text-navy-900
  border border-white/[0.35] hover:border-white/[0.5]
  text-lg px-10 py-8
  rounded-full
  font-bold
  backdrop-blur-sm
  transition-all duration-300
  shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(180,83,9,0.1)]
  hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(180,83,9,0.15)]
">
```

### Animated Glow Border (GlowWrapper)
```css
/* In index.css */
.glow-button-gold::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 9999px;
  background: linear-gradient(45deg, #F59E0B, #FBBF24, #FCD34D, #F59E0B, #D97706, #F59E0B, #FBBF24, #FCD34D);
  background-size: 400% 400%;
  z-index: 0;
  animation: glow-border 4s ease infinite;
}
```

### Form Submit Button (Full Width)
```jsx
<Button className="
  w-full
  bg-gold-500 hover:bg-gold-600
  text-navy-900
  py-7 text-lg
  font-bold
  rounded-xl
  shadow-[0_0_20px_rgba(245,158,11,0.3)]
  hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]
  hover:-translate-y-0.5
  transition-all duration-300
">
```

### Coach/Blue Variant Button
```jsx
<Button className="
  bg-blue-500 hover:bg-blue-600
  text-white
  py-7 text-lg
  font-bold
  rounded-xl
  shadow-[0_0_20px_rgba(59,130,246,0.3)]
  hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
  hover:-translate-y-0.5
  transition-all duration-300
">
```

---

## 8. Cards

### Marketing Card (Registration/Auth pages)
```jsx
<Card className="
  border-navy-700
  bg-navy-800/80
  backdrop-blur-xl
  shadow-2xl
  overflow-hidden
">
  {/* Card Header */}
  <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-gold-500" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white">Title</h2>
        <p className="text-slate-400 text-sm">Description</p>
      </div>
    </div>
  </div>
  <CardContent className="p-6 md:p-8">
    {/* Content */}
  </CardContent>
</Card>
```

### App Dashboard Card (Light/Dark mode)
```jsx
<Card className="
  border-slate-200 dark:border-navy-800
  bg-white dark:bg-navy-900
  shadow-sm
  transition-colors
">
```

### Stat Card (Dashboard)
```jsx
<div className="
  bg-white dark:bg-navy-900
  p-4
  rounded-xl
  shadow-sm
  border border-slate-200 dark:border-navy-800
  flex items-center gap-4
  min-w-[180px]
  transition-colors
">
```

---

## 9. Form Fields

### Input Fields (Auth/Registration)
```jsx
<Input className="
  bg-navy-900
  border-navy-600
  text-white
  placeholder:text-slate-500
  focus:border-gold-500
  focus:ring-gold-500/20
  h-12 text-lg
  rounded-xl
"/>
```

### Input Fields (App Dashboard)
```jsx
<Input className="
  bg-white dark:bg-navy-950
  border-slate-200 dark:border-navy-800
  text-navy-900 dark:text-white
  placeholder:text-slate-400 dark:placeholder:text-slate-600
"/>
```

### Labels
```jsx
<Label className="text-slate-200 flex items-center gap-2">
  <Icon className="h-4 w-4 text-slate-400" />
  Label Text
</Label>
```

---

## 10. Animations

### Framer Motion Fade-In
```jsx
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 }
};
```

### Card Entrance Animation
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{
    duration: 0.5,
    delay: index * 0.1,
    ease: [0.25, 0.4, 0.25, 1]
  }}
  whileHover={{ y: -6 }}
  whileTap={{ scale: 0.98 }}
>
```

### Slide Variants (Step transitions)
```jsx
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};
```

### CSS Animations (index.css)
```css
/* Gold glow pulse */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.6); }
}

/* Shimmer loading effect */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Animated glow border */
@keyframes glow-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## 11. Background Effects

### Neural Network Background (Hero)
- Three.js WebGL animation
- Connected nodes with gold/navy colors
- Used in hero section only

### Floating Particles
```jsx
<FloatingParticles
  count={25}
  colors={['rgba(245, 158, 11, 0.4)', 'rgba(251, 191, 36, 0.3)', 'rgba(15, 44, 89, 0.5)']}
  speed={0.2}
  minSize={1}
  maxSize={4}
/>
```

### Dot Pattern
```jsx
<DotPattern
  dotColor="rgba(245, 158, 11, 0.08)"
  dotSize={1}
  gap={32}
  fade={true}
  fadeDirection="radial"
/>
```

### Gradient Orbs (Blurred backgrounds)
```jsx
<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
```

### Beams Background (Final CTA on Gold)
```jsx
<BeamsBackground intensity="subtle" className="py-32 bg-gold-500">
  {/* Content */}
</BeamsBackground>
```

---

## 12. Icons

### Icon Library
Using `lucide-react` throughout.

### Icon Sizing
```
Small (in buttons, inline):  h-4 w-4 or h-5 w-5
Medium (in cards):           h-5 w-5 or h-6 w-6
Large (feature icons):       h-8 w-8
XL (success states):         h-12 w-12
```

### Icon Containers
```jsx
{/* Rounded container with background */}
<div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
  <Icon className="h-5 w-5 text-gold-500" />
</div>

{/* Larger rounded-lg container */}
<div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center">
  <Icon className="h-6 w-6 text-gold-500" />
</div>
```

---

## 13. Badges & Tags

### Status Badge (Pill)
```jsx
<span className="
  px-2 py-0.5
  bg-green-500/20
  text-green-400
  rounded-full
  text-xs
  font-medium
">
  Status Text
</span>
```

### Live Indicator
```jsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-sm font-bold backdrop-blur-sm">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
  </span>
  New Reset Project Starting Soon
</div>
```

---

## 14. Alerts

### Error Alert (Dark mode)
```jsx
<Alert variant="destructive" className="bg-red-900/20 border-red-800">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle className="text-red-400">Error Title</AlertTitle>
  <AlertDescription className="text-red-300">Error message</AlertDescription>
</Alert>
```

### Info Alert (Gold/Warning)
```jsx
<Alert className="bg-gold-500/10 border-gold-500/30 rounded-xl">
  <AlertCircle className="h-4 w-4 text-gold-500" />
  <AlertTitle className="text-gold-400">Info Title</AlertTitle>
  <AlertDescription className="text-gold-300/80 text-sm">Info message</AlertDescription>
</Alert>
```

### Info Alert (Blue)
```jsx
<Alert className="bg-blue-500/10 border-blue-500/30 rounded-xl">
  <Shield className="h-4 w-4 text-blue-400" />
  <AlertTitle className="text-blue-400">Info Title</AlertTitle>
  <AlertDescription className="text-blue-300/80 text-sm">Info message</AlertDescription>
</Alert>
```

---

## 15. Dark/Light Mode Support

### Pattern for dual-mode styling
```jsx
{/* Background */}
className="bg-white dark:bg-navy-900"

{/* Borders */}
className="border-slate-200 dark:border-navy-800"

{/* Text - Primary */}
className="text-navy-900 dark:text-white"

{/* Text - Secondary */}
className="text-slate-500 dark:text-slate-400"

{/* Input fields */}
className="bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"

{/* Transitions */}
className="transition-colors"  /* Add for smooth mode switching */
```

---

## 16. Progress Indicators

### Step Progress (Registration)
```jsx
{/* Step circle */}
<div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
  step > currentStep
    ? 'bg-green-500 text-white'
    : step === currentStep
    ? 'bg-gold-500 text-navy-900'
    : 'bg-navy-800 text-slate-500 border border-navy-700'
}`}>

{/* Progress bar */}
<div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
  <motion.div
    className="h-full bg-gradient-to-r from-gold-500 to-gold-400"
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  />
</div>
```

### Circular Progress
Use the `CircularProgress` component with gold stroke color.

---

## 17. Confetti Celebrations

### Standard celebration (Registration success)
```jsx
confetti({
  particleCount: 150,
  spread: 80,
  origin: { y: 0.6 },
  colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#22C55E', '#10B981']
});
```

### Full celebration (All habits complete)
```jsx
const duration = 2000;
const animationEnd = Date.now() + duration;
const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

// Fire from both sides of screen
confetti({
  ...defaults,
  particleCount,
  origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
  colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#0F172A', '#1E293B', '#10B981']
});
```

---

## 18. Responsive Breakpoints

### Tailwind defaults used
```
sm: 640px   - Mobile landscape / small tablets
md: 768px   - Tablets
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
```

### Common responsive patterns
```jsx
{/* Mobile-first text sizing */}
className="text-lg md:text-xl lg:text-2xl"

{/* Grid columns */}
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

{/* Padding */}
className="p-6 md:p-8"

{/* Hide on mobile, show on desktop */}
className="hidden lg:block"

{/* Stack on mobile, row on tablet+ */}
className="flex flex-col sm:flex-row"
```

---

## Summary of Key Patterns

1. **Marketing pages** (HomePage, Registration): Dark navy backgrounds with glass effects
2. **App dashboard**: Support light/dark mode with `dark:` prefix classes
3. **Primary CTAs**: Gold background with glow shadow, rounded-full
4. **Secondary CTAs**: Glass effect with backdrop-blur, inset shadows
5. **Cards**: Navy-800/80 with backdrop-blur-xl for marketing; white/navy-900 for app
6. **Form inputs**: Navy-900 background, navy-600 border, focus:border-gold-500
7. **Animations**: Framer Motion for entrance, hover, and transitions
8. **Icons**: Lucide React, sized appropriately for context
