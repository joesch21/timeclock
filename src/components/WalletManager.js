import React, { useState, useEffect } from "react";
import {
  createWallet,
  loadWallet,
  getWalletBalance,
  loadWalletAddressFromLocalStorage,
  saveWalletToLocalStorage,
} from "../utils/walletUtils";

const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";

const WalletManager = ({ setContract }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [balance, setBalance] = useState("0");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const initializeWallet = async () => {
      const savedAddress = loadWalletAddressFromLocalStorage();
      if (savedAddress) {
        try {
          setLoading(true);
          const wallet = loadWallet("default_password_placeholder", rpcUrl);
          const walletBalance = await getWalletBalance(wallet);
          setWalletDetails(wallet);
          setBalance(walletBalance);
          setContract(wallet);
        } catch (error) {
          console.error("Failed to load wallet on initialization:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    initializeWallet();
  }, [setContract]);

  const handleWalletAction = async (action) => {
    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const wallet =
        action === "create"
          ? createWallet(password, rpcUrl)
          : loadWallet(password, rpcUrl);

      const walletBalance = await getWalletBalance(wallet);
      setWalletDetails(wallet);
      setBalance(walletBalance);
      saveWalletToLocalStorage(wallet.address);
      setContract(wallet);

      if (action === "create") setShowSuccessModal(true);
    } catch (error) {
      alert(`Failed to ${action} wallet. Reason: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWalletAddress = async () => {
    if (!walletDetails?.address) {
      alert("No wallet address to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(walletDetails.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      alert("Wallet address copied to clipboard.");
    } catch (error) {
      alert("Failed to copy wallet address. Please try again.");
    }
  };

  return (
    <div>
      <h2>Welcome to Your Personal Clock Manager</h2>
      <p>
        This application allows you to create and manage a personal wallet on
        the Binance Smart Chain Testnet. Follow the steps below:
      </p>
      <ol>
        <li>Enter a secure password to create your wallet.</li>
        <li>Save your wallet address after creation for future use.</li>
        <li>
          Use the same password to load your wallet and check your balance.
        </li>
      </ol>
      <div style={{ marginBottom: "1rem" }}>
        <p><strong>Step 1:</strong> Enter a secure password to get started.</p>
        <input
          type="password"
          placeholder="Enter password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <button onClick={() => handleWalletAction("create")} disabled={loading}>
          {loading ? "Creating Wallet..." : "Create Wallet"}
        </button>
        <button onClick={() => handleWalletAction("load")} disabled={loading}>
          {loading ? "Loading Wallet..." : "Load Wallet"}
        </button>
      </div>

      {walletDetails && (
        <div>
          <p>
            <strong>Wallet Address:</strong> {walletDetails.address}
          </p>
          <p>
            <strong>Balance:</strong> {balance} BNB
          </p>
          <button onClick={handleCopyWalletAddress}>
            {copied ? "Copied!" : "Copy Wallet Address"}
          </button>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <h3>Wallet Created Successfully</h3>
          <p>Your wallet address: {walletDetails?.address}</p>
          <p>
            Save your wallet address securely. Use the same password to load
            this wallet later.
          </p>
          <button onClick={() => setShowSuccessModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default WalletManager;
