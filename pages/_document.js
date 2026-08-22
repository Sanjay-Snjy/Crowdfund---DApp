import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="CrowdFund DApp — Decentralized crowdfunding on the blockchain. Create campaigns, contribute ETH, and track milestones transparently." />
        <meta name="theme-color" content="#080D1A" />
        <meta name="application-name" content="CrowdFund DApp" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CrowdFund DApp" />
        <meta property="og:description" content="Decentralized crowdfunding on the blockchain. Create campaigns, contribute ETH, and track milestones transparently." />
        <meta property="og:site_name" content="CrowdFund DApp" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="CrowdFund DApp" />
        <meta name="twitter:description" content="Decentralized crowdfunding on the blockchain." />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo2.gif" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
