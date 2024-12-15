import React, { useState } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import axios from "axios";
import abi from "./abi/EmployeeClockABI.json";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState(null);
  const [location, setLocation] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const contractAddress = "0x61f305b899f70aef26192fc8a81551b252bffcb8";
  const apiKey = "HVYMP4JE3IHP4RMF5EYZD2RCSDBZHS4CQD"; // BscScan API Key

  const predefinedLocation = { lat: -33.947346, long: 151.179428 };
  const maxDistance = 20;

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: { 97: "https://data-seed-prebsc-1-s1.binance.org:8545/" },
          chainId: 97,
        },
      },
    },
  });

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      const userAccount = await signer.getAddress();
      setAccount(userAccount);

      const contractInstance = new ethers.Contract(contractAddress, abi, signer);
      setContract(contractInstance);
      alert(`Wallet connected: ${userAccount}`);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet.");
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

  const fetchBackupRecords = async () => {
    const apiURL = `https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${contractAddress}&apikey=${apiKey}`;

    setLoading(true);
    try {
      const response = await axios.get(apiURL);
      if (response.data.status === "1") {
        const transactions = response.data.result;
        const relevantRecords = transactions.filter(
          (tx) => tx.to.toLowerCase() === contractAddress.toLowerCase()
        );

        const processedRecords = relevantRecords.map((tx) => ({
          timestamp: new Date(Number(tx.timeStamp) * 1000).toLocaleString(),
          from: tx.from,
          hash: tx.hash,
        }));

        setRecords(processedRecords);
        alert("Backup records fetched successfully!");
      } else {
        alert("No backup records found.");
      }
    } catch (error) {
      console.error("Error fetching backup records:", error);
      alert("Failed to fetch backup records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!contract) {
      alert("Fetching backup records...");
      await fetchBackupRecords();
      return;
    }

    setLoading(true);
    try {
      const fetchedRecords = await contract.getClockRecords(account);
      setRecords(fetchedRecords);
      alert("Records fetched successfully!");
    } catch (error) {
      console.error("Error fetching records:", error);
      alert("Fallback to backup records.");
      await fetchBackupRecords();
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
      <button
        className="btn btn-info ml-2"
        onClick={fetchRecords}
        disabled={loading}
      >
        Fetch Records
      </button>
      <div className="card mt-4">
        <div className="card-body">
          <h3>Clock Records:</h3>
          <ul>
            {records.map((record, index) => (
              <li key={index}>
                {record.timestamp
                  ? `Timestamp: ${record.timestamp}, From: ${record.from}, Tx Hash: ${record.hash}`
                  : `Timestamp: ${new Date(
                      Number(record.timestamp) * 1000
                    ).toLocaleString()}, Location: ${record.location}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
