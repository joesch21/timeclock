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

  // Load wallet address from localStorage on component mount
  useEffect(() => {
    const loadWalletOnInit = async () => {
      const savedAddress = loadWalletAddressFromLocalStorage();
      if (savedAddress) {
        try {
          setLoading(true);
          // Decrypt wallet only if a valid password is entered later
          const wallet = loadWallet("default_password_placeholder", rpcUrl); // Dummy placeholder
          const walletBalance = await getWalletBalance(wallet);
          setWalletDetails(wallet);
          setBalance(walletBalance);
          setContract(wallet);
          console.log("Wallet loaded successfully from local storage.");
        } catch (error) {
          console.error("Failed to load wallet on initialization:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadWalletOnInit();
  }, [setContract]); // Remove password dependency from here

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
      alert(`Wallet created successfully: ${wallet.address}`);
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
      <h2>Personal Wallet</h2>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleCreateWallet} disabled={loading}>
        {loading ? "Creating Wallet..." : "Create Wallet"}
      </button>
      <button onClick={handleLoadWallet} disabled={loading}>
        {loading ? "Loading Wallet..." : "Load Wallet"}
      </button>
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
          <button onClick={handleSendEmail}>Send Wallet Address via Email</button>
        </div>
      )}
    </div>
  );
};

export default WalletManager;
