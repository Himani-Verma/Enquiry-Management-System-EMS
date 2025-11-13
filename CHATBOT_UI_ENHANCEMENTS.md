# Eva Chatbot UI Enhancement Guide

## 🎨 Design System

### Colors
- **Primary Blue**: `#2d4891`
- **Secondary Green**: `#22c55e`
- **Background**: White with gradient `linear-gradient(180deg, #e0f2fe 0%, #ffffff 100%)`
- **Text**: Gray-900 for headings, Gray-600 for body

### Typography
- **Font Family**: Inter, Poppins, or system-ui
- **Headings**: Bold, 1.5rem - 2rem
- **Body**: Regular, 1rem
- **Small text**: 0.875rem

## 🎯 Component Enhancements

### 1. Chat Window (Home Screen)

**Background:**
```tsx
className="bg-gradient-to-b from-blue-50 to-white"
```

**Header:**
```tsx
<div className="bg-gradient-to-br from-[#2d4891] to-[#1e3470] rounded-t-3xl px-6 py-4">
  <div className="flex items-center justify-between">
    <Image src="/envirocare-logo.png" alt="Eva" className="h-8" />
    <button className="text-white hover:scale-110 transition-transform">
      <X className="w-6 h-6" />
    </button>
  </div>
</div>
```

**Greeting Message:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="float-animation"
>
  <div className="text-center p-8">
    <div className="text-5xl mb-4">👋</div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      Hey! How can we help you today?
    </h2>
  </div>
</motion.div>
```

**Welcome Badge:**
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#2d4891] to-[#22c55e] text-white font-semibold shadow-lg">
  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
  WELCOME TO ENVIROCARE
</div>
```

**Chat Button:**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="w-full px-8 py-4 bg-gradient-to-r from-[#2d4891] to-[#1e3470] text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all pulse-glow"
>
  Chat with Eva now →
</motion.button>
```

**Typing Indicator:**
```tsx
<div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-2xl w-fit">
  <div className="flex gap-1">
    <span className="w-2 h-2 bg-[#2d4891] rounded-full typing-dot"></span>
    <span className="w-2 h-2 bg-[#2d4891] rounded-full typing-dot"></span>
    <span className="w-2 h-2 bg-[#2d4891] rounded-full typing-dot"></span>
  </div>
  <span className="text-sm text-gray-600">Eva is typing...</span>
</div>
```

### 2. Form Page (Start Chat)

**Container:**
```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }}
  className="p-6 fade-up"
>
```

**Input Fields:**
```tsx
<div className="relative mb-4">
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
    👤
  </div>
  <input
    type="text"
    placeholder="Your Name"
    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2d4891] focus:ring-4 focus:ring-blue-100 transition-all outline-none"
  />
</div>

<div className="relative mb-4">
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
    ✉️
  </div>
  <input
    type="email"
    placeholder="Email Address"
    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2d4891] focus:ring-4 focus:ring-blue-100 transition-all outline-none"
  />
</div>

<div className="relative mb-4">
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
    📞
  </div>
  <input
    type="tel"
    placeholder="Phone Number"
    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2d4891] focus:ring-4 focus:ring-blue-100 transition-all outline-none"
  />
</div>
```

**Helper Text:**
```tsx
<p className="text-xs text-gray-500 text-center mb-4">
  🔒 We'll never share your info.
</p>
```

**Submit Button:**
```tsx
<motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
  className="w-full px-8 py-4 bg-gradient-to-r from-[#2d4891] to-[#1e3470] text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
>
  Start Chat
