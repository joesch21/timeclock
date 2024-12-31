import React, { useState } from "react";
import "../TransactionHistory.css";

const TransactionHistory = ({ walletAddress }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const apiKey = process.env.REACT_APP_BSCSCAN_API_KEY;
  const bscScanUrl = "https://api-testnet.bscscan.com/api";
  const contractAddress = "0x4ACFE507138b73393Bc97C8913d30f79892eF1f2";
  const eventSignature = "0x0079ac4295685a586013a8b5be23d0ecfa4c7530e906cc7a19bc98e821d1d49b";

  // Function to decode data
  const decodeData = (data) => {
    try {
      const timestampHex = data.slice(2, 66); // First 32 bytes
      const overtimeHex = data.slice(194, 258); // Third 32 bytes

      const timestamp = parseInt(timestampHex, 16); // Convert timestamp (Hex to Dec)
      const overtimeMinutes = parseInt(overtimeHex, 16); // Convert overtime (Hex to Dec)

      console.log("Decoding raw data:", data);
      console.log("Parsed Values:", { timestamp, overtimeMinutes });

      // Validate timestamp
      if (isNaN(timestamp) || timestamp < 0) {
        throw new Error("Invalid timestamp value.");
      }

      // Validate overtime (reasonable range: 0 to 720 minutes)
      if (isNaN(overtimeMinutes) || overtimeMinutes < 0 || overtimeMinutes > 12 * 60) {
        console.warn("Invalid or unrealistic overtime detected:", overtimeMinutes);
        return null; // Skip invalid entries
      }

      return {
        timestamp: new Date(timestamp * 1000).toLocaleString("en-AU", {
          timeZone: "Australia/Sydney",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
        overtime: `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`, // Format overtime
        isOvertime: overtimeMinutes > 0, // Boolean for display
      };
    } catch (error) {
      console.error("Failed to decode log data:", error);
      return null;
    }
  };

  // Fetch transaction logs
  const fetchHistory = async () => {
    if (!walletAddress) {
      alert("Wallet address is missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${bscScanUrl}?module=logs&action=getLogs&address=${contractAddress}&fromBlock=0&toBlock=latest&apikey=${apiKey}`
      );
      const data = await response.json();

      console.log("Raw API Response:", data);

      if (data.status !== "1") {
        console.error("Error fetching logs:", data.message);
        alert("Failed to fetch transaction logs. Please try again.");
        return;
      }

      const transactions = data.result
        .filter((log) => log.topics[0] === eventSignature) // Match event signature
        .filter((log) => log.topics[1].toLowerCase() === `0x000000000000000000000000${walletAddress.toLowerCase().slice(2)}`) // Match wallet address
        .map((log) => {
          const decoded = decodeData(log.data);
          if (!decoded) return null; // Skip invalid logs

          return {
            employee: walletAddress,
            clockInTime: decoded.timestamp,
            overtime: decoded.overtime,
            isOvertime: decoded.isOvertime,
          };
        })
        .filter(Boolean); // Remove null entries

      console.log("Filtered Transactions:", transactions);
      setHistory(transactions);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Failed to fetch transaction logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div>
      <h2>Transaction History</h2>
      <button className="btn btn-info" onClick={fetchHistory} disabled={loading}>
        {loading ? "Fetching Logs..." : "Get History"}
      </button>

      {showModal && (
        <div className="modal" style={{ fontSize: isMobile ? "1.2rem" : "1rem" }}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h3>Transaction History</h3>
            {history.length > 0 ? (
              <ul>
                {history.map((tx, index) => (
                  <li key={index}>
                    <p>
                      <strong>Employee:</strong> {tx.employee} <br />
                      <strong>Clock-In Time:</strong> {tx.clockInTime} <br />
                      <strong>Overtime:</strong>{" "}
                      {tx.isOvertime ? (
                        <span style={{ color: "red" }}>{tx.overtime}</span>
                      ) : (
                        "No"
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transactions found for this wallet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
