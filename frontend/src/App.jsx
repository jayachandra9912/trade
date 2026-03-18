import { useState } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const fetchAnalysis = async () => {
    if (!sector) return;

    setLoading(true);
    setError("");
    setReport("");

    try {
      const res = await fetch(`http://127.0.0.1:8000/analyze/${sector}`, {
        headers: {
          Authorization: "Bearer mysecrettoken",
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Error");

      setReport(data.report);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "32px", marginBottom: "20px" }}>
        Trade Opportunities Analyzer
      </h1>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <input
          type="text"
          placeholder="Enter sector (e.g. technology)"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <button
          onClick={fetchAnalysis}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {report && (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: "20px",
              background: "#222",
              padding: "15px",
              borderRadius: "10px",
              whiteSpace: "pre-wrap",
            }}
          >
            {report}
          </motion.pre>
        )}
      </div>
    </div>
  );
}