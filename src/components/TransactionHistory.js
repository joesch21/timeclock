import React, { useState } from "react";
import "../TransactionHistory.css"; // Create a CSS file for the modal styles

const TransactionHistory = ({ walletAddress }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const apiKey = process.env.REACT_APP_BSCSCAN_API_KEY; // API key for BscScan
  const bscScanUrl = "https://api-testnet.bscscan.com/api";

  // Function selectors
  const CLOCK_IN_SELECTOR = "0xa0712d68"; // keccak256("clockIn(string)")
  const CLOCK_OUT_SELECTOR = "0xc2388669"; // keccak256("clockOut(string)")

  const fetchHistory = async () => {
    if (!walletAddress) {
      alert("Wallet address is missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${bscScanUrl}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
      );
      const data = await response.json();

      if (data.status !== "1") {
        console.error("Error fetching transactions:", data.message);
        alert("Failed to fetch transaction history. Please try again.");
        return;
      }

      const transactions = data.result
        .filter((tx) => tx.to && tx.to.toLowerCase() === "0x61f305b899f70aef26192fc8a81551b252bffcb8".toLowerCase())
        .map((tx) => {
          let method = "Unknown";
          if (tx.input.startsWith(CLOCK_IN_SELECTOR)) {
            method = "Clocked In";
          } else if (tx.input.startsWith(CLOCK_OUT_SELECTOR)) {
            method = "Clocked Out";
          }

          return {
            hash: tx.hash,
            method,
            block: tx.blockNumber,
            time: new Date(tx.timeStamp * 1000).toLocaleString("en-AU", {
              timeZone: "Australia/Sydney",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
          };
        });

      setHistory(transactions);
      setShowModal(true); // Show the modal with the history
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to fetch transaction history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Transaction History</h2>
      <button className="btn btn-info" onClick={fetchHistory} disabled={loading}>
        {loading ? "Fetching History..." : "Get History"}
      </button>

      {/* Modal for displaying history */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h3>Transaction History</h3>
            {history.length > 0 ? (
              <ul>
                {history.map((tx, index) => (
                  <li key={index}>
                    <strong>{tx.method}</strong> at Sydney Airport on {tx.time}.
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transactions found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