</motion.button>
```

### 3. Navigation Bar (Bottom)

```tsx
<div className="flex justify-around items-center p-4 bg-white border-t border-gray-200 rounded-b-3xl">
  {[
    { icon: '🏠', label: 'Home', active: true },
    { icon: '💬', label: 'Chat', active: false },
    { icon: '❓', label: 'FAQ', active: false },
    { icon: '📰', label: 'Articles', active: false }
  ].map((item, index) => (
    <motion.button
      key={index}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
        item.active 
          ? 'bg-blue-50 shadow-lg ring-2 ring-[#2d4891] ring-opacity-30' 
          : 'hover:bg-gray-50'
      }`}
    >
      <span className="text-2xl">{item.icon}</span>
      <span className={`text-xs font-medium ${
        item.active ? 'text-[#2d4891]' : 'text-gray-600'
      }`}>
        {item.label}
      </span>
    </motion.button>
  ))}
</div>
```

### 4. FAQ & Articles Pages

**Section Header:**
```tsx
<div className="flex items-center gap-3 mb-6">
  <span className="text-3xl">❓</span>
  <h2 className="text-2xl font-bold text-gray-900">
    Frequently Asked Questions
  </h2>
</div>
```

**Category Chips:**
```tsx
<div className="flex flex-wrap gap-2 mb-6">
  {['Testing', 'Training', 'About Us', 'Services'].map((category) => (
    <button
      key={category}
      className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-green-50 text-[#2d4891] font-medium text-sm hover:shadow-md transition-all hover:scale-105"
    >
      {category}
    </button>
  ))}
</div>
```

**Accordion Item:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-3"
>
  <button
    onClick={() => setOpen(!open)}
    className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-[#2d4891] transition-all"
  >
    <span className="font-semibold text-gray-900 text-left">
      {question}
    </span>
    <motion.span
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      ▼
    </motion.span>
  </button>
  <motion.div
    initial={false}
    animate={{ height: open ? 'auto' : 0 }}
    transition={{ duration: 0.3 }}
    className="overflow-hidden"
  >
    <div className="p-4 bg-gray-50 rounded-b-xl text-gray-600">
      {answer}
    </div>
  </motion.div>
</motion.div>
```

### 5. Message Bubbles

**Bot Message:**
```tsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  className="flex items-start gap-3 mb-4"
>
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2d4891] to-[#1e3470] flex items-center justify-center text-white font-bold">
    E
  </div>
  <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
    <p className="text-gray-900">{message}</p>
  </div>
</motion.div>
```

**User Message:**
```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  className="flex items-start gap-3 mb-4 justify-end"
>
  <div className="flex-1 bg-gradient-to-br from-[#2d4891] to-[#1e3470] rounded-2xl rounded-tr-none px-4 py-3 shadow-md">
    <p className="text-white">{message}</p>
  </div>
  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
    U
  </div>
</motion.div>
```

## 🎬 Animations

### Entrance Animation
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
```

### Page Transition
```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.3 }}
>
```

## 📱 Responsive Design

```tsx
// Mobile-first approach
className="w-full sm:w-96 md:w-[420px]"

// Responsive padding
className="p-4 sm:p-6"

// Responsive text
className="text-base sm:text-lg"
```

## ♿ Accessibility

- Ensure contrast ratio of 4.5:1 for text
- Add aria-labels to all interactive elements
- Support keyboard navigation
- Add focus indicators
- Use semantic HTML

## 🎨 Color Palette

```css
/* Primary */
--blue-primary: #2d4891;
--blue-dark: #1e3470;
--green-primary: #22c55e;

/* Backgrounds */
--bg-gradient-start: #e0f2fe;
--bg-gradient-end: #ffffff;

/* Text */
--text-primary: #111827;
--text-secondary: #4b5563;
--text-muted: #9ca3af;

/* Borders */
--border-light: #e5e7eb;
--border-medium: #d1d5db;
```

## 🚀 Implementation Checklist

- [ ] Apply gradient backgrounds
- [ ] Add floating animations
- [ ] Implement typing indicator
- [ ] Style form inputs with icons
- [ ] Create gradient buttons
- [ ] Add navigation bar with active states
- [ ] Implement FAQ accordions
- [ ] Add category chips
- [ ] Create message bubble animations
- [ ] Add entrance/exit transitions
- [ ] Ensure mobile responsiveness
- [ ] Test accessibility
- [ ] Add hover effects
- [ ] Implement focus states
- [ ] Add subtle shadows
