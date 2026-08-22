import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getAuthHeader() {
  const jwt = process.env.PINATA_JWT;
  if (jwt && jwt.trim()) {
    return { Authorization: `Bearer ${jwt.trim()}` };
  }
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  if (apiKey && secretKey && apiKey.trim() && secretKey.trim()) {
    return {
      pinata_api_key: apiKey.trim(),
      pinata_secret_api_key: secretKey.trim(),
    };
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeaders = getAuthHeader();
  if (!authHeaders) {
    console.error("IPFS proxy: No Pinata credentials configured");
    return res.status(500).json({
      error: "IPFS credentials not configured on server",
      details:
        "Set PINATA_JWT or PINATA_API_KEY + PINATA_SECRET_KEY in your Vercel environment variables. These should NOT have the NEXT_PUBLIC_ prefix.",
    });
  }

  const { type } = req.query;

  try {
    if (type === "file") {
      // Multipart file upload using formidable v3 API
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        keepExtensions: true,
      });

      const [fields, files] = await form.parse(req);

      const uploadedFile =
        (files.file && files.file[0]) || null;

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Read file into buffer and create a Blob
      const filePath = uploadedFile.filepath || uploadedFile.newFilename;
      const fileBuffer = fs.readFileSync(filePath);
      const fileBlob = new Blob([fileBuffer], {
        type: uploadedFile.mimetype || "application/octet-stream",
      });

      const formData = new FormData();
      formData.append("file", fileBlob, uploadedFile.originalFilename || "upload");

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: authHeaders,
          body: formData,
        }
      );

      // Clean up temp file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.warn("IPFS proxy: Failed to clean up temp file:", cleanupErr.message);
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error("Pinata file upload failed:", response.status, errText);
        return res.status(502).json({
          error: "Failed to upload to IPFS",
          details: errText,
          status: response.status,
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        hash: data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      });
    } else if (type === "json") {
      // JSON metadata upload
      let body = "";
      for await (const chunk of req) body += chunk;
      const jsonData = JSON.parse(body);

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify(jsonData),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Pinata JSON upload failed:", response.status, errText);
        return res.status(502).json({
          error: "Failed to upload JSON to IPFS",
          details: errText,
          status: response.status,
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        hash: data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      });
    } else {
      return res.status(400).json({ error: "Missing ?type=file or ?type=json" });
    }
  } catch (error) {
    console.error("IPFS proxy error:", error.message, error.stack);
    return res.status(500).json({
      error: error.message || "Internal server error",
      type: "server_error",
    });
  }
}
