import React, { useState } from "react";
import Web3 from "web3";
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

  const web3Modal = new Web3Modal({
    cacheProvider: true, // Keep the user's wallet cached
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider, // Required
        options: {
          rpc: {
            97: "https://data-seed-prebsc-1-s1.binance.org:8545/", // Binance Smart Chain Testnet
          },
          chainId: 97,
        },
      },
    },
  });

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const contractInstance = new web3.eth.Contract(abi, contractAddress);
      setContract(contractInstance);

      alert(`Wallet connected: ${accounts[0]}`);
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

  const executeClockFunction = async (methodName) => {
    if (!contract) return alert("Connect your wallet first!");
    if (!location) return alert("Fetch location first!");

    setLoading(true);
    try {
      await contract.methods[methodName](location).send({ from: account });
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
      const fetchedRecords = await contract.methods.getClockRecords(account).call();
      setRecords(fetchedRecords);
      alert("Records fetched successfully!");
    } catch (error) {
      console.error("Error fetching records:", error);
      alert("Error fetching records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Employee Clock App</h1>
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
