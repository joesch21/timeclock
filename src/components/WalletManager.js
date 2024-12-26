import React, { useState, useEffect } from "react";
import {
  createWallet,
  loadWallet,
  getWalletBalance,
  loadWalletsFromLocalStorage,
  saveWalletsToLocalStorage,
} from "../utils/walletUtils";

const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";

const WalletManager = ({ setContract }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [balance, setBalance] = useState("0");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedWallets, setSavedWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [error, setError] = useState(""); // For password validation errors

  useEffect(() => {
    // Load saved wallets from local storage on initialization
    const wallets = loadWalletsFromLocalStorage();
    setSavedWallets(wallets || []);
  }, []);

  const handleWalletAction = async (action) => {
    // Validate password length
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setError(""); // Clear error on valid input

    if (action === "create" && savedWallets.length > 0) {
      const confirmOverwrite = window.confirm(
        "A wallet is already saved. Creating a new wallet will add it to the list. Do you want to proceed?"
      );
      if (!confirmOverwrite) return;
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

      if (action === "create") {
        const updatedWallets = [...savedWallets, wallet.address];
        setSavedWallets(updatedWallets);
        saveWalletsToLocalStorage(updatedWallets);
        setShowSuccessModal(true);
      }

      setContract(wallet);
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

  const handleLoadSelectedWallet = async () => {
    if (!selectedWallet) {
      alert("Please select a wallet to load.");
      return;
    }

    setLoading(true);
    try {
      const wallet = loadWallet(password, rpcUrl);
      const walletBalance = await getWalletBalance(wallet);
      setWalletDetails(wallet);
      setBalance(walletBalance);
      setContract(wallet);
    } catch (error) {
      alert("Failed to load the selected wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Welcome to Your Personal Wallet Manager</h2>
      <p>
        This application allows you to create and manage a personal wallet on
        the Blockchain. Follow the steps below:
      </p>
      <ol>
        <li>Enter a secure password to create your wallet.</li>
        <li>Save your wallet address and pass the address to your manager.</li>
        <li>
          Use the same password to load your wallet and check your balance.
        </li>
      </ol>
      <div style={{ marginBottom: "1rem" }}>
        <p>
          <strong>Step 1:</strong> Enter a secure password to get started.
        </p>
        <input
          type="password"
          placeholder="Enter password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div>
        <button onClick={() => handleWalletAction("create")} disabled={loading}>
          {loading ? "Creating Wallet..." : "Create Wallet"}
        </button>
        <button onClick={() => handleWalletAction("load")} disabled={loading}>
          {loading ? "Loading Wallet..." : "Load Wallet"}
        </button>
      </div>

      {savedWallets.length > 0 && (
        <div>
          <p>
            <strong>Saved Wallets:</strong>
          </p>
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
          >
            <option value="">Select a wallet</option>
            {savedWallets.map((address) => (
              <option key={address} value={address}>
                {address}
              </option>
            ))}
          </select>
          <button onClick={handleLoadSelectedWallet} disabled={loading}>
            {loading ? "Loading Wallet..." : "Load Selected Wallet"}
          </button>
        </div>
      )}

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
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Wallet Created Successfully</h3>
            <p>Your wallet address: {walletDetails?.address}</p>
            <p>
              Save your wallet address securely. Use the same password to load this
              wallet later.
            </p>
            <button className="close-button" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default WalletManager;
