import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDark, setIsDark] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  // Check dark mode and update on theme change
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

return (
    <div className="bg-gray-50 dark:bg-white min-h-screen flex flex-col">
      {/* Fixed background for header area */}
      <div className="fixed inset-0 bg-gray-50 dark:bg-darkc z-0 pointer-events-none" />
      
      <div
        className="relative flex-1 flex flex-col"
        onMouseMove={(e) => {
          setMousePosition({
            x: e.clientX,
            y: e.clientY,
          });
        }}
      >
        {/* Base Dots Background */}
        <div
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"} 1px,transparent 1.2px)`,
            backgroundSize: "8px 8px",
          }}
        />

        {/* Desktop Interactive Dots */}
        <div
          className="hidden md:block fixed inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255, 255, 255, 0.71)" : "rgba(0, 0, 0, 0.73)"} 0.8px,transparent 1px)`,
            backgroundSize: "8px 8px",
            maskImage: `radial-gradient(
              circle 160px at ${mousePosition.x}px ${mousePosition.y}px,
              white 0%,
              transparent 85%
            )`,
            WebkitMaskImage: `radial-gradient(
              circle 160px at ${mousePosition.x}px ${mousePosition.y}px,
              white 0%,
              transparent 85%
            )`,
          }}
        />

        {/* Mobile Extra Visible Dots */}
        <div
          className="md:hidden fixed inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.2)"} 1px,transparent 1.2px)`,
            backgroundSize: "10px 10px",
          }}
        />
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        <div
          className={`
          relative z-10 transition-all duration-300 ease-out flex-1 flex flex-col
          ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}
        `}
        >
          <Header onMenuToggle={toggleSidebar} isCollapsed={sidebarCollapsed} />

          <main className="flex-1 pt-20 p-4 md:p-6 mt-20">
            <div>{children}</div>
          </main>
        </div>
      </div>

      {/* Footer - Solid background to hide the dotted pattern below */}
      <footer className="relative z-10 bg-white dark:bg-darkb border-t border-gray-200 dark:border-gray-700">
        <div className={`
          transition-all duration-300 ease-out
          ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}
        `}>
          <div className="p-4 md:p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} CrowdFund Pro. All rights reserved.
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
