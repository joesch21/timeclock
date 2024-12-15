import React, { useState } from "react";
import { ethers } from "ethers"; // Import ethers
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import abi from "./abi/EmployeeClockABI.json";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState(null);
  const [location, setLocation] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const contractAddress = "0x61f305b899f70aef26192fc8a81551b252bffcb8";

  // Predefined worksite location
  const predefinedLocation = { lat: -33.947346, long: 151.179428 }; // Sydney ITP location
  const maxDistance = 20; // Tolerance in kilometers

  // Web3Modal setup
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            97: "https://data-seed-prebsc-1-s1.binance.org:8545/", // BSC Testnet
          },
          chainId: 97,
        },
      },
    },
  });

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance); // Web3Modal with ethers.js
      const signer = await provider.getSigner();

      const userAccount = await signer.getAddress();
      setAccount(userAccount);

      const contractInstance = new ethers.Contract(contractAddress, abi, signer);
      setContract(contractInstance);

      alert(`Wallet connected: ${userAccount}`);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
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
    const R = 6371; // Radius of Earth in kilometers

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const executeClockFunction = async (methodName) => {
    if (!contract) return alert("Connect your wallet first!");
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
    if (!contract) return alert("Connect your wallet first!");

    setLoading(true);
    try {
      console.log("Fetching records for:", account);
      const fetchedRecords = await contract.getClockRecords(account);
      console.log("Fetched records:", fetchedRecords);

      if (fetchedRecords && fetchedRecords.length > 0) {
        setRecords(fetchedRecords);
        alert("Records fetched successfully!");
      } else {
        alert("No records found.");
      }
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
      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <p>Account: {account || "Not Connected"}</p>
      <button className="btn btn-primary" onClick={connectWallet}>
        Connect Wallet
      </button>
      <button className="btn btn-secondary ml-2" onClick={getGeolocation}>
        Get Location
      </button>
      <p>Location: {location || "Not fetched yet"}</p>
      <button className="btn btn-success ml-2" onClick={() => executeClockFunction("clockIn")} disabled={loading}>
        Clock In
      </button>
      <button className="btn btn-danger ml-2" onClick={() => executeClockFunction("clockOut")} disabled={loading}>
        Clock Out
      </button>
      <button className="btn btn-info ml-2" onClick={fetchRecords} disabled={loading}>
        Fetch Records
      </button>
      <div className="card mt-4">
        <div className="card-body">
          <h3>Clock Records:</h3>
          <ul>
            {records.map((record, index) => (
              <li key={index}>
                Timestamp: {new Date(Number(record.timestamp) * 1000).toLocaleString()}, Location: {record.location}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;

