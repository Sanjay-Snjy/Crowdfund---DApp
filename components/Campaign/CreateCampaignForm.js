import { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { FiUpload, FiX, FiInfo } from "react-icons/fi";
import { useContract } from "../../hooks/useContract";
import { uploadCampaignMetadata } from "../../utils/ipfs";
import { CAMPAIGN_CREATION_FEE } from "../../constants";
import { formatEther } from "../../utils/helpers";
import { CONTRACT_ADDRESS } from "../../constants";

export default function CreateCampaignForm() {
  const router = useRouter();
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

  const tagList = formData.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const categories = [
    "Technology",
    "Creative",
    "Medical",
    "Education",
    "Environment",
    "Community",
    "Business",
    "General",
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      };

      toast.loading("Uploading to IPFS...", { id: "upload" });
      const uploadResult = await uploadCampaignMetadata(
        metadataData,
        imageFile
      );
      toast.dismiss("upload");

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Prepare contract parameters
      const targetAmountWei = ethers.utils.parseEther(formData.targetAmount);
      const durationSeconds = parseInt(formData.duration) * 24 * 60 * 60; // Convert days to seconds
      const creationFee = ethers.utils.parseEther(CAMPAIGN_CREATION_FEE); // Use fee from constants

      console.log("Contract call parameters:", {
        title: formData.title,
        description: formData.description,
        metadataHash: uploadResult.metadataHash,
        targetAmount: targetAmountWei.toString(),
        duration: durationSeconds,
        value: creationFee.toString(),
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
        value: creationFee,
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
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-0">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-secondary bg-white/90 dark:bg-[#111827] dark:border-neutral-800 shadow-xl shadow-slate-200/40 p-8 sm:p-10">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-600 dark:text-blue-300">
                New campaign
              </p>
             
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Complete the form below to define your goal, story, and funding timeline.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/40 p-5 mb-7">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
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
                    rows={5}
                    placeholder="Describe your campaign, goals, and how funds will be used"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Target Amount (ETH)
                  </label>
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
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

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
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

                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="startup, tech, innovation"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTagPopup((prev) => !prev)}
                    className="mt-3 inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
                  >
                    {showTagPopup ? "Hide suggested tags" : "Show suggested tags"}
                  </button>

                  {showTagPopup && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/20">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-3">
                        Pick a tag
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              handleSuggestedTagClick(tag);
                              setShowTagPopup(false);
                            }}
                            className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                  <label className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-950">
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Share extra context, milestones, or team details"
                  className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 resize-none"
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Make sure your campaign message is clear and the funding goal is achievable.
                </p>
                <button
                type="submit"
                disabled={isLoading || uploading}
                className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading
                  ? "Uploading to IPFS..."
                  : isLoading? "Creating Campaign...": "Create Campaign"}
                  </button>
                  </div>
            </form>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-6 rounded-[32px] border border-secondary bg-slate-950/90 p-6 text-white shadow-xl shadow-slate-900/20">
            <h3 className="text-xl font-semibold">Campaign Preview</h3>
            <p className="mt-3 text-sm text-slate-300">
              Review the details before submission. This preview mirrors what supporters will see.
            </p>

            <div className="mt-6 space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Title</p>
                <p className="text-lg font-semibold text-white">
                  {formData.title || "Campaign title goes here"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Goal</p>
                <p className="text-base text-slate-200">
                  {formData.targetAmount ? `${formData.targetAmount} ETH` : "0.00 ETH"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</p>
                  <p className="mt-2 text-sm text-slate-100">
                    {formData.duration ? `${formData.duration} days` : "Not set"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Category</p>
                  <p className="mt-2 text-sm text-slate-100">{formData.category}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagList.length > 0 ? (
                    tagList.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No tags added yet</span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Summary</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {formData.description || "Start with a strong campaign description that explains why your project matters."}
                </p>
              </div>
            </div>
          </div>

         
        </aside>
      </div>
    </div>
  );
}
