import { useContract } from "../../hooks/useContract";
import { formatEther, formatNumber } from "../../utils/helpers";
import { StatsCard } from "./StatsCard";
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiActivity,
  FiAward,
} from "react-icons/fi";

export default function DashboardStats() {
  const { useContractStats, useActiveCampaigns, address } = useContract();
  const { data: contractStats } = useContractStats();
  const { data: campaigns } = useActiveCampaigns(0, 100);

  // Helper function to safely convert values to numbers
  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "bigint") return Number(value);
    if (typeof value === "string") return parseFloat(value) || 0;
    if (typeof value === "number") return value;
    return 0;
  };

  // Calculate additional stats with proper error handling
  const totalRaised =
    campaigns?.reduce((sum, campaign) => {
      try {
        const raisedAmount = campaign?.raisedAmount || 0;
        const ethValue = parseFloat(formatEther(raisedAmount));
        return sum + (isNaN(ethValue) ? 0 : ethValue);
      } catch (error) {
        console.warn("Error calculating raised amount:", error);
        return sum;
      }
    }, 0) || 0;

  const successfulCampaigns =
    campaigns?.filter((campaign) => {
      try {
        const raisedAmount = campaign?.raisedAmount || 0;
        const targetAmount = campaign?.targetAmount || 0;
        const raised = parseFloat(formatEther(raisedAmount));
        const target = parseFloat(formatEther(targetAmount));
        return !isNaN(raised) && !isNaN(target) && raised >= target;
      } catch (error) {
        console.warn("Error checking campaign success:", error);
        return false;
      }
    }).length || 0;

  const totalContributors =
    campaigns?.reduce((sum, campaign) => {
      try {
        const contributorsCount = safeNumber(campaign?.contributorsCount);
        return sum + contributorsCount;
      } catch (error) {
        console.warn("Error calculating contributors:", error);
        return sum;
      }
    }, 0) || 0;

  const activeCampaigns =
    campaigns?.filter((campaign) => {
      try {
        return Boolean(campaign?.active);
      } catch (error) {
        console.warn("Error checking campaign active status:", error);
        return false;
      }
    }).length || 0;

  const toUnix = (value) => {
    if (value == null) return 0;
    const stringValue = value?.toString?.() ?? String(value);
    return Number(stringValue) || 0;
  };

  const now = Math.floor(Date.now() / 1000);
  const oneMonth = 30 * 24 * 60 * 60;
  const recentWindowStart = now - oneMonth;
  const previousWindowStart = now - 2 * oneMonth;

  const recentCampaigns = campaigns?.filter((campaign) => {
    const createdAt = toUnix(campaign?.createdAt);
    return createdAt >= recentWindowStart;
  }) || [];

  const previousCampaigns = campaigns?.filter((campaign) => {
    const createdAt = toUnix(campaign?.createdAt);
    return createdAt >= previousWindowStart && createdAt < recentWindowStart;
  }) || [];

  const calculateTrendValue = (current, previous) => {
    if (previous <= 0) {
      return current <= 0 ? "0%" : "+100%";
    }
    const delta = ((current - previous) / previous) * 100;
    return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
  };

  const recentRaised =
    recentCampaigns.reduce((sum, campaign) => {
      try {
        return sum + parseFloat(formatEther(campaign?.raisedAmount || 0));
      } catch (error) {
        return sum;
      }
    }, 0) || 0;

  const previousRaised =
    previousCampaigns.reduce((sum, campaign) => {
      try {
        return sum + parseFloat(formatEther(campaign?.raisedAmount || 0));
      } catch (error) {
        return sum;
      }
    }, 0) || 0;

  const recentContributors =
    recentCampaigns.reduce((sum, campaign) => {
      try {
        return sum + safeNumber(campaign?.contributorsCount);
      } catch (error) {
        return sum;
      }
    }, 0) || 0;

  const previousContributors =
    previousCampaigns.reduce((sum, campaign) => {
      try {
        return sum + safeNumber(campaign?.contributorsCount);
      } catch (error) {
        return sum;
      }
    }, 0) || 0;

  const recentSuccessfulCount =
    recentCampaigns.filter((campaign) => {
      try {
        const raised = parseFloat(formatEther(campaign?.raisedAmount || 0));
        const target = parseFloat(formatEther(campaign?.targetAmount || 0));
        return !isNaN(raised) && !isNaN(target) && raised >= target;
      } catch (error) {
        return false;
      }
    }).length || 0;

  const previousSuccessfulCount =
    previousCampaigns.filter((campaign) => {
      try {
        const raised = parseFloat(formatEther(campaign?.raisedAmount || 0));
        const target = parseFloat(formatEther(campaign?.targetAmount || 0));
        return !isNaN(raised) && !isNaN(target) && raised >= target;
      } catch (error) {
        return false;
      }
    }).length || 0;

  const recentCampaignCount = recentCampaigns.length;
  const previousCampaignCount = previousCampaigns.length;
  const recentActiveCount = recentCampaigns.filter(
    (campaign) => Boolean(campaign?.active)
  ).length;
  const previousActiveCount = previousCampaigns.filter(
    (campaign) => Boolean(campaign?.active)
  ).length;

  // Safely format contract stats
  const totalCampaignsCount = safeNumber(contractStats?.totalCampaigns);
  const totalFeesAmount = contractStats?.totalFees || 0;

  const stats = [
    {
      title: "Total Campaigns",
      value: totalCampaignsCount.toString(),
      icon: FiTarget,
      color: "blue",
      trend: "up",
      trendValue: calculateTrendValue(
        recentCampaignCount,
        previousCampaignCount
      ),
    },
    {
      title: "Total Raised",
      value: `${totalRaised.toFixed(2)} ETH`,
      icon: FiDollarSign,
      color: "blue",
      trend: "up",
      trendValue: calculateTrendValue(recentRaised, previousRaised),
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns.toString(),
      icon: FiActivity,
      color: "blue",
      trend: "up",
      trendValue: calculateTrendValue(recentActiveCount, previousActiveCount),
    },
    {
      title: "Total Contributors",
      value: formatNumber(totalContributors),
      icon: FiUsers,
      color: "blue",
      trend: "up",
      trendValue: calculateTrendValue(
        recentContributors,
        previousContributors
      ),
    },
    {
      title: "Successful Campaigns",
      value: successfulCampaigns.toString(),
      icon: FiAward,
      color: "blue",
      trend: "up",
      trendValue: calculateTrendValue(
        recentSuccessfulCount,
        previousSuccessfulCount
      ),
    },
    {
      title: "Platform Fees",
      value: `${parseFloat(formatEther(totalFeesAmount)).toFixed(4)} ETH`,
      icon: FiTrendingUp,
      color: "blue",
      trend: "up",
      trendValue: "N/A",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
