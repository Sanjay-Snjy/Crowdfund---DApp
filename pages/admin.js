import { useAccount, useContractWrite, useContractRead } from "wagmi";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { useContract } from "../hooks/useContract";
import { toast } from "react-hot-toast";
import {
  FiPause,
  FiPlay,
  FiDollarSign,
  FiShield,
  FiActivity,
  FiAlertTriangle,
  FiCopy,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import { formatEther, parseEther } from "../utils/helpers";
import { CONTRACT_ADDRESS } from "../constants";
import { CROWDFUNDING_ABI } from "../constants/abi";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { useContractStats } = useContract();
  const [isAdmin, setIsAdmin] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [campaignToToggle, setCampaignToToggle] = useState("");
  const [copiedField, setCopiedField] = useState("");

  const { data: contractStats } = useContractStats();

  const { data: isPaused } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "paused",
    enabled: Boolean(CONTRACT_ADDRESS && isAdmin),
    watch: true,
  });

  const { data: contractOwner } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "owner",
    enabled: Boolean(CONTRACT_ADDRESS),
    watch: true,
  });

  const { write: withdrawFees, isLoading: isWithdrawing } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "withdrawFees",
    onSuccess: () => {
      toast.success("Fees withdrawn successfully!");
      setWithdrawAmount("");
    },
    onError: (error) => {
      toast.error(error?.reason || "Failed to withdraw fees");
    },
  });

  const { write: pauseContract, isLoading: isPausing } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "pause",
    onSuccess: () => {
      toast.success("Contract paused successfully!");
    },
    onError: (error) => {
      toast.error(error?.reason || "Failed to pause contract");
    },
  });

  const { write: unpauseContract, isLoading: isUnpausing } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "unpause",
    onSuccess: () => {
      toast.success("Contract unpaused successfully!");
    },
    onError: (error) => {
      toast.error(error?.reason || "Failed to unpause contract");
    },
  });

  const { write: emergencyWithdraw, isLoading: isEmergencyWithdrawing } =
    useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "emergencyWithdraw",
      onSuccess: () => {
        toast.success("Emergency withdrawal completed!");
      },
      onError: (error) => {
        toast.error(error?.reason || "Failed to emergency withdraw");
      },
    });

  const { write: deactivateCampaign, isLoading: isDeactivating } =
    useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "deactivateCampaign",
      onSuccess: () => {
        toast.success("Campaign deactivated successfully!");
        setCampaignToToggle("");
      },
      onError: (error) => {
        toast.error(error?.reason || "Failed to deactivate campaign");
      },
    });

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    if (contractOwner && address) {
      const userIsAdmin = address.toLowerCase() === contractOwner.toLowerCase();
      setIsAdmin(userIsAdmin);

      if (!userIsAdmin) {
        toast.error("Access denied: Admin privileges required");
        router.push("/dashboard");
      }
    }
  }, [isConnected, address, router, contractOwner]);

  if (!isConnected || !isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <FiShield className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Access Restricted
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This area is restricted to administrators only.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const availableFees = contractStats?.totalFees
    ? formatEther(contractStats.totalFees)
    : "0";
  const contractBalance = contractStats?.contractBalance
    ? formatEther(contractStats.contractBalance)
    : "0";
  const totalCampaigns = contractStats?.totalCampaigns
    ? contractStats.totalCampaigns.toString()
    : "0";

  const handleWithdrawFees = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const amountInWei = parseEther(withdrawAmount);
      withdrawFees?.({ args: [amountInWei] });
    } catch {
      toast.error("Invalid amount format");
    }
  };

  const handlePauseContract = () => {
    if (isPaused) {
      unpauseContract?.();
    } else {
      pauseContract?.();
    }
  };

  const handleEmergencyWithdraw = () => {
    if (
      window.confirm(
        "Are you sure you want to perform an emergency withdrawal? This action cannot be undone."
      )
    ) {
      emergencyWithdraw?.();
    }
  };

  const handleToggleCampaign = () => {
    if (!campaignToToggle || parseInt(campaignToToggle) <= 0) {
      toast.error("Please enter a valid campaign ID");
      return;
    }

    const campaignId = parseInt(campaignToToggle);

    if (
      window.confirm(`Are you sure you want to toggle campaign #${campaignId}?`)
    ) {
      deactivateCampaign?.({ args: [campaignId] });
    }
  };

  const copyToClipboard = async (value, label) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      toast.success(`${label} copied to clipboard`);
      window.setTimeout(() => setCopiedField(""), 1800);
    } catch {
      toast.error("Unable to copy address right now");
    }
  };

  const quickActions = [
    {
      title: "Refresh dashboard",
      description: "Reload the latest contract state",
      icon: FiRefreshCw,
      action: () => router.replace(router.asPath),
    },
    {
      title: "View marketplace",
      description: "Open the public campaign view",
      icon: FiActivity,
      action: () => router.push("/campaigns"),
    },
  ];

  const healthItems = [
    { label: "Contract status", value: isPaused ? "Paused" : "Operational", tone: isPaused ? "text-amber-600" : "text-emerald-600" },
    { label: "Total campaigns", value: totalCampaigns, tone: "text-sky-600" },
    { label: "Available fees", value: `${availableFees} ETH`, tone: "text-violet-600" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-8 text-white shadow-2xl shadow-slate-900/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur">
                <FiShield className="h-4 w-4" />
                Administration Command Center
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                Admin Panel
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Monitor platform health, govern treasury actions, and keep the marketplace secure from a single professional workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400"}`} />
                <span className="text-sm font-medium">
                  {isPaused ? "Paused for maintenance" : "Live and operational"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Access level: Owner / Admin
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total campaigns",
              value: totalCampaigns,
              icon: FiActivity,
              accent: "from-sky-500 to-blue-600",
            },
            {
              label: "Platform fees",
              value: `${availableFees} ETH`,
              icon: FiDollarSign,
              accent: "from-emerald-500 to-green-600",
            },
            {
              label: "Contract balance",
              value: `${contractBalance} ETH`,
              icon: FiShield,
              accent: "from-violet-500 to-purple-600",
            },
            {
              label: "Status",
              value: isPaused ? "Paused" : "Active",
              icon: isPaused ? FiPause : FiPlay,
              accent: isPaused ? "from-amber-500 to-orange-600" : "from-emerald-500 to-green-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${stat.accent} p-3 text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Operational controls
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Execute platform governance actions from one place.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Secure mode
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Treasury</h3>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Withdraw amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={availableFees}
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Available: {availableFees} ETH
                    </p>
                  </div>
                  <button
                    onClick={handleWithdrawFees}
                    disabled={isWithdrawing || !withdrawAmount}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isWithdrawing ? "Withdrawing..." : "Withdraw fees"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <FiShield className="h-5 w-5 text-violet-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Platform controls</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={handlePauseContract}
                    disabled={isPausing || isUnpausing}
                    className={`flex w-full items-center justify-center rounded-xl px-4 py-3 font-medium text-white transition ${
                      isPaused
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    {isPausing || isUnpausing ? (
                      "Processing..."
                    ) : isPaused ? (
                      <>
                        <FiPlay className="mr-2 h-4 w-4" /> Resume contract
                      </>
                    ) : (
                      <>
                        <FiPause className="mr-2 h-4 w-4" /> Pause contract
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleEmergencyWithdraw}
                    disabled={isEmergencyWithdrawing}
                    className="flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3 font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <FiAlertTriangle className="mr-2 h-4 w-4" />
                    {isEmergencyWithdrawing ? "Processing..." : "Emergency withdraw"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <FiActivity className="h-5 w-5 text-sky-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Campaign governance</h3>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Campaign ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter campaign ID"
                      value={campaignToToggle}
                      onChange={(e) => setCampaignToToggle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleToggleCampaign}
                    disabled={isDeactivating || !campaignToToggle}
                    className="w-full rounded-xl bg-orange-500 px-4 py-3 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isDeactivating ? "Processing..." : "Deactivate campaign"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <FiZap className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Quick actions</h2>
              </div>
              <div className="mt-4 space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.title}
                      onClick={action.action}
                      className="flex w-full items-start rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      <div className="mt-0.5 rounded-xl bg-white p-2 text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-slate-900 dark:text-white">{action.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="h-5 w-5 text-sky-500" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Platform health</h2>
              </div>
              <div className="mt-4 space-y-4">
                {healthItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.tone}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <FiShield className="h-5 w-5 text-violet-500" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Smart contract overview</h2>
            </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
  {/* Row 1 - Contract Address */}
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Contract address
    </p>

    <p className="mt-2 break-all font-mono text-sm text-slate-900 dark:text-white">
      {CONTRACT_ADDRESS}
    </p>

    <button
      onClick={() =>
        copyToClipboard(CONTRACT_ADDRESS, "Contract address")
      }
      className="mt-3 inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {copiedField === "Contract address" ? (
        <FiCheckCircle className="mr-2 h-4 w-4" />
      ) : (
        <FiCopy className="mr-2 h-4 w-4" />
      )}

      {copiedField === "Contract address" ? "Copied" : "Copy address"}
    </button>
  </div>

  {/* Row 2 - Owner Address */}
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Owner address
    </p>

    <p className="mt-2 break-all font-mono text-sm text-slate-900 dark:text-white">
      {contractOwner || "Loading..."}
    </p>

    <button
      onClick={() =>
        copyToClipboard(contractOwner, "Owner address")
      }
      className="mt-3 inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {copiedField === "Owner address" ? (
        <FiCheckCircle className="mr-2 h-4 w-4" />
      ) : (
        <FiCopy className="mr-2 h-4 w-4" />
      )}

      {copiedField === "Owner address" ? "Copied" : "Copy owner"}
    </button>
  </div>
</div>
          </section>

          <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <FiClock className="h-5 w-5 text-slate-500" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">System activity</h2>
            </div>

            <div className="mt-5 space-y-4">
              {[
                {label: "Contract status", value: isPaused ? "Maintenance mode enabled" : "Ready for transactions"},
                {label: "Campaign activity", value: `${totalCampaigns} campaigns recorded on-chain`},
                {label: "Withdrawable fees", value: `${availableFees} ETH available for admin withdrawal`},
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Live</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}