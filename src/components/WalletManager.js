import React, { useState, useEffect } from "react";
import {
  createWallet,
  loadWallet,
  getWalletBalance,
  loadWalletAddressFromLocalStorage,
  saveWalletToLocalStorage,
} from "../utils/walletUtils";

const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/"; // BSC Testnet

const WalletManager = ({ setContract }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [balance, setBalance] = useState("0");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Load wallet address from localStorage on component mount
  useEffect(() => {
    const loadWalletOnInit = async () => {
      const savedAddress = loadWalletAddressFromLocalStorage();
      if (savedAddress) {
        console.log(`Found saved wallet address: ${savedAddress}`);
        // Optionally, fetch balance or set up contract here
      }
    };
    loadWalletOnInit();
  }, []);

  // Create a new wallet
  const handleCreateWallet = async () => {
    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const wallet = createWallet(password); // Generate wallet
      const walletBalance = await getWalletBalance(wallet); // Fetch balance
      setWalletDetails(wallet);
      setBalance(walletBalance);
      saveWalletToLocalStorage(wallet.address); // Save address to localStorage
      setContract(wallet); // Pass wallet to initialize the contract
      alert(`Wallet created successfully: ${wallet.address}`);
    } catch (error) {
      console.error("Wallet creation failed:", error);
      alert("Failed to create wallet. Please try again.");
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
      alert("Failed to load wallet. Please check your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Wallet Management</h2>
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
        </div>
      )}
    </div>
  );
};

export default WalletManager;
