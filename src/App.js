import React, { useState } from "react";
import WalletManager from "./components/WalletManager";
import GeolocationManager from "./components/GeolocationManager";
import ClockFunctionsManager from "./components/ClockFunctionsManager";
import TransactionHistory from "./components/TransactionHistory";
import { ethers } from "ethers";
import abi from "./components/EmployeeClockABI.json";
import "./App.css";

const rpcUrl =
  process.env.REACT_APP_RPC_URL ||
  "https://data-seed-prebsc-1-s1.binance.org:8545/"; // Default to BSC Testnet
const contractAddress = "0x61f305b899f70aef26192fc8a81551b252bffcb8";

const App = () => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [proximity, setProximity] = useState(false);

  // Initialize the contract using the provided wallet
  const initializeContract = (wallet) => {
    if (!wallet) {
      console.error("Wallet is required to initialize the contract.");
      alert("Error: Wallet not initialized. Please load or create a wallet first.");
      return;
    }

    try {
      const newProvider = new ethers.JsonRpcProvider(rpcUrl); // Initialize provider
      setProvider(newProvider);

      const signer = wallet.connect(newProvider); // Connect wallet to provider
      const initializedContract = new ethers.Contract(contractAddress, abi, signer);
      setContract(initializedContract); // Save contract in state
      setWalletAddress(wallet.address); // Save wallet address in state
      console.log("Contract initialized:", initializedContract);
    } catch (error) {
      console.error("Failed to initialize the contract:", error);
      alert("Error: Failed to initialize the contract. Please check your connection or configuration.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Sydney ITP Clock App</h1>

      {/* Wallet Manager: Handles wallet creation/loading */}
      <WalletManager setContract={initializeContract} rpcUrl={rpcUrl} />

      {/* Geolocation Manager: Handles user location and proximity */}
      <GeolocationManager setLocation={setUserLocation} setProximity={setProximity} />

      {/* Clock Functions Manager: Handles clock in/out operations */}
      {contract && (
        <ClockFunctionsManager
          contract={contract}
          location={userLocation}
          proximity={proximity}
        />
      )}

      {/* Transaction History: Fetch and display transaction history */}
      {provider && walletAddress && (
        <TransactionHistory provider={provider} walletAddress={walletAddress} />
      )}
    </div>
  );
};

export default App;
