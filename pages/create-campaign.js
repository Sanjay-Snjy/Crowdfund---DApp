import Layout from "../components/Layout/Layout";
import CreateCampaignForm from "../components/Campaign/CreateCampaignForm";
import { useAccount } from "wagmi";

export default function CreateCampaignPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold " style={{ color: "var(--color-text)" }}>Create Campaign</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Define your goal, story, and funding timeline</p>
        </div>
        <CreateCampaignForm />
      </div>
    </Layout>
  );
}
