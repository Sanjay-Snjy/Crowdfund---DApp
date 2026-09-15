import Layout from "../components/Layout/Layout";
import CreateCampaignForm from "../components/Campaign/CreateCampaignForm";
import { useAccount } from "wagmi";
import { useDemoMode } from "../lib/demoMode";

export default function CreateCampaignPage() {
  const { isConnected } = useAccount();
  const demoMode = useDemoMode();

  if (!isConnected && !demoMode) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="card p-8 text-center max-w-sm">
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>Connect Your Wallet</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Connect your wallet to create a campaign.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-8xl mx-auto pl-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold " style={{ color: "var(--color-text)" }}>Create Campaign</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{demoMode ? "Demo mode — form is read-only. Connect a real wallet to create campaigns." : "Define your goal, story, and funding timeline"}</p>
        </div>
        <CreateCampaignForm />
      </div>
    </Layout>
  );
}
