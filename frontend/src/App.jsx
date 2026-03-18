import { useState } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [sector, setSector] = useState("technology");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const sectors = [
    "technology",
    "banking",
    "energy",
    "pharma",
    "automobile",
    "realestate",
    "retail"
  ];

  const fetchAnalysis = async () => {
    setLoading(true);
    setError("");
    setReport("");

    try {
      const res = await fetch(
        `https://trade-qf5j.onrender.com/analyze/${sector}`,
        {
          headers: {
            Authorization: "Bearer mysecrettoken",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error");

      setReport(data.report);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const formatReport = (text) => {
    const sections = text.split("##").filter(Boolean);

    return sections.map((sec, i) => {
      const [title, ...content] = sec.split("\n");
      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "#1e1e1e",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "15px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)"
          }}
        >
          <h3 style={{ color: "#4CAF50", marginBottom: "10px" }}>
            {title.trim()}
          </h3>
          <p style={{ lineHeight: "1.6" }}>
            {content.join("\n")}
          </p>
        </motion.div>
      );
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111",
      color: "#fff",
      padding: "20px"
    }}>
      <h1 style={{
        textAlign: "center",
        fontSize: "34px",
        marginBottom: "25px"
      }}>
        📊 Trade Opportunities Analyzer
      </h1>

      <div style={{
        maxWidth: "700px",
        margin: "0 auto"
      }}>
        
        {/* Dropdown */}
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: "none",
            background: "#222",
            color: "#fff"
          }}
        >
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Button */}
        <button
          onClick={fetchAnalysis}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Analyze
        </button>

        {/* Loader */}
        {loading && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{
                width: "40px",
                height: "40px",
                border: "5px solid #333",
                borderTop: "5px solid #4CAF50",
                borderRadius: "50%",
                margin: "auto"
              }}
            />
            <p style={{ marginTop: "10px" }}>Analyzing market...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: "red", marginTop: "15px" }}>{error}</p>
        )}

        {/* Report */}
        <div style={{ marginTop: "20px" }}>
          {report && formatReport(report)}
        </div>
      </div>
    </div>
  );
}