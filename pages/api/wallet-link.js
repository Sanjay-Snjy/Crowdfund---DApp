import { ethers } from "ethers";

const walletMappings = new Map();

function normalizeAddress(address) {
  return typeof address === "string" ? address.toLowerCase() : "";
}

export default function handler(req, res) {
  if (req.method === "GET") {
    const { clerkUserId } = req.query;
    if (!clerkUserId) {
      return res.status(400).json({ error: "Missing clerkUserId" });
    }

    const entry = walletMappings.get(clerkUserId);
    return res.status(200).json({ walletAddress: entry?.walletAddress || null });
  }

  if (req.method === "POST") {
    const {
      action,
      clerkUserId,
      walletAddress,
      nonce,
      signature,
      name,
      email,
    } = req.body || {};

    if (!clerkUserId || !walletAddress) {
      return res.status(400).json({ error: "Missing clerkUserId or walletAddress" });
    }

    if (action === "init") {
      const challenge = `Link wallet for ${clerkUserId}:${Date.now()}`;
      walletMappings.set(clerkUserId, {
        walletAddress: normalizeAddress(walletAddress),
        nonce: challenge,
        name: name || "",
        email: email || "",
        createdAt: Date.now(),
      });
      return res.status(200).json({ nonce: challenge });
    }

    if (action === "verify") {
      const entry = walletMappings.get(clerkUserId);
      if (!entry?.nonce || !signature) {
        return res.status(400).json({ error: "Missing wallet verification data" });
      }

      try {
        const message = entry.nonce;
        const signatureHex = signature.startsWith("0x") ? signature : `0x${signature}`;
        const recoveredAddress = ethers.utils.verifyMessage(message, signatureHex);
        const normalizedRecovered = normalizeAddress(recoveredAddress);
        const normalizedWallet = normalizeAddress(walletAddress);

        if (!normalizedRecovered || normalizedRecovered !== normalizedWallet) {
          return res.status(400).json({
            error: "Wallet signature verification failed",
            recoveredAddress: normalizedRecovered,
            expectedAddress: normalizedWallet,
          });
        }

        const updated = {
          ...entry,
          walletAddress: normalizedWallet,
          name: name || entry.name || "",
          email: email || entry.email || "",
          verifiedAt: Date.now(),
        };
        walletMappings.set(clerkUserId, updated);
        return res.status(200).json({ success: true, walletAddress: normalizedWallet });
      } catch (error) {
        return res.status(400).json({
          error: "Wallet signature verification failed",
          details: error.message,
        });
      }
    }

    return res.status(400).json({ error: "Unsupported action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
