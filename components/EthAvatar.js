export function EthAvatar({ address, ensImage, size = 40 }) {
  // Generate a consistent color from the address
  const bg = ensImage
    ? "transparent"
    : `#${address.slice(2, 8)}`;

  if (ensImage) {
    return (
      <img
        src={ensImage}
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: "50%" }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ETH Logo SVG */}
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 320 512"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
      </svg>
    </div>
  );
}
