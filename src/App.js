import React, { useState } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import abi from "./abi/EmployeeClockABI.json";
import './App.css';


const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);



const App = () => {
  const [account, setAccount] = useState(null);
  const [location, setLocation] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const contractAddress = "0x61f305b899f70aef26192fc8a81551b252bffcb8";

  // Predefined worksite location and max allowable distance (in km)
  const predefinedLocation = { lat: -33.947346, long: 151.179428 };
  const maxDistance = 0.5; // Maximum allowable distance in kilometers

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x61" }],
        });
      } catch (error) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x61",
                  chainName: "Binance Smart Chain Testnet",
                  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
                  nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://testnet.bscscan.com/"],
                },
              ],
            });
          } catch (addError) {
            console.error("Error adding Binance Testnet:", addError);
          }
        } else {
          console.error("Error switching to Binance Testnet:", error);
        }
      }
    }
  };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      await switchNetwork();
      const web3 = new Web3(provider);
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const contractInstance = new web3.eth.Contract(abi, contractAddress);
      setContract(contractInstance);
      alert("Wallet connected!");
    } else {
      alert("MetaMask not detected!");
    }
  };

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          setLocation(`${lat},${long}`);
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to fetch location. Please enable GPS.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Helper function to calculate distance using the Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180; // Convert degrees to radians
    const R = 6371; // Radius of Earth in kilometers

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const validateLocation = () => {
    if (!location) {
      alert("Location not fetched yet. Click 'Get Location' first!");
      return false;
    }

    const [userLat, userLong] = location.split(",").map(Number);
    const distance = calculateDistance(userLat, userLong, predefinedLocation.lat, predefinedLocation.long);

    if (distance > maxDistance) {
      alert(`You are not at work. Distance: ${distance.toFixed(2)} km`);
      return false;
    }

    return true;
  };

  const clockIn = async () => {
    if (!contract) return alert("Connect your wallet first!");
    if (!validateLocation()) return; // Validate location before proceeding

    setLoading(true);
    try {
      await contract.methods.clockIn(location).send({ from: account });
      alert("Clocked in successfully!");
    } catch (error) {
      console.error("Error clocking in:", error);
      alert("Error clocking in.");
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    if (!contract) return alert("Connect your wallet first!");
    if (!validateLocation()) return; // Validate location before proceeding

    setLoading(true);
    try {
      await contract.methods.clockOut(location).send({ from: account });
      alert("Clocked out successfully!");
    } catch (error) {
      console.error("Error clocking out:", error);
      alert("Error clocking out.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!contract) return alert("Connect your wallet first!");

    setLoading(true);
    try {
      const records = await contract.methods.getClockRecords(account).call();
      setRecords(records);
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
      <button className="btn btn-success ml-2" onClick={clockIn} disabled={loading}>
        Clock In
      </button>
      <button className="btn btn-danger ml-2" onClick={clockOut} disabled={loading}>
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
