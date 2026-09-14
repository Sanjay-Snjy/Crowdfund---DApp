import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ErrorBoundary from "./ErrorBoundary";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

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
        className="bg-gray-50 dark:bg-black min-h-screen -mt-[20px] flex flex-col"
        suppressHydrationWarning
      >
      {/* Fixed background for header area */}
      <div className="fixed inset-0 bg-gray-50 dark:bg-black z-0 pointer-events-none" />
      
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


        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />      <div
        key={sidebarCollapsed ? "collapsed" : "expanded"}
        className={`
          relative z-10 transition-all duration-300 ease-out flex-1 flex flex-col
          ${sidebarCollapsed ? "md:ml-[3rem]" : "md:ml-[12.5rem]"}
        `}
        >
          <Header onMenuToggle={toggleSidebar} isCollapsed={sidebarCollapsed} />

          <main className="flex-1 pt-24 px-3 pb-4 md:pt-20 md:px-6 md:pb-6">
            <ErrorBoundary key={router.asPath}>
              <div>{children}</div>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Footer - Solid background to hide the dotted pattern below */}
      <footer className="relative z-10 bg-gray-50 backdrop-blur-md dark:border-[rgba(255,255,255,0.1)] dark:bg-black border-t border-secondary dark:border-[rgba(255,255,255,0.1)] text-slate-300 mt-auto">
        <div
          className={`transition-all duration-300 ease-out ${
            sidebarCollapsed ? "md:ml-[3rem]" : "md:ml-[12.5rem]"
          }`}
        >
          <div className="mx-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">CrowdFund DApp</p>
              <p className="mt-1 text-xs text-slate-400">
                Built for secure, modern crowdfunding on-chain.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
             
              <a className="transition hover:text-indigo-400 text-slate-400">
                Create 
              </a>/
              <a className="transition hover:text-indigo-400 text-slate-400">
                Contribute
              </a>
            </div>
            <p className="text-xs text-slate-500 sm:text-right">
              © {new Date().getFullYear()} CrowdFund. All rights reserved.
            </p>
          </div>
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
