import Layout from "../components/Layout/Layout";
import CreateCampaignForm from "../components/Campaign/CreateCampaignForm";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  FiPlus ,
} from "react-icons/fi";

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
       <section className="mb-6 rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-8 text-white shadow-2xl shadow-slate-900/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur">
               <FiPlus className="h-4 w-4" />
              Launch a campaign
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                Create your campaign with confidence
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Share your story, set your goal, and invite supporters to back your mission.
              </p>
            </div>
          </div>
        </section>
        <CreateCampaignForm />
      </main>
    </Layout>
  );
}



