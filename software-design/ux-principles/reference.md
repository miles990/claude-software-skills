# UX Principles Reference

Detailed reference for user experience design principles.

## WCAG 2.2 Compliance Checklist

### Level A (Minimum)

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 | Non-text content has text alternative | `alt` on images, `aria-label` on icons |
| 1.3.1 | Info and relationships conveyed | Semantic HTML, proper headings |
| 1.4.1 | Color not sole means of conveying info | Icons + color, patterns + color |
| 2.1.1 | Keyboard accessible | No mouse-only interactions |
| 2.4.1 | Skip to main content | Skip links at top |
| 2.5.1 | Touch gestures have alternatives | Single-tap alternatives |

### Level AA (Recommended)

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.4.3 | Contrast ratio 4.5:1 (text) | Use contrast checker tools |
| 1.4.4 | Text resizable to 200% | Relative units (rem, em) |
| 1.4.10 | Reflow without scrolling | Responsive design |
| 2.4.6 | Descriptive headings/labels | Clear, unique headings |
| 2.4.7 | Focus visible | Visible focus indicators |
| 3.2.3 | Consistent navigation | Same nav structure |

### Level AAA (Enhanced)

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.4.6 | Contrast ratio 7:1 | High contrast mode |
| 2.2.3 | No time limits | Remove or extend timers |
| 2.4.9 | Link purpose from text | Descriptive link text |
| 3.1.5 | Reading level | Plain language |

## Color Contrast Tools

```typescript
// Calculate contrast ratio
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map((val) => {
    val /= 255;
    return val <= 0.03928
      ? val / 12.92
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

// Usage
const ratio = getContrastRatio('#1a1a1a', '#ffffff'); // ~17:1
const meetsAA = ratio >= 4.5;  // Normal text
const meetsAAA = ratio >= 7;   // Enhanced
```

## Screen Reader Testing

### VoiceOver (macOS/iOS)

| Action | Shortcut |
|--------|----------|
| Turn on/off | Cmd + F5 |
| Read all | Ctrl + Option + A |
| Next element | Ctrl + Option + Right |
| Previous element | Ctrl + Option + Left |
| Activate | Ctrl + Option + Space |
| Open rotor | Ctrl + Option + U |

### NVDA (Windows)

| Action | Shortcut |
|--------|----------|
| Turn on/off | Ctrl + Alt + N |
| Read all | NVDA + Down |
| Stop | Ctrl |
| Next heading | H |
| Next link | K |
| Next form field | F |
| Forms mode | Enter |

### Testing Checklist

```markdown
## Screen Reader Test Checklist

### Page Structure
- [ ] Page title is descriptive
- [ ] Headings are in logical order (h1 > h2 > h3)
- [ ] Landmarks are properly defined (main, nav, aside)
- [ ] Skip to main content link works

### Images
- [ ] Decorative images have empty alt=""
- [ ] Informative images have descriptive alt text
- [ ] Complex images have extended descriptions

### Forms
- [ ] All inputs have associated labels
- [ ] Required fields are announced
- [ ] Error messages are associated with inputs
- [ ] Form instructions are available

### Interactive Elements
- [ ] Buttons describe their action
- [ ] Links describe their destination
- [ ] Custom controls have proper roles
- [ ] State changes are announced

### Dynamic Content
- [ ] Live regions announce updates
- [ ] Modal focus is properly trapped
- [ ] Focus returns to trigger on close
```

## Design System Tokens

```typescript
// tokens.ts
export const tokens = {
  // Colors
  colors: {
    // Brand
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3', // Main
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    // Semantic
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    // Neutral
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },

  // Typography
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Spacing (4px base)
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },

  // Transitions
  transition: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
  },
};
```

## Component Patterns

