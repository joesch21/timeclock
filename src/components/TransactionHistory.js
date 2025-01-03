import React, { useState } from "react";
import "../TransactionHistory.css";

const TransactionHistory = ({ walletAddress }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const apiKey = process.env.REACT_APP_BSCSCAN_API_KEY;
  const bscScanUrl = "https://api-testnet.bscscan.com/api";
  const contractAddress = "0x4ACFE507138b73393Bc97C8913d30f79892eF1f2";

  const fetchBlockchainLogs = async () => {
    try {
      const response = await fetch(
        `${bscScanUrl}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`
      );
      const data = await response.json();

      if (data.status !== "1") {
        console.error("Failed to fetch transactions:", data.message);
        return [];
      }

      return data.result
        .filter((tx) => tx.to.toLowerCase() === contractAddress.toLowerCase()) // Filter transactions to the contract
        .map((tx) => {
          // Extract method ID from input data
          const methodId = tx.input.slice(0, 10);
          let action;

          if (methodId === "0x687473fb") action = "Clocked In"; // Method ID for ClockIn
          else if (methodId === "0x6b92bb2a") action = "Clocked Out"; // Method ID for ClockOut
          else return null; // Ignore unrelated transactions

          return {
            employee: tx.from,
            action,
            timestamp: new Date(tx.timeStamp * 1000).toLocaleString("en-AU", {
              timeZone: "Australia/Sydney",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
            txnHash: tx.hash,
            gasFee: `${(tx.gasUsed * tx.gasPrice) / 1e18} BNB`, // Calculate gas fee
          };
        })
        .filter(Boolean); // Remove null entries
    } catch (error) {
      console.error("Error fetching blockchain transactions:", error);
      return [];
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const blockchainLogs = await fetchBlockchainLogs();

      // Sort logs by timestamp
      blockchainLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setHistory(blockchainLogs);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Transaction History</h2>
      <button className="btn btn-info" onClick={fetchHistory} disabled={loading}>
        {loading ? "Fetching Logs..." : "Get History"}
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h3>Transaction History</h3>
            {history.length > 0 ? (
              <ul style={{ fontSize: "10px" }}> {/* General smaller font size */}
                {history.map((tx, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: "0.5rem",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <p>
                      <strong>Employee:</strong> {tx.employee} <br />
                      <strong>Action:</strong> {tx.action} <br />
                      <strong>Time:</strong> {tx.timestamp} <br />
                      <strong>Transaction Hash:</strong>{" "}
                      <span style={{ fontSize: "8px" }}>
                        <a
                          href={`https://testnet.bscscan.com/tx/${tx.txnHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {tx.txnHash}
                        </a>
                      </span>
                      <br />
                      <strong>Gas Fee:</strong> {tx.gasFee}
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
