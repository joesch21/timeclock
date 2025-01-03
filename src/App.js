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
const contractAddress = "0x4ACFE507138b73393Bc97C8913d30f79892eF1f2";

const App = () => {
  const [contract, setContract] = useState(null); // Smart contract instance
  const [provider, setProvider] = useState(null); // Provider instance
  const [walletDetails, setWalletDetails] = useState(null); // Wallet details (address and signer)
  const [location, setLocation] = useState(""); // User's current geolocation
  const [proximity, setProximity] = useState(false); // Proximity status

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
      setWalletDetails(wallet); // Save wallet details
      console.log("Contract initialized:", initializedContract);
    } catch (error) {
      console.error("Failed to initialize the contract:", error);
      alert("Error: Failed to initialize the contract. Please check your connection or configuration.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Clock In/Out App</h1>

      {/* Wallet Manager: Handles wallet creation/loading */}
      <WalletManager setWalletDetails={setWalletDetails} setContract={initializeContract} />

      {/* Geolocation Manager: Handles user location and proximity */}
      <GeolocationManager setLocation={setLocation} setProximity={setProximity} />

      {/* Clock Functions Manager: Handles clock in/out operations */}
      {contract && walletDetails && (
        <ClockFunctionsManager
          contract={contract}
          walletDetails={walletDetails}
          location={location}
          proximity={proximity}
        />
      )}

      {/* Transaction History: Fetch and display transaction history */}
      {provider && walletDetails?.address && (
        <TransactionHistory provider={provider} walletAddress={walletDetails.address} />
      )}
    </div>
  );
};

export default App;
