import { useAccount, useContractReads } from "wagmi";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout/Layout";
import { useContract } from "../hooks/useContract";
import {
  FiHeart,
  FiExternalLink,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiArrowRight,
} from "react-icons/fi";
import { formatEther, formatAddress, formatDate } from "../utils/helpers";
import { CONTRACT_ADDRESS } from "../constants";
import { CROWDFUNDING_ABI } from "../constants/abi";

export default function ContributionsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { useUserContributions } = useContract();
  const [contributions, setContributions] = useState([]);

  const { data: contributionCampaignIds, isLoading: loadingIds } =
    useUserContributions(address);

  // Prepare contract calls for both campaign details and user contributions
  const contractCalls = useMemo(() => {
    if (
      !contributionCampaignIds ||
      contributionCampaignIds.length === 0 ||
      !address
    )
      return [];

    const calls = [];

    contributionCampaignIds.forEach((campaignId) => {
      const numericId =
        typeof campaignId === "bigint"
          ? Number(campaignId)
          : Number(campaignId.toString());

      // Get campaign details
      calls.push({
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "getCampaign",
        args: [numericId],
      });

      // Get user's contribution amount for this campaign
      calls.push({
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "getContribution",
        args: [numericId, address],
      });
    });

    return calls;
  }, [contributionCampaignIds, address]);

  // Fetch all data
  const { data: contractData, isLoading: loadingData } = useContractReads({
    contracts: contractCalls,
    enabled: contractCalls.length > 0,
    watch: true,
  });

  const loading = loadingIds || loadingData;

  // Process the data
  useEffect(() => {
    if (contractData && contributionCampaignIds && address) {
      const processedContributions = [];

      // Process data in pairs (campaign details + contribution amount)
      for (let i = 0; i < contractData.length; i += 2) {
        const campaignResult = contractData[i];
        const contributionResult = contractData[i + 1];

        if (
          campaignResult.status === "success" &&
          contributionResult.status === "success"
        ) {
          const campaignData = campaignResult.result;
          const contributionAmount = contributionResult.result;

          // Only include if user actually contributed
          if (contributionAmount && contributionAmount > 0) {
            const safeBigNumber = (value) => {
              if (!value) return 0n;
              if (typeof value === "bigint") return value;
              if (value.toString) return BigInt(value.toString());
              return BigInt(value);
            };

            const safeBigNumberToNumber = (value) => {
              if (!value) return 0;
              if (typeof value === "bigint") return Number(value);
              if (value.toString) return Number(value.toString());
              return Number(value);
            };

            processedContributions.push({
              campaignId: safeBigNumberToNumber(campaignData.id),
              campaignTitle: campaignData.title,
              campaignDescription: campaignData.description,
              amount: safeBigNumber(contributionAmount),
              targetAmount: safeBigNumber(campaignData.targetAmount),
              raisedAmount: safeBigNumber(campaignData.raisedAmount),
              deadline: safeBigNumberToNumber(campaignData.deadline),
              active: campaignData.active,
              // Note: We don't have timestamp from getUserContributions,
              // you'd need to implement getCampaignContributions for that
              timestamp: null,
            });
          }
        }
      }

      setContributions(processedContributions);
    } else if (
      contributionCampaignIds &&
      contributionCampaignIds.length === 0
    ) {
      setContributions([]);
    }
  }, [contractData, contributionCampaignIds, address]);

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
              Please connect your wallet to view your contributions.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const totalContributed = contributions.reduce((sum, contribution) => {
    return sum + parseFloat(formatEther(contribution.amount || 0));
  }, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-8 text-white shadow-2xl shadow-slate-900/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur">
                <FiHeart className="h-4 w-4" />
                Your supporter dashboard
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                My Contributions
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Review your impact, track your support, and jump back into the campaigns you care about.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-sm text-slate-300">Wallet connected</p>
              <p className="mt-1 text-lg font-semibold">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total contributed</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {totalContributed.toFixed(4)} ETH
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <FiDollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Projects supported</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {contributions.length}
                </p>
              </div>
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                <FiHeart className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Average contribution</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {contributions.length > 0
                    ? (totalContributed / contributions.length).toFixed(4)
                    : "0.00"} ETH
                </p>
              </div>
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                <FiTrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : contributions.length > 0 ? (
          <div className="rounded-[28px] border border-slate-200/70 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FiActivity className="h-5 w-5 text-sky-500" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Contribution history
                </h2>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {contributions.map((contribution, index) => {
                const progress =
                  (parseFloat(formatEther(contribution.raisedAmount)) /
                    parseFloat(formatEther(contribution.targetAmount))) *
                  100;
                const isActive =
                  contribution.active &&
                  new Date(contribution.deadline * 1000) > new Date();

                return (
                  <div
                    key={index}
                    className="p-6 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          <FiHeart className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {contribution.campaignTitle}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {contribution.campaignDescription?.slice(0, 120)}...
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                              Progress: {progress.toFixed(1)}%
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {isActive ? "Active" : "Ended"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 text-left lg:items-end">
                        <div>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {formatEther(contribution.amount)} ETH
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Target: {formatEther(contribution.targetAmount)} ETH
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/campaign/${contribution.campaignId}`)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                        >
                          View campaign
                          <FiArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <FiHeart className="mx-auto mb-6 h-16 w-16 text-slate-400" />
            <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
              No contributions yet
            </h3>
            <p className="mx-auto mb-6 max-w-md text-slate-600 dark:text-slate-400">
              Start backing projects that matter to you and build your supporter history from here.
            </p>
            <button
              onClick={() => router.push("/campaigns")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white transition hover:from-blue-600 hover:to-purple-700"
            >
              Browse campaigns
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}