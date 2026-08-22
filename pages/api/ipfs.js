import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getAuthHeader() {
  const jwt = process.env.PINATA_JWT;
  if (jwt) return { Authorization: `Bearer ${jwt}` };
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  if (apiKey && secretKey) {
    return { pinata_api_key: apiKey, pinata_secret_api_key: secretKey };
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeaders = getAuthHeader();
  if (!authHeaders) {
    return res.status(500).json({
      error: "Pinata IPFS credentials are not configured on the server.",
    });
  }

  const { type } = req.query;

  try {
    if (type === "file") {
      // Multipart file upload
      const form = new IncomingForm({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        keepExtensions: true,
      });

      const { files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ files });
        });
      });

      const file = files.file?.[0] || files.file;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const fileStream = fs.createReadStream(file.filepath || file.newFilename);
      const formData = new FormData();
      formData.append("file", fileStream, file.originalFilename || "upload");

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
        fs.unlinkSync(file.filepath || file.newFilename);
      } catch {}

      if (!response.ok) {
        const errText = await response.text();
        console.error("Pinata file upload failed:", response.status, errText);
        return res
          .status(502)
          .json({ error: "Failed to upload to IPFS", details: errText });
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
        return res
          .status(502)
          .json({ error: "Failed to upload JSON to IPFS", details: errText });
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
    console.error("IPFS proxy error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
