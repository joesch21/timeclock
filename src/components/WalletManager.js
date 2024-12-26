import React, { useState, useEffect } from "react";
import {
  createWallet,
  loadWallet,
  getWalletBalance,
  loadWalletAddressFromLocalStorage,
  saveWalletToLocalStorage,
} from "../utils/walletUtils";

const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/"; // BSC Testnet RPC URL

const WalletManager = ({ setContract }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [balance, setBalance] = useState("0");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load wallet address from localStorage on component mount
  useEffect(() => {
    const loadWalletOnInit = async () => {
      const savedAddress = loadWalletAddressFromLocalStorage();
      if (savedAddress) {
        try {
          setLoading(true);
          const wallet = loadWallet("default_password_placeholder", rpcUrl); // Dummy placeholder
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

    loadWalletOnInit();
  }, [setContract]);

  // Create a new wallet
  const handleCreateWallet = async () => {
    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const wallet = createWallet(password, rpcUrl); // Generate wallet with provider
      const walletBalance = await getWalletBalance(wallet); // Fetch balance
      setWalletDetails(wallet);
      setBalance(walletBalance);
      saveWalletToLocalStorage(wallet.address); // Save wallet address to localStorage
      setContract(wallet); // Pass wallet to initialize the contract
      setShowSuccessModal(true); // Show success modal
    } catch (error) {
      console.error("Wallet creation failed:", error);
      alert(`Failed to create wallet. Reason: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load an existing wallet
  const handleLoadWallet = async () => {
    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const wallet = loadWallet(password, rpcUrl); // Load wallet with provider
      const walletBalance = await getWalletBalance(wallet); // Fetch balance
      setWalletDetails(wallet);
      setBalance(walletBalance);
      setContract(wallet); // Pass wallet to initialize the contract
      alert("Wallet loaded successfully.");
    } catch (error) {
      console.error("Wallet loading failed:", error);
      alert(`Failed to load wallet. Reason: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Copy wallet address to clipboard
  const handleCopyWalletAddress = () => {
    if (!walletDetails?.address) {
      alert("No wallet address to copy.");
      return;
    }

    navigator.clipboard
      .writeText(walletDetails.address)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset copied status after 3 seconds
        alert("Wallet address copied to clipboard.");
      })
      .catch((error) => {
        console.error("Failed to copy wallet address:", error);
        alert("Failed to copy wallet address. Please try again.");
      });
  };

  // Send wallet address via email
  const handleSendEmail = () => {
    if (!walletDetails?.address) {
      alert("No wallet address to send.");
      return;
    }

    const email = "admin@example.com"; // Replace with admin's email
    const subject = "Wallet Address Submission";
    const body = `Hello,\n\nHere is my wallet address: ${walletDetails.address}\n\nThank you.`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div>
      <h2>Create or Load your Personal Clock Manager - New wallets need a Password</h2>
      <div style={{ marginBottom: "1rem" }}>
        <p>Please enter a secure password to create or load your wallet.</p>
        <input
          type="password"
          placeholder="Enter a secure password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <h3>Create Wallet</h3>
        <button onClick={handleCreateWallet} disabled={loading}>
          {loading ? "Creating Wallet..." : "Create Wallet"}
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h3>Load Wallet</h3>
        <button onClick={handleLoadWallet} disabled={loading}>
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
          <button onClick={() => setShowSuccessModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default WalletManager;
