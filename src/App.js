import React, { useState } from "react";
import WalletManager from "./components/WalletManager";
import GeolocationManager from "./components/GeolocationManager";
import ClockFunctionsManager from "./components/ClockFunctionsManager";
import { ethers } from "ethers";
import abi from "./components/EmployeeClockABI.json";
import "./App.css";

const rpcUrl =
  process.env.REACT_APP_RPC_URL ||
  "https://data-seed-prebsc-1-s1.binance.org:8545/"; // Default to BSC Testnet
const contractAddress = "0x61f305b899f70aef26192fc8a81551b252bffcb8";

const App = () => {
  const [contract, setContract] = useState(null);
  const [location, setLocation] = useState("");
  const [proximity, setProximity] = useState(false);

  // Initialize the contract using the provided wallet
  const initializeContract = (wallet) => {
    if (!wallet) {
      console.error("Wallet is required to initialize the contract.");
      alert("Error: Wallet not initialized. Please load or create a wallet first.");
      return;
    }

    try {
      // Initialize contract with signer
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = wallet.connect(provider); // Connect wallet to provider
      const initializedContract = new ethers.Contract(contractAddress, abi, signer);
      setContract(initializedContract); // Save contract in state
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
      <GeolocationManager setLocation={setLocation} setProximity={setProximity} />

      {/* Clock Functions Manager: Handles clock in/out operations */}
      <ClockFunctionsManager contract={contract} location={location} proximity={proximity} />
    </div>
  );
};

export default App;
