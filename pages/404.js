import Link from "next/link";
import Layout from "../components/Layout/Layout";

export default function Custom404() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-6xl font-bold" style={{ color: "var(--color-text-muted)" }}>404</p>
          <h1 className="text-xl font-bold mt-4" style={{ color: "var(--color-text)" }}>Page Not Found</h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>The page you're looking for doesn't exist.</p>
          <Link href="/" className="btn mt-6">Go Home</Link>
        </div>
      </div>
    </Layout>
  );
}
