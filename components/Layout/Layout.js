import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DemoHeader from "./DemoHeader";
import ErrorBoundary from "./ErrorBoundary";
import { useDemoMode } from "../../lib/demoMode";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

  const demoMode = useDemoMode();

  // Ensure theme is applied synchronously on mount to prevent flash.
  // Read from localStorage and apply dark class before first paint.
  useEffect(() => {
    if (typeof document === "undefined") return;

    let savedTheme;
    try {
      savedTheme = localStorage.getItem("theme");
    } catch {
      savedTheme = null;
    }

    // Respect existing dark class set by landing page — don't remove it
    // if the user's saved preference is dark.
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    }
    // If no saved theme, keep whatever class is already on <html>
    // (e.g. dark set by landing page).
    document.documentElement.style.colorScheme =
      document.documentElement.classList.contains("dark") ? "dark" : "light";
  }, []);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };


  // Check dark mode and update on theme change
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);return (
      <div
        className="bg-[var(--bg)] min-h-screen flex flex-col"
        suppressHydrationWarning
      >
      {/* Fixed background for header area */}
      <div className="fixed inset-0 bg-[var(--bg)] z-0 pointer-events-none" />
      
      <div
        className="relative flex-1 flex flex-col "
        onMouseMove={(e) => {
          setMousePosition({
            x: e.clientX,
            y: e.clientY,
          });
        }}
      >
        {/* Base Dots Background */}
        <div
          className="hidden md:block fixed inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"} 1px,transparent 1.2px)`,
            backgroundSize: "10px 10px",
          }}
        />

        {/* Desktop Interactive Dots */}
        <div
          className="hidden md:block fixed inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.4)"} 0.8px,transparent 1px)`,
            backgroundSize: "10px 10px",
            maskImage: `radial-gradient(
              circle 160px at ${mousePosition.x}px ${mousePosition.y}px,
              white 0%,
              transparent 80%
            )`,
            WebkitMaskImage: `radial-gradient(
              circle 160px at ${mousePosition.x}px ${mousePosition.y}px,
              white 0%,
              transparent 80%
            )`,
          }}
        />


        {/* Sidebar: show in both modes (admin panel hidden for demo via SIDEBAR_ITEMS filter) */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          demoMode={demoMode}
        />
        <div
          key={sidebarCollapsed ? "collapsed" : "expanded"}
          className={`
            relative z-10 transition-all duration-300 ease-out flex-1 flex flex-col
            ${sidebarCollapsed ? "md:ml-[3rem]" : "md:ml-[12.5rem]"}
          `}
        >
          {demoMode ? (
            <DemoHeader />
          ) : (
            <Header onMenuToggle={toggleSidebar} isCollapsed={sidebarCollapsed} />
          )}
          <main className="flex-1 pt-24 px-3 pb-4 md:pt-20 md:px-6 md:pb-6">
            <ErrorBoundary key={router.asPath}>
              <div>{children}</div>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Footer - Solid background to hide the dotted pattern below.
          No sidebar margin: the sidebar shrinks above the footer, so the
          content can span the full width with the brand at the far left. */}
      <footer className="relative z-10 rounded-t-[20px] bg-[var(--bg-secondary)] mx-[8px] backdrop-blur-md border border-secondary dark:border-[rgba(255,255,255,0.1)] text-slate-300 mt-auto">
        <div className="mx-auto flex flex-col items-center gap-2 px-4 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <p className="text-sm font-semibold text-black dark:text-white">CrowdFund DApp</p>
            <p className="text-xs text-slate-400">
              Built for secure, modern crowdfunding on-chain.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <a className="transition hover:text-indigo-400">Create</a>
            <span className="text-slate-300 dark:text-[rgba(255,255,255,0.2)]">/</span>
            <a className="transition hover:text-indigo-400">Contribute</a>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} CrowdFund. All rights reserved.
          </p>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#4aed88",
            },
          },
        }}
      />
    </div>
  );
}