### Accessible Modal

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Store trigger element
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
        className="modal"
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="modal-close"
          >
            ×
          </button>
        </header>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </>
  );
}
```

### Accessible Tabs

```typescript
import { useState, useRef } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex: number;

    switch (e.key) {
      case 'ArrowLeft':
        newIndex = index === 0 ? tabs.length - 1 : index - 1;
        break;
      case 'ArrowRight':
        newIndex = index === tabs.length - 1 ? 0 : index + 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const newTab = tabs[newIndex];
    setActiveTab(newTab.id);
    tabRefs.current.get(newTab.id)?.focus();
  };

  return (
    <div>
      {/* Tab list */}
      <div role="tablist" aria-label="Content tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => el && tabRefs.current.set(tab.id, el)}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Accessible Dropdown Menu

```typescript
import { useState, useRef, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function DropdownMenu({ items, trigger }: { items: MenuItem[]; trigger: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(items.length - 1);
        break;
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && !items[activeIndex].disabled) {
          items[activeIndex].onClick();
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  return (
    <div className="dropdown">
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
      >
        {trigger}
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          aria-labelledby="menu-button"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={activeIndex === index ? 0 : -1}
              aria-disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              className={activeIndex === index ? 'active' : ''}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Animation Guidelines

### Motion Preferences

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Safe animations for reduced motion */
.fade {
  transition: opacity 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .fade {
    transition: opacity 0ms;
  }
}
```

### Animation Principles

| Principle | Duration | Easing | Example |
|-----------|----------|--------|---------|
| Micro-interactions | 100-200ms | ease-out | Button hover |
| Small transitions | 200-300ms | ease-in-out | Panel expand |
| Medium transitions | 300-400ms | ease-in-out | Modal open |
| Large transitions | 400-500ms | ease-out | Page transition |

```css
/* Easing functions */
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Button interaction */
.button {
  transition: transform 100ms var(--ease-out),
              box-shadow 100ms var(--ease-out);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.button:active {
  transform: translateY(0);
  transition-duration: 50ms;
}
```

## Error Message Guidelines

### Error Message Structure

```typescript
interface ErrorMessage {
  title: string;      // What happened
  description: string; // Why it happened (if helpful)
  action?: string;    // What user can do
}

const errorMessages: Record<string, ErrorMessage> = {
  NETWORK_ERROR: {
    title: "Connection lost",
    description: "Please check your internet connection",
    action: "Try again",
  },
  AUTH_EXPIRED: {
    title: "Session expired",
    description: "For your security, please sign in again",
    action: "Sign in",
  },
  VALIDATION_ERROR: {
    title: "Please fix the errors below",
    description: undefined,
    action: undefined,
  },
  NOT_FOUND: {
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has been moved",
    action: "Go home",
  },
  RATE_LIMITED: {
    title: "Too many requests",
    description: "Please wait a moment before trying again",
    action: "Try again in 30 seconds",
  },
};
```

### Field Validation Messages

```typescript
const validationMessages = {
  required: (field: string) => `${field} is required`,
  email: "Please enter a valid email address",
  minLength: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) =>
    `${field} must be no more than ${max} characters`,
  pattern: (field: string) => `Please enter a valid ${field}`,
  match: (field: string) => `${field} doesn't match`,
  unique: (field: string) => `This ${field} is already in use`,
};

// Example usage
function validateEmail(email: string): string | null {
  if (!email) return validationMessages.required('Email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return validationMessages.email;
  }
  return null;
}
```

## Loading State Patterns

### Skeleton Screen CSS

```css
/* Skeleton base */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 0%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-base) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

:root {
  --skeleton-base: #e5e7eb;
  --skeleton-highlight: #f3f4f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --skeleton-base: #374151;
    --skeleton-highlight: #4b5563;
  }
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton variants */
.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-text:last-child {
  width: 70%;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 16 / 9;
}
```

## References

| Resource | URL |
|----------|-----|
| WCAG Guidelines | https://www.w3.org/WAI/WCAG22/quickref/ |
| MDN Accessibility | https://developer.mozilla.org/en-US/docs/Web/Accessibility |
| A11y Project Checklist | https://www.a11yproject.com/checklist/ |
| Inclusive Components | https://inclusive-components.design/ |
| Nielsen Norman Group | https://www.nngroup.com/articles/ |
| Web.dev Accessibility | https://web.dev/accessibility/ |
