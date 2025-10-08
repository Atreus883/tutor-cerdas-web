// ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;

    // Deteksi tema sistem
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    // Tentukan gradasi sesuai mode
    const gradient =
      theme === "dark"
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0a192f 100%)"
        : "linear-gradient(135deg, #e8f0ff 0%, #f8fbff 50%, #e0ecff 100%)";

    // Terapkan ke seluruh halaman
    document.documentElement.style.background = gradient;
    document.body.style.background = gradient;

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* CSS global */}
      <style jsx="true">{`
        html,
        body {
          min-height: 100vh;
          background-repeat: no-repeat;
          background-size: cover;
          background-attachment: fixed;
          transition: background 0.5s ease-in-out, color 0.3s ease;
          font-family: "Inter", sans-serif;
          color: var(--text);
        }

        :root {
          --brand: #3b82f6;
          --brand-dark: #2563eb;
        }

        [data-theme="light"] {
          --bg: #f9fafb;
          --panel: rgba(255, 255, 255, 0.8);
          --soft: rgba(255, 255, 255, 0.6);
          --text: #1e293b;
          --muted: #64748b;
          --line: rgba(203, 213, 225, 0.8);
          --shadow: rgba(0, 0, 0, 0.05);
          color-scheme: light;
        }

        [data-theme="dark"] {
          --bg: #0b1020;
          --panel: rgba(15, 21, 42, 0.9);
          --soft: rgba(20, 27, 55, 0.8);
          --text: #e9eef6;
          --muted: #9aa8c1;
          --line: rgba(255, 255, 255, 0.08);
          --shadow: rgba(0, 0, 0, 0.3);
          color-scheme: dark;
        }

        /* Card transparan (biar gradasi kelihatan di belakang) */
        .up-card {
          background: var(--panel);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px var(--shadow);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .theme-toggle-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: var(--brand);
          color: white;
          border: none;
          padding: 10px 14px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px var(--shadow);
          transition: transform 0.2s ease, background 0.3s ease;
        }

        .theme-toggle-btn:hover {
          background: var(--brand-dark);
          transform: scale(1.05);
        }
      `}</style>

      {/* Tombol toggle tema */}
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
