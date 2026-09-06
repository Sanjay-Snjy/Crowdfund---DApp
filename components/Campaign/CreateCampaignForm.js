import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { FiUpload, FiX, FiInfo, FiPlus, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { useUser } from "@clerk/nextjs";
import { useContract } from "../../hooks/useContract";
import { uploadCampaignMetadata } from "../../utils/ipfs";
import { CAMPAIGN_CREATION_FEE } from "../../constants";
import { formatEther } from "../../utils/helpers";

const CATEGORIES = [
  "Student Projects", "Medical", "Startup", "Education", "Research and Innovation",
  "Social Causes", "Technology", "Agriculture", "Arts and Culture", "Environment",
];

export default function CreateCampaignForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { user } = useUser();
  const { chain } = useNetwork();
  const { data: balanceData } = useBalance({ address, enabled: Boolean(address) });
  const { useCreateCampaignSimple } = useContract();
  const { createCampaignAsync, isLoading } = useCreateCampaignSimple();
  const milestoneListRef = useRef(null);

  const [formData, setFormData] = useState({ title: "", description: "", targetAmount: "", duration: "", category: "Student Projects", tags: "", additionalInfo: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [milestones, setMilestones] = useState([{ id: 1, title: "Milestone 1", percentage: 100, status: "Pending" }]);
  const [rates, setRates] = useState(null);

  const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 0);
  const configuredNetworkName = process.env.NEXT_PUBLIC_NETWORK || "the configured network";
  const creationFeeWei = ethers.utils.parseEther(CAMPAIGN_CREATION_FEE || "0");
  const walletBalanceWei = balanceData?.value ? ethers.BigNumber.from(balanceData.value.toString()) : ethers.BigNumber.from(0);

  useEffect(() => {
    let mounted = true;
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr,usd")
      .then((r) => r.json())
      .then((d) => { if (mounted && d?.ethereum) setRates(d.ethereum); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const tagList = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const totalAllocation = milestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
  const isAllocationValid = milestones.length >= 1 && milestones.length <= 3 && totalAllocation === 100;

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addMilestone = () => {
    if (milestones.length >= 3) { toast.error("Max 3 milestones"); return; }
    setMilestones((prev) => [...prev, { id: prev.length + 1, title: `Milestone ${prev.length + 1}`, percentage: 0, status: "Pending" }]);
  };

  const removeMilestone = (index) => setMilestones((prev) => prev.filter((_, i) => i !== index));

  const updateMilestone = (index, field, value) => {
    setMilestones((prev) => prev.map((m, i) => i !== index ? m : { ...m, [field]: field === "percentage" ? Math.max(0, Math.min(100, Number(value) || 0)) : value }));
  };

  const validate = () => {
    if (!formData.title.trim()) { toast.error("Title required"); return false; }
    if (!formData.description.trim()) { toast.error("Description required"); return false; }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) { toast.error("Valid target amount required"); return false; }
    if (!formData.duration || parseInt(formData.duration) <= 0) { toast.error("Valid duration required"); return false; }
    if (milestones.length < 1) { toast.error("At least 1 milestone required"); return false; }
    if (!isAllocationValid) { toast.error("Milestones must total 100%"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !isConnected || !address) return;
    if (configuredChainId && chain?.id && chain.id !== configuredChainId) {
      toast.error(`Switch to ${configuredNetworkName}`); return;
    }
    if (walletBalanceWei.lt(creationFeeWei)) { toast.error("Insufficient funds"); return; }
    if (!createCampaignAsync) { toast.error("Contract not available"); return; }

    setUploading(true);
    try {
      toast.loading("Uploading to IPFS...", { id: "upload" });
      const creatorName = user?.fullName || user?.firstName || "Anonymous";
      const uploadResult = await uploadCampaignMetadata({
        ...formData,
        tags: tagList,
        milestones: milestones.map(({ title, percentage, status }) => ({ title, percentage, status })),
        creator: creatorName,
      }, imageFile);
      toast.dismiss("upload");
      if (!uploadResult.success) throw new Error(uploadResult.error);

      const targetWei = ethers.utils.parseEther(formData.targetAmount);
      const durationSec = parseInt(formData.duration) * 86400;

      toast.loading("Creating campaign...", { id: "create" });
      await createCampaignAsync({
        args: [formData.title, formData.description, uploadResult.metadataHash, targetWei, durationSec],
        value: creationFeeWei,
      });
      toast.dismiss("create");
      toast.success("Campaign created!");
      router.push("/my-campaigns");
    } catch (err) {
      toast.dismiss();
      toast.error(err?.message?.includes("rejected") ? "Transaction rejected" : "Failed to create campaign");
    } finally { setUploading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
      {/* ─── Left: Campaign Form ─── */}
      <div className="space-y-5">
        <div className="card p-6 rounded-3xl ">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-cyan-700">New Campaign</h3>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Complete the form below to launch campaign.
            </p>
          </div>

          {/* Creation Fee Notice */}
          <div className="flex items-start gap-3 px-4 py-2 rounded-2xl bg-cyan-600/10 dark:bg-cyan-900/20 border border-cyan-800/20 dark:border-cyan-800/40 mb-6">
            <FiInfo className="w-5 h-5 text-cyan-800 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Creation fee notice</p>
              <p className="text-xs text-cyan-600/80 dark:text-cyan-400/70 mt-0.5">
                A fee of {formatEther(CAMPAIGN_CREATION_FEE)} ETH is required to create your campaign.
              </p>
            </div>
          </div>

          {/* Two-column form layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Campaign Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a compelling title"
                  className="w-full rounded-3xl border px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Campaign Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your campaign, goals, and how funds will be used"
                  className="w-full rounded-3xl border px-4 py-2.5 text-sm outline-none resize-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-3xl border px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Duration (Days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    max="365"
                    placeholder="30"
                    className="w-full rounded-3xl border px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Target Amount (ETH)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="flex-1 rounded-3xl border px-4 py-2.5 w-[50px] text-sm outline-none transition focus:border-cyan-500"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                  />
                  {rates && formData.targetAmount > 0 && (
                    <>
                      <div className="flex flex-col items-center px-3 py-1 rounded-3xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>USD</span>
                        <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>${(parseFloat(formData.targetAmount) * rates.usd).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-1 rounded-3xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>INR</span>
                        <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>₹{(parseFloat(formData.targetAmount) * rates.inr).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Campaign Image</label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
                    <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-3xl bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 rounded-3xl border-2 border-dashed cursor-pointer transition-colors hover:border-cyan-400" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                    <FiUpload className="w-10 h-10 mb-2" style={{ color: "var(--color-text-muted)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Upload a campaign image</span>
                    <span className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>PNG, JPG, GIF up to 10MB.</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>Additional Information</label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Share extra context, milestones, or team details"
                  className="w-full rounded-3xl border px-4 py-2.5 text-sm outline-none resize-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: "var(--color-text-muted)" }}>
            Ensure your campaign is clear and achievable.
          </p>

          {/* Create Button */}
          <button
            type="submit"
            disabled={isLoading || uploading}
            className="w-full mt-5 py-3 rounded-3xl bg-cyan-600 text-white font-semibold text-sm transition hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : isLoading ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </div>

      {/* ─── Right: Milestone Planner ─── */}
      <div className="space-y-4">
        <div className="p-6 rounded-3xl bg-[#111827] text-white sticky top-20">
          {/* Header */}
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Milestone Planner</h3>
          <p className="text-xs text-slate-400 mt-1">Define project milestones and allocate fund percentages.</p>

          {/* Total Allocation */}
          <div className="mt-5 p-4 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Total Allocation</span>
              <span className={`text-sm font-bold ${isAllocationValid ? "text-cyan-400" : totalAllocation > 100 ? "text-red-400" : "text-white"}`}>
                {totalAllocation}%
              </span>
            </div>
            <div className="h-2 rounded-3xl bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-3xl transition-all duration-300 ${isAllocationValid ? "bg-cyan-600" : totalAllocation > 100 ? "bg-red-500" : "bg-cyan-500"}`}
                style={{ width: `${Math.min(totalAllocation, 100)}%` }}
              />
            </div>

            {/* Warning / Success */}
            <div className="flex items-center gap-2 mt-3">
              {isAllocationValid ? (
                <>
                  <FiCheckCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-400">Milestones are valid</span>
                </>
              ) : (
                <>
                  <FiAlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400">At least one milestone is required.</span>
                </>
              )}
            </div>
          </div>

          {/* Milestone List */}
          <div ref={milestoneListRef} className="mt-4 space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-hide">
            {milestones.map((m, i) => (
              <div key={i} className="p-3 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Milestone {i + 1}</span>
                  {milestones.length > 1 && (
                    <button type="button" onClick={() => removeMilestone(i)} className="text-xs text-red-400 hover:text-red-300 transition">
                      Remove
                    </button>
                  )}
                </div>
                <input
                  value={m.title}
                  onChange={(e) => updateMilestone(i, "title", e.target.value)}
                  placeholder="Milestone title"
                  className="w-full rounded-3xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-cyan-500 mb-2"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={m.percentage}
                    onChange={(e) => updateMilestone(i, "percentage", e.target.value)}
                    className="flex-1 rounded-3xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs text-slate-400 font-medium">%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Milestone Button */}
          <button
            type="button"
            onClick={addMilestone}
            disabled={milestones.length >= 3}
            className="w-full mt-4 py-2.5 rounded-3xl border-2 border-cyan-500/50 bg-cyan-500/10 text-cyan-400 font-medium text-sm transition hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiPlus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      </div>
    </form>
  );
}
