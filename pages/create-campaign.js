import Layout from "../components/Layout/Layout";
import CreateCampaignForm from "../components/Campaign/CreateCampaignForm";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function CreateCampaignPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please connect your wallet to create a campaign.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="max-w-8xl mx-auto px-0 py-0 lg:py-0">
        <section className="ml-[25px] text-left mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
            Launch a campaign
          </p>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Create your campaign with confidence
          </h1>
          <p className="mt-4 max-w-2xl  text-gray-600 dark:text-gray-300 text sm:text-md">
            Share your story, set your goal, and invite supporters to back your mission.
          </p>
        </section>
        <CreateCampaignForm />
      </main>
    </Layout>
  );
}
