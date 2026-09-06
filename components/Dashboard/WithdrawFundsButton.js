import { useState } from "react";
import { FiDollarSign, FiCheck, FiLoader } from "react-icons/fi";
import { useContract } from "../../hooks/useContract";
import { formatEther } from "../../utils/helpers";

export default function WithdrawFundsButton({ campaign, onRefresh }) {
  const { useWithdrawFunds } = useContract();
  const { withdrawFunds, isLoading } = useWithdrawFunds();

  const raised = parseFloat(formatEther(campaign.raisedAmount || 0));
  const target = parseFloat(formatEther(campaign.targetAmount || 0));
  const isFunded = raised >= target;
  const canWithdraw = isFunded && !campaign.withdrawn;

  if (!canWithdraw) {
    if (campaign.withdrawn) {
      return (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-success)" }}>
          <FiCheck className="w-3 h-3" />
          <span>Withdrawn</span>
        </div>
      );
    }
    return null;
  }

  const handleWithdraw = async () => {
    if (!withdrawFunds) return;
    try {
      await withdrawFunds({ args: [campaign.id] });
      onRefresh?.();
    } catch (e) {}
  };

  return (
    <button
      onClick={handleWithdraw}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
      style={{
        background: "rgba(34,197,94,0.12)",
        color: "#22c55e",
      }}
    >
      {isLoading ? (
        <FiLoader className="w-3 h-3 animate-spin" />
      ) : (
        <FiDollarSign className="w-3 h-3" />
      )}
      {isLoading ? "Withdrawing..." : `Withdraw ${raised.toFixed(2)} ETH`}
    </button>
  );
}
