import { useState, useEffect, useMemo, useRef } from "react";
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
import { CONTRACT_ADDRESS } from "../../constants";

export default function CreateCampaignForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { user, isLoaded } = useUser();
  const { chain } = useNetwork();
  const { data: balanceData } = useBalance({
    address,
    enabled: Boolean(address),
  });
  const { useCreateCampaignSimple } = useContract();
  const { createCampaignAsync, isLoading } = useCreateCampaignSimple();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    duration: "",
    category: "General",
    tags: "",
    additionalInfo: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const milestoneListRef = useRef(null);

  const [rates, setRates] = useState(null);
  const creationFeeWei = ethers.utils.parseEther(CAMPAIGN_CREATION_FEE || "0");
  const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 0);
  const configuredNetworkName =
    process.env.NEXT_PUBLIC_NETWORK ||
    process.env.NEXT_PUBLIC_CHAIN_NAME ||
    "the configured network";
  const walletBalanceWei = balanceData?.value
    ? ethers.BigNumber.from(balanceData.value.toString())
    : ethers.BigNumber.from(0);

  useEffect(() => {
    let mounted = true;
    const fetchRates = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr,usd,eur,gbp"
        );
        const data = await res.json();
        if (mounted && data?.ethereum) {
          setRates(data.ethereum);
        }
      } catch (err) {
        console.error("Failed to load currency rates", err);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 1000 * 60 * 5); // refresh every 5 minutes
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const tagList = formData.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const categories = [
  "Student Projects",
  "Medical",
  "Startup",
  "Education",
  "Research and Innovation",
  "Social Causes",
  "Technology",
  "Agriculture",
  "Arts and Culture",
  "Environment",
  ];

  const suggestedTags = [
    "Startup",
    "Technology",
    "Innovation",
    "Education",
    "Health",
    "Community",
    "Environment",
    "Art",
    "Social Impact",
    "Sustainability",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSuggestedTagClick = (tag) => {
    const existingTags = tagList;
    if (existingTags.includes(tag)) return;

    const nextTags = [...existingTags, tag].join(", ");
    setFormData((prev) => ({
      ...prev,
      tags: nextTags,
    }));
  };

  const updateMilestone = (index, field, value) => {
    setMilestones((prev) =>
      prev.map((milestone, milestoneIndex) => {
        if (milestoneIndex !== index) return milestone;

        if (field === "title") {
          return { ...milestone, title: value };
        }

        const nextValue = Number(value);
        return {
          ...milestone,
          percentage: Number.isNaN(nextValue) ? 0 : Math.max(0, Math.min(100, nextValue)),
        };
      })
    );
  };

  const addMilestone = () => {
    if (milestones.length >= 3) {
      toast.error("You can add up to 3 milestones.");
      return;
    }

    setMilestones((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: `Milestone ${prev.length + 1}`,
        percentage: 0,
        status: "Pending",
      },
    ]);

    requestAnimationFrame(() => {
      milestoneListRef.current?.scrollTo({
        top: milestoneListRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const removeMilestone = (index) => {
    setMilestones((prev) => prev.filter((_, milestoneIndex) => milestoneIndex !== index));
  };

  const totalAllocation = useMemo(() => {
    return milestones.reduce((sum, milestone) => sum + (Number(milestone.percentage) || 0), 0);
  }, [milestones]);

  const isAllocationValid = milestones.length >= 1 && milestones.length <= 3 && totalAllocation === 100;

  const allocationMessage = useMemo(() => {
    if (milestones.length < 1) {
      return "At least one milestone is required.";
    }

    if (milestones.length > 3) {
      return "Maximum of 3 milestones allowed.";
    }

    if (totalAllocation !== 100) {
      return "Total allocation must equal 100%.";
    }

    return "✓ Milestone allocation is valid.";
  }, [milestones.length, totalAllocation]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Image size must be less than 10MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      toast.error("Valid target amount is required");
      return false;
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast.error("Valid duration is required");
      return false;
    }
    if (milestones.length < 1) {
      toast.error("At least one milestone is required");
      return false;
    }
    if (milestones.length > 3) {
      toast.error("Maximum of 3 milestones allowed");
      return false;
    }
    if (!isAllocationValid) {
      toast.error("Milestone allocation must total 100%");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (milestones.length < 1) {
      toast.error("Please add at least 1 milestone before creating a campaign.");
      return;
    }

    if (!validateForm()) return;

    if (!isConnected || !address) {
      toast.error("Please connect your wallet before creating a campaign.");
      return;
    }

    if (configuredChainId && chain?.id && chain.id !== configuredChainId) {
      toast.error(
        `Please switch your wallet to ${configuredNetworkName} (${configuredChainId}) before creating a campaign.`
      );
      return;
    }

    if (walletBalanceWei.lt(creationFeeWei)) {
      toast.error(
        `Insufficient funds for this transaction. Your wallet balance is too low to cover the required fee on the selected network.`
      );
      return;
    }

    // Check if createCampaignAsync function is available
    if (!createCampaignAsync) {
      toast.error(
        "Contract function not available. Please check your wallet connection and contract address."
      );
      console.error(
        "createCampaignAsync is undefined. CONTRACT_ADDRESS:",
        CONTRACT_ADDRESS
      );
      return;
    }

    setUploading(true);

    try {
      // Upload metadata to IPFS
      const metadataData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        milestones: milestones.map(({ title, percentage, status }) => ({
          title,
          percentage,
          status,
        })),
      };

      toast.loading("Uploading to IPFS...", { id: "upload" });
      const creatorName =
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        "Anonymous";

      const uploadResult = await uploadCampaignMetadata(
        {
          ...metadataData,
          creator: creatorName,
        },
        imageFile
      );
      toast.dismiss("upload");

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Prepare contract parameters
      const targetAmountWei = ethers.utils.parseEther(formData.targetAmount);
      const durationSeconds = parseInt(formData.duration) * 24 * 60 * 60; // Convert days to seconds

      console.log("Contract call parameters:", {
        title: formData.title,
        description: formData.description,
        metadataHash: uploadResult.metadataHash,
        targetAmount: targetAmountWei.toString(),
        duration: durationSeconds,
        value: creationFeeWei.toString(),
        contractAddress: CONTRACT_ADDRESS,
      });

      toast.loading("Creating campaign...", { id: "create" });

      // Call contract function
      const tx = await createCampaignAsync({
        args: [
          formData.title, // string _title
          formData.description, // string _description
          uploadResult.metadataHash, // string _metadataHash
          targetAmountWei, // uint256 _targetAmount
          durationSeconds, // uint256 _duration
        ],
        value: creationFeeWei,
      });

      console.log("Transaction submitted:", tx);

      toast.dismiss("create");
      toast.success("Campaign created successfully!");
      router.push("/my-campaigns");
    } catch (error) {
      toast.dismiss();
      console.error("Error creating campaign:", error);

      let errorMessage = "Failed to create campaign";
      if (error?.message) {
        if (
          error.message.includes("User rejected") ||
          error.message.includes("user rejected")
        ) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message.includes("ABI encoding")) {
          errorMessage =
            "Contract configuration error. Please contact support.";
        } else if (error.message.includes("execution reverted")) {
          errorMessage =
            "Transaction failed: " + (error.reason || "Unknown reason");
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className=" -mt-2 mx-auto -ml-[0.4px]  px-0 py-0">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-0">
          <div className=" rounded-[32px] border border-secondary bg-white/90 dark:bg-[#111827] dark:border-neutral-800 shadow-xl shadow-slate-200/40 px-8 py-2 sm:px-8 py-6">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-600 dark:text-blue-300">
                New campaign
              </p>
             
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Complete the form below to define your goal, story, and funding timeline.
              </p>
            </div>

            <div className="rounded-3xl -mt-2 border border-blue-100 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/40 px-5 py-2 mb-4">
              <div className="flex items-start gap-3">
                <FiInfo className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                    Creation fee notice
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    A fee of {formatEther(CAMPAIGN_CREATION_FEE)} ETH is required to create your campaign.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a compelling title"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Campaign Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your campaign, goals, and how funds will be used"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="-mt-2  block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="-mt-2 block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="365"
                      placeholder="30"
                      className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
               <div>
<div>
  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
    Target Amount (ETH)
  </label>

  <div className="grid gap-4 lg:grid-cols-[1fr_1fr] items-start">
    {/* Target Amount Input */}
    <div>
      <input
        type="number"
        name="targetAmount"
        value={formData.targetAmount}
        onChange={handleInputChange}
        step="0.01"
        min="0.01"
        placeholder="0.00"
        className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>

    {/* Conversion Cards */}
    {rates && (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-1 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            USD
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            {(parseFloat(formData.targetAmount || 0) * rates.usd).toFixed(2)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-1 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            INR
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            {(parseFloat(formData.targetAmount || 0) * rates.inr).toFixed(2)}
          </p>
        </div>
      </div>
    )}
  </div>
</div>
</div>
              </div>

              <div className="space-y-2">
                

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Campaign Image
                  </label>
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-700">
                      <img
                        src={imagePreview}
                        alt="Campaign preview"
                        className="h-56 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-slate-800"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex min-h-[140px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-950">
                      <FiUpload className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Upload a campaign image
                        </p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          PNG, JPG, GIF up to 10MB.
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="-mt-0 block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Share extra context, milestones, or team details"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>

                <div className="-mt-[40px] flex flex-col items-center justify-center gap-4">
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                    Ensure your campaign is clear and achievable.
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading || uploading}
                    className="w-full -mt-1 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-[16px] text-md font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading to IPFS..."
                      : isLoading
                      ? "Creating Campaign..."
                      : "Create Campaign"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <aside className="space-y-6 w-[502px]">
          <div className="sticky top-24 rounded-[32px] border border-slate-800/80 bg-slate-950/90 p-6 text-white shadow-xl shadow-slate-900/20">
            <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-white dark:text-blue-300">Milestone Planner</h3>
            <p className="mt-1 text-[15px] leading-6 text-slate-300">
              Define project milestones and allocate fund percentages.
            </p>

            <div
              ref={milestoneListRef}
              className="mt-2 max-h-[340px] space-y-3 overflow-y-auto rounded-[24px] border border-slate-800 bg-slate-900/90 p-1"
            >
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-4 transition hover:border-cyan-400/40 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-semibold text-cyan-300">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-300">Milestone {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-rose-400/30 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, "title", e.target.value)}
                      placeholder="Milestone title"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                    />

                    <div className="flex items-center gap-3">
                      <label className="min-w-[92px] text-sm text-slate-400">Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={milestone.percentage}
                        onChange={(e) => updateMilestone(index, "percentage", e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                      />
                      <span className="text-sm font-semibold text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">Total Allocation</span>
                <span className="font-semibold text-white">{totalAllocation}%</span>
              </div>

              <div className="mt-3 h-2.5 rounded-full bg-slate-800">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                {isAllocationValid ? (
                  <>
                    <FiCheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-300">{allocationMessage}</span>
                  </>
                ) : (
                  <>
                    <FiAlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-300">{allocationMessage}</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={addMilestone}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
            >
              <FiPlus className="h-4 w-4" />
              Add Milestone
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
