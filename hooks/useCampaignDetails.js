import { useContract } from "./useContract";

/**
 * Hook to fetch campaign details for a list of campaign IDs.
 * Uses useContract's useMultipleCampaigns for efficient batch reads.
 */
export const useCampaignDetails = (campaignIds) => {
  const { useMultipleCampaigns } = useContract();

  const normalizedIds = (campaignIds || []).map((id) => {
    if (typeof id === "bigint") return Number(id);
    if (id && typeof id.toString === "function") return Number(id.toString());
    return Number(id);
  });

  const {
    campaigns,
    loading,
    error,
  } = useMultipleCampaigns(normalizedIds);

  return { campaigns, loading, error };
};
