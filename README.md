# Executive Precision Calculator 🧮

A modern, high-precision, and professional web calculator built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript**. Designed with an executive aesthetic—clean typography, subtle glassmorphism, responsive tactile buttons, and zero fluorescent/neon colors.

Developed for the **CodeAlpha** internship task.

---

## ✨ Features

- **Core Arithmetic Operations**: Complete support for Addition (`+`), Subtraction (`−`), Multiplication (`×`), and Division (`÷`).
- **Precision Calculation Engine**: High-accuracy numeric handling that eliminates IEEE-754 floating-point inaccuracies (e.g., `0.1 + 0.2 = 0.3`).
- **Real-Time Live Preview**: Instantly previews results as you type the expression before pressing `=`.
- **Two-Line Dynamic Display**:
  - Upper expression history ribbon.
  - Large primary active display with dynamic font scaling to prevent number overflow.
  - Locale-aware thousands comma separation (`12,345.67`).
- **Full Keyboard Support**:
  - `0–9` for digits
  - `+`, `-`, `*` or `x`, `/` for operations
  - `Enter` or `=` to calculate
  - `Escape` for Clear (AC)
  - `Backspace` for delete
  - `.` for decimals
  - `%` for percentages
  - Interactive visual button feedback when keys are pressed physically.
- **Persistent Calculation History**:
  - Slide-over history panel storing past calculations.
  - Click any past calculation to instantly recall and reuse its result.
  - Saved across sessions in `localStorage`.
- **Dual Executive Themes**:
  - **Dark Mode** (Default): Sophisticated deep obsidian and slate palette with subtle satin borders.
  - **Light Mode**: Clean executive silver-graphite and white card styling.
  - Automatically remembers user's theme preference.
- **Copy to Clipboard**: One-click button to copy current result with tooltip confirmation.
- **Subtle Acoustic Feedback**: Built-in, synthesized clicks powered by the Web Audio API (can be toggled on/off with sound icon).
- **Graceful Error Handling**: Safe division-by-zero protection (`Cannot divide by 0`).

---

## 🛠️ Technology Stack

- **HTML5**: Semantic markup, accessible attributes (`aria-*`), and responsive viewport.
- **CSS3**: Custom CSS properties (variables), modern Flexbox/Grid layouts, glassmorphism, responsive media queries, and smooth micro-animations.
- **Vanilla JavaScript (ES6+)**: Clean, class-based architecture, event delegation, precision math utilities, and `localStorage` persistence.
- **Google Fonts**: *Plus Jakarta Sans* and *JetBrains Mono*.

---

## 🚀 Getting Started

No build tools, dependencies, or installations required!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shubhamwadhe111/CodeAlpha_Calculator-.git
   ```
2. **Open `index.html`** in any modern web browser:
   - Double click `index.html` or open via Live Server.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| :--- | :--- |
| `0` – `9` | Input number |
| `.` | Input decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` or `x` | Multiplication |
| `/` | Division |
| `%` | Percentage |
| `Enter` or `=` | Compute / Equals |
| `Backspace` | Delete last digit |
| `Escape` | Clear All (AC) / Clear Entry (C) |

---

## 📁 Project Structure

```
CodeAlpha_Calculator-/
├── index.html      # Calculator layout, display screens, keypad grid & history drawer
├── style.css       # Design system, themes (Dark/Light), tactile animations & responsive styles
├── script.js       # Core calculator engine, keyboard listeners, history & audio feedback
└── README.md       # Project documentation
```

---

## 👨‍💻 Author

**Shubham Wadhe**  
- GitHub: [@Shubhamwadhe111](https://github.com/Shubhamwadhe111)
