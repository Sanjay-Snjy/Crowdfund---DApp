import { useRouter } from "next/router";
import { useEffect } from "react";

export default function CampaignsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/all-campaigns"); }, [router]);
  return null;
}
