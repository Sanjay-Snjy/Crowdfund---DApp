import "../styles/globals.css";
import { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import clerkAppearance from "../config/clerkAppearance";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config, chains } from "../config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import GlobalErrorBoundary from "../components/Layout/GlobalErrorBoundary";
import { EthAvatar } from "../components/EthAvatar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 3 },
  },
});

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8fafc", color: "#0f172a", fontFamily: "system-ui, sans-serif", zIndex: 9999,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#4f46e5",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontSize: 14, color: "#64748b" }}>Loading…</span>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const appContent = (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          <RainbowKitProvider chains={chains} avatar={EthAvatar}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasKey = typeof clerkKey === "string" && clerkKey.trim().length > 0 && !clerkKey.includes("your_clerk_publishable_key_here");

  if (!hasKey) return appContent;

  return (
    <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/" appearance={clerkAppearance}>
      {appContent}
    </ClerkProvider>
  );
}

export default MyApp;
