import { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CAMPAIGN_CREATION_FEE,
} from "../constants";
import { CROWDFUNDING_ABI } from "../constants/abi";
import { toast } from "react-hot-toast";

export const useContract = () => {
  const { address, isConnected } = useAccount();

  const useCreateCampaign = (
    title,
    description,
    metadataHash,
    targetAmount,
    duration
  ) => {
    const { config, error: prepareError } = usePrepareContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "createCampaign",
      args: title
        ? [title, description, metadataHash, targetAmount, duration]
        : undefined,
      value: title
  ? ethers.utils.parseEther(CAMPAIGN_CREATION_FEE)
  : undefined,
      enabled: Boolean(address && CONTRACT_ADDRESS && title),
    });

    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        ...config,
        onSuccess(data) {
          toast.success("Campaign created successfully!");
        },
        onError(error) {
          console.error("Contract write error:", error);
          toast.error(error?.message || "Transaction failed");
        },
      }
    );

    return {
      createCampaign: write,
      createCampaignAsync: writeAsync,
      isLoading,
      isSuccess,
      error: error || prepareError,
      isPrepared: Boolean(config?.request),
    };
  };

  // Simple create campaign without prepare
  const useCreateCampaignSimple = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "createCampaign",
        onSuccess(data) {
          toast.success("Campaign created successfully!");
        },
        onError(error) {
          console.error("Contract write error:", error);
          toast.error(error?.message || "Transaction failed");
        },
      }
    );

    return {
      createCampaign: write,
      createCampaignAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useContributeToCampaignSimple = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "contributeToCampaign",
        onSuccess(data) {
          console.log("✅ Contribution transaction successful:", data);
          toast.success("Contribution made successfully!");
        },
        onError(error) {
          console.error("❌ Contribution transaction failed:", error);
          toast.error(error?.message || "Transaction failed");
        },
      }
    );

    return {
      contribute: write,
      contributeAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  // Withdraw Campaign Funds
  const useWithdrawFunds = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "withdrawCampaignFunds",
        onSuccess(data) {
          toast.success("Funds withdrawn successfully!");
        },
        onError(error) {
          toast.error(error?.message || "Transaction failed");
        },
      }
    );

    return {
      withdrawFunds: write,
      withdrawFundsAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  // Get Refund
  const useGetRefund = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "getRefund",
        onSuccess(data) {
          toast.success("Refund processed successfully!");
        },
        onError(error) {
          toast.error(error?.message || "Transaction failed");
        },
      }
    );

    return {
      getRefund: write,
      getRefundAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useAddMilestone = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "addCampaignMilestone",
      onSuccess() {
        toast.success("Milestone added successfully!");
      },
      onError(err) {
        console.error("Milestone add error:", err);
        toast.error(err?.message || "Failed to add milestone");
      },
    });

    return {
      addMilestone: write,
      addMilestoneAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useRequestMilestoneVote = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "requestMilestoneVote",
      onSuccess() {
        toast.success("Milestone vote requested successfully!");
      },
      onError(err) {
        console.error("Milestone vote request error:", err);
        toast.error(err?.message || "Failed to request milestone vote");
      },
    });

    return {
      requestMilestoneVote: write,
      requestMilestoneVoteAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useVoteOnMilestone = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "voteOnMilestone",
      onSuccess() {
        toast.success("Vote submitted successfully!");
      },
      onError(err) {
        console.error("Vote on milestone error:", err);
        toast.error(err?.message || "Failed to submit vote");
      },
    });

    return {
      voteOnMilestone: write,
      voteOnMilestoneAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useReleaseMilestoneFunds = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "releaseMilestoneFunds",
      onSuccess() {
        toast.success("Milestone funds released successfully!");
      },
      onError(err) {
        console.error("Release milestone funds error:", err);
        toast.error(err?.message || "Failed to release milestone funds");
      },
    });

    return {
      releaseMilestoneFunds: write,
      releaseMilestoneFundsAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useMilestoneCount = (campaignId) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getMilestoneCount",
      args: campaignId ? [campaignId] : undefined,
      enabled: Boolean(campaignId && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useMilestone = (campaignId, milestoneIndex) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getMilestone",
      args:
        campaignId !== undefined && milestoneIndex !== undefined
          ? [campaignId, milestoneIndex]
          : undefined,
      enabled:
        Boolean(campaignId !== undefined && milestoneIndex !== undefined && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useMilestoneVoted = (campaignId, milestoneIndex, contributor) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "hasVotedOnMilestone",
      args:
        campaignId !== undefined && milestoneIndex !== undefined && contributor
          ? [campaignId, milestoneIndex, contributor]
          : undefined,
      enabled:
        Boolean(campaignId !== undefined && milestoneIndex !== undefined && contributor && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useCampaignMilestones = (campaignId) => {
    const {
      data: milestones,
      isLoading: loadingMilestones,
      error: milestoneError,
    } = useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getMilestones",
      args: campaignId ? [campaignId] : undefined,
      enabled: Boolean(campaignId && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });

    const count = milestones ? milestones.length : 0;

    const processedMilestones = useMemo(() => {
      if (!milestones) return [];
      return milestones.map((m, index) => ({
        campaignId,
        index,
        title: m.title,
        description: m.description,
        amount: m.amount,
        completed: m.completed,
        voteRequested: m.voteRequested,
        fundsReleased: m.fundsReleased,
        approvals: m.approvals,
        rejections: m.rejections,
        createdAt: m.createdAt,
      }));
    }, [milestones, campaignId]);

    return {
      data: processedMilestones,
      count,
      isLoading: loadingMilestones,
      error: milestoneError,
    };
  };

  // Read Functions
  const useCampaign = (campaignId) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getCampaign",
      args: [campaignId],
      enabled: Boolean(campaignId && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useActiveCampaigns = (offset = 0, limit = 10) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getActiveCampaigns",
      args: [offset, limit],
      enabled: Boolean(CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 10000,
    });
  };

  const useUserCampaigns = (userAddress) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getUserCampaigns",
      args: [userAddress],
      enabled: Boolean(userAddress && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useUserContributions = (userAddress) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getUserContributions",
      args: [userAddress],
      enabled: Boolean(userAddress && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useCampaignStats = (campaignId) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getCampaignStats",
      args: [campaignId],
      enabled: Boolean(campaignId && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useContractStats = () => {
    const { data: rawStats, ...rest } = useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getContractStats",
      enabled: Boolean(CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 10000,
    });

    const processedData = rawStats
      ? {
          totalCampaigns: rawStats[0],
          totalFees: rawStats[1],
          contractBalance: rawStats[2],
        }
      : null;

    return {
      data: processedData,
      rawData: rawStats,
      ...rest,
    };
  };

  const useContribution = (campaignId, contributorAddress) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getContribution",
      args: [campaignId, contributorAddress],
      enabled: Boolean(campaignId && contributorAddress && CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useMultipleCampaigns = (rawCampaignIds) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Depend on the *values* of the ids rather than the array reference.
    // Callers often build this array inline (e.g. ids.map(Number)), which produces a
    // new reference on every render. Keying the memos/effects below on a primitive
    // signature keeps them stable and prevents a setState-per-render loop, which
    // would otherwise starve React and block client-side route changes.
    const idsKey = Array.isArray(rawCampaignIds)
      ? rawCampaignIds.map((id) => String(id)).join(",")
      : "";
    const hasIds = Array.isArray(rawCampaignIds);

    const campaignIds = useMemo(
      () => (hasIds ? rawCampaignIds : undefined),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [hasIds, idsKey]
    );

    // Prepare contract calls for all campaigns
    const campaignContracts = useMemo(() => {
      if (!campaignIds || campaignIds.length === 0) return [];

      return campaignIds.map((campaignId) => ({
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "getCampaign",
        args: [campaignId],
      }));
    }, [campaignIds]);

    // Fetch all campaigns data
    const {
      data: campaignsData,
      isLoading: contractLoading,
      error: contractError,
    } = useContractReads({
      contracts: campaignContracts,
      enabled: campaignContracts.length > 0,
      staleTime: 5000,
    });

    useEffect(() => {
      if (campaignsData && campaignIds) {
        try {
          const formattedCampaigns = campaignsData
            .map((result, index) => {
              if (result.status === "success" && result.result) {
                const campaignData = result.result;

                return {
                  id: campaignData.id,
                  creator: campaignData.creator,
                  title: campaignData.title,
                  description: campaignData.description,
                  metadataHash: campaignData.metadataHash,
                  targetAmount: campaignData.targetAmount,
                  raisedAmount: campaignData.raisedAmount,
                  deadline: campaignData.deadline,
                  withdrawn: campaignData.withdrawn,
                  active: campaignData.active,
                  createdAt: campaignData.createdAt,
                  contributorsCount: campaignData.contributorsCount,
                };
              }
              console.error(
                `Failed to fetch campaign ${campaignIds[index]}:`,
                result.error
              );
              return null;
            })
            .filter(Boolean);

          setCampaigns(formattedCampaigns);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err);
          setLoading(false);
        }
      } else if (campaignIds && campaignIds.length === 0) {
        setCampaigns([]);
        setLoading(false);
      } else if (!contractLoading) {
        setLoading(false);
      }
    }, [campaignsData, campaignIds, contractLoading]);

    useEffect(() => {
      if (contractError) {
        setError(contractError);
        setLoading(false);
      }
    }, [contractError]);

    return { campaigns, loading: loading || contractLoading, error };
  };

  const useUserCampaignsWithDetails = (userAddress) => {
    const { data: campaignIds, isLoading: loadingIds } =
      useUserCampaigns(userAddress);
    const {
      campaigns,
      loading: loadingCampaigns,
      error,
    } = useMultipleCampaigns(campaignIds);

    return {
      campaigns,
      campaignIds,
      loading: loadingIds || loadingCampaigns,
      error,
    };
  };

  const useUserContributionsWithDetails = (userAddress) => {
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { data: contributionCampaignIds, isLoading: loadingIds } =
      useUserContributions(userAddress);

    // Prepare contract calls for both campaign details and user contributions
    const contractCalls = useMemo(() => {
      if (
        !contributionCampaignIds ||
        contributionCampaignIds.length === 0 ||
        !userAddress
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
          args: [numericId, userAddress],
        });
      });

      return calls;
    }, [contributionCampaignIds, userAddress]);

    // Fetch all data
    const {
      data: contractData,
      isLoading: loadingData,
      error: contractError,
    } = useContractReads({
      contracts: contractCalls,
      enabled: contractCalls.length > 0,
      staleTime: 5000,
    });

    useEffect(() => {
      if (contractData && contributionCampaignIds && userAddress) {
        try {
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
                  timestamp: null, // Note: Would need getCampaignContributions for timestamps
                });
              }
            }
          }

          setContributions(processedContributions);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err);
          setLoading(false);
        }
      } else if (
        contributionCampaignIds &&
        contributionCampaignIds.length === 0
      ) {
        setContributions([]);
        setLoading(false);
      } else if (!loadingIds && !loadingData) {
        setLoading(false);
      }
    }, [
      contractData,
      contributionCampaignIds,
      userAddress,
      loadingIds,
      loadingData,
    ]);

    useEffect(() => {
      if (contractError) {
        setError(contractError);
        setLoading(false);
      }
    }, [contractError]);

    return {
      contributions,
      loading: loading || loadingIds || loadingData,
      error,
    };
  };

  const useWithdrawFees = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "withdrawFees",
        onSuccess(data) {
          toast.success("Fees withdrawn successfully!");
        },
        onError(error) {
          toast.error(error?.reason || "Failed to withdraw fees");
        },
      }
    );

    return {
      withdrawFees: write,
      withdrawFeesAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const usePauseContract = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "pause",
        onSuccess(data) {
          toast.success("Contract paused successfully!");
        },
        onError(error) {
          toast.error(error?.reason || "Failed to pause contract");
        },
      }
    );

    return {
      pauseContract: write,
      pauseContractAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useUnpauseContract = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "unpause",
        onSuccess(data) {
          toast.success("Contract unpaused successfully!");
        },
        onError(error) {
          toast.error(error?.reason || "Failed to unpause contract");
        },
      }
    );

    return {
      unpauseContract: write,
      unpauseContractAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useEmergencyWithdraw = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "emergencyWithdraw",
        onSuccess(data) {
          toast.success("Emergency withdrawal completed!");
        },
        onError(error) {
          toast.error(error?.reason || "Failed to emergency withdraw");
        },
      }
    );

    return {
      emergencyWithdraw: write,
      emergencyWithdrawAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useDeactivateCampaign = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "deactivateCampaign",
        onSuccess(data) {
          toast.success("Campaign deactivated successfully!");
        },
        onError(error) {
          toast.error(error?.reason || "Failed to deactivate campaign");
        },
      }
    );

    return {
      deactivateCampaign: write,
      deactivateCampaignAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useReactivateCampaign = () => {
    const { write, writeAsync, isLoading, isSuccess, error } = useContractWrite(
      {
        address: CONTRACT_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: "reactivateCampaign",
        onSuccess(data) {
          toast.success("Campaign reactivated successfully!");
        },
        onError(error) {
          toast.error(error?.reason || "Failed to reactivate campaign");
        },
      }
    );

    return {
      reactivateCampaign: write,
      reactivateCampaignAsync: writeAsync,
      isLoading,
      isSuccess,
      error,
    };
  };

  const useIsPaused = () => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "paused",
      enabled: Boolean(CONTRACT_ADDRESS),
      cacheTime: 30000,
      staleTime: 5000,
    });
  };

  const useContractOwner = () => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "owner",
      enabled: Boolean(CONTRACT_ADDRESS),
      cacheTime: 60000,
      staleTime: 30000,
    });
  };

  return {
    address,
    isConnected,
    useCreateCampaign,
    useCreateCampaignSimple,
    useContributeToCampaignSimple,
    useWithdrawFunds,
    useGetRefund,
    useAddMilestone,
    useRequestMilestoneVote,
    useVoteOnMilestone,
    useReleaseMilestoneFunds,
    useCampaignMilestones,
    useCampaign,
    useActiveCampaigns,
    useUserCampaigns,
    useUserContributions,
    useCampaignStats,
    useContractStats,
    useContribution,
    useMultipleCampaigns,
    useUserCampaignsWithDetails,
    useWithdrawFees,
    usePauseContract,
    useUnpauseContract,
    useEmergencyWithdraw,
    useDeactivateCampaign,
    useReactivateCampaign,
    useIsPaused,
    useContractOwner,
  };
};
