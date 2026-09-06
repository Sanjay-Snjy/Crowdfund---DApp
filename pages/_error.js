function Error({ statusCode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: "#1e293b" }}>{statusCode || "Error"}</h1>
        <p style={{ fontSize: 16, color: "#64748b", marginTop: 8 }}>
          {statusCode ? `An error ${statusCode} occurred on server` : "An error occurred on client"}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 24, padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
