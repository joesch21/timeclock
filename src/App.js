import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  createWallet,
  loadWallet,
  loadWalletWithProvider,
  getWalletBalance,
  resetWallet,
} from "./wallet";
import abi from "./abi/EmployeeClockABI.json";
import "./App.css";

const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/"; // BSC Testnet
const contractAddress = "0x61f305b899f70aef26192fc8a81551b252bffcb8";

const App = () => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [balance, setBalance] = useState("0");
  const [location, setLocation] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const predefinedLocation = { lat: -33.9324411, long: 151.1654545 };
  const maxDistance = 2; // in kilometers

  useEffect(() => {
    const initWallet = async () => {
      const existingWallet = loadWallet();
      if (existingWallet) {
        const wallet = loadWalletWithProvider(rpcUrl);
        const walletBalance = await getWalletBalance(rpcUrl);
        setWalletDetails(wallet);
        setBalance(walletBalance);
        setupContract(wallet);
      }
    };
    initWallet();
  }, []);

  const setupContract = (wallet) => {
    const contractInstance = new ethers.Contract(contractAddress, abi, wallet);
    setContract(contractInstance);
  };

  const handleCreateWallet = async () => {
    const newWallet = createWallet();
    const wallet = loadWalletWithProvider(rpcUrl);
    const walletBalance = await getWalletBalance(rpcUrl);
    setWalletDetails(wallet);
    setBalance(walletBalance);
    setupContract(wallet);
    alert(`New wallet created: ${newWallet.address}`);
  };
  

  const handleResetWallet = () => {
    const confirmReset = window.confirm("Are you sure you want to reset the wallet? This action cannot be undone.");
    if (confirmReset) {
      resetWallet();
      setWalletDetails(null);
      setBalance("0");
      alert("Wallet has been reset successfully.");
    }
  };
  

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if user is near the predefined location
          const distance = calculateDistance(latitude, longitude, predefinedLocation.lat, predefinedLocation.long);
  
          if (distance <= maxDistance) {
            setLocation("Sydney Airport"); // User is at or near the worksite
          } else {
            setLocation(`${latitude},${longitude}`); // Display coordinates if far away
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Failed to fetch location. Please enable GPS.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const executeClockFunction = async (methodName) => {
    if (!contract) return alert("Load or create a wallet first!");
    if (!location) return alert("Fetch location first!");

    const [userLat, userLong] = location.split(",").map(Number);
    const distance = calculateDistance(userLat, userLong, predefinedLocation.lat, predefinedLocation.long);

    if (distance > maxDistance) {
      return alert(`You are too far from the worksite. Distance: ${distance.toFixed(2)} km (Max: ${maxDistance} km)`);
    }

    setLoading(true);
    try {
      const tx = await contract[methodName](location);
      await tx.wait();
      alert(`${methodName === "clockIn" ? "Clocked in" : "Clocked out"} successfully!`);
    } catch (error) {
      console.error(`Error during ${methodName}:`, error);
      alert(`Error during ${methodName}.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!contract) return alert("Load or create a wallet first!");

    setLoading(true);
    try {
      const fetchedRecords = await contract.getClockRecords(walletDetails.address);
      setRecords(fetchedRecords);
      alert("Records fetched successfully!");
    } catch (error) {
      console.error("Error fetching records:", error);
      alert("Failed to fetch records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Sydney ITP Clock App</h1>
      {loading && <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>}
      
      {walletDetails ? (
        <>
          <p><strong>Wallet Address:</strong> {walletDetails.address}</p>
          <p><strong>Balance:</strong> {balance} BNB</p>
          <button className="btn btn-danger" onClick={handleResetWallet}>
            Reset Wallet
          </button>
        </>
      ) : (
        <button className="btn btn-primary" onClick={handleCreateWallet}>
          Create Wallet
        </button>
      )}

      <button className="btn btn-secondary ml-2" onClick={getGeolocation}>
        Get Location
      </button>
      <p><strong>Location:</strong> {location || "Not fetched yet"}</p>

      {walletDetails && (
        <>
          <button className="btn btn-success ml-2" onClick={() => executeClockFunction("clockIn")} disabled={loading}>
            Clock In
          </button>
          <button className="btn btn-danger ml-2" onClick={() => executeClockFunction("clockOut")} disabled={loading}>
            Clock Out
          </button>
          <button className="btn btn-info ml-2" onClick={fetchRecords} disabled={loading}>
            Fetch Records
          </button>
        </>
      )}

      <div className="card mt-4">
        <div className="card-body">
          <h3>Clock Records:</h3>
          <ul>
            {records.map((record, index) => (
              <li key={index}>
                <strong>Timestamp:</strong> {new Date(Number(record.timestamp) * 1000).toLocaleString()} | 
                <strong> Location:</strong> {record.location}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
