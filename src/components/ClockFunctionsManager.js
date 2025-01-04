import React, { useState, useEffect } from "react";
import LocationManager from "./LocationManager";
import HistoryManager from "./HistoryManager";
import { formatTimestamp } from "../utils/locationUtils";

const ClockFunctionsManager = ({ contract, walletDetails }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [distanceToWorkplace, setDistanceToWorkplace] = useState(null);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [overtimeHours, setOvertimeHours] = useState("0");
  const [overtimeMinutes, setOvertimeMinutes] = useState("0");
  const [clockStatus, setClockStatus] = useState("needsClockIn"); // Clock status state
  const [clockTime, setClockTime] = useState(null);

  // Fetch real-time clock status from the smart contract on component load
  useEffect(() => {
    const fetchClockStatus = async () => {
      try {
        if (!contract || !walletDetails?.address) return;
        const isClockedIn = await contract.isClockedIn(walletDetails.address);
        setClockStatus(isClockedIn ? "clockedIn" : "needsClockIn");
      } catch (error) {
        console.error("Error fetching clock status:", error);
      }
    };

    fetchClockStatus();
  }, [contract, walletDetails]);

  // Function to handle Clock-In
  const handleClockIn = async () => {
    if (!contract) {
      alert("Contract not initialized.");
      return;
    }

    if (!currentLocation) {
      alert("Location not set. Please fetch your location first.");
      return;
    }

    try {
      setLoading(true);
      const isClocked = await contract.isClockedIn(walletDetails.address);
      if (isClocked) {
        alert("You are already clocked in. Please clock out first.");
        return;
      }

      const [latitude, longitude] = currentLocation.split(",").map(coord =>
        Math.round(parseFloat(coord) * 1e6)
      );
      const tx = await contract.clockIn(latitude, longitude);
      await tx.wait();

      const newRecord = {
        action: "Clocked In",
        location: currentLocation,
        timestamp: formatTimestamp(Date.now()),
      };
      setHistory((prevHistory) => [...prevHistory, newRecord]);

      setClockStatus("clockedIn");
      setClockTime(new Date().toLocaleTimeString());
      alert("Clocked in successfully!");
    } catch (error) {
      console.error("Error during Clock In:", error);
      alert(`Clock In failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Clock-Out
  const handleClockOut = async () => {
    if (!contract) {
      alert("Contract not initialized.");
      return;
    }

    if (!currentLocation) {
      alert("Location not set. Please fetch your location first.");
      return;
    }

    setShowOvertimeModal(true);
  };

  // Function to confirm Clock-Out
  const confirmClockOut = async () => {
    if (!walletDetails?.address) {
      alert("Wallet details not available.");
      return;
    }

    const hours = parseInt(overtimeHours || "0", 10);
    const minutes = parseInt(overtimeMinutes || "0", 10);
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      alert("Invalid overtime input. Please enter valid hours and minutes.");
      return;
    }

    const overtimeInMinutes = hours * 60 + minutes;
    setShowOvertimeModal(false);
    setLoading(true);

    try {
      const isClocked = await contract.isClockedIn(walletDetails.address);
      if (!isClocked) {
        throw new Error("Not clocked in.");
      }

      const [latitude, longitude] = currentLocation.split(",").map(coord =>
        Math.round(parseFloat(coord) * 1e6)
      );

      const tx = await contract.clockOut(latitude, longitude, overtimeInMinutes);
      await tx.wait();

      const newRecord = {
        action: "Clocked Out",
        location: currentLocation,
        timestamp: formatTimestamp(Date.now()),
        overtime: `${hours}h ${minutes}m`,
      };
      setHistory((prevHistory) => [...prevHistory, newRecord]);

      setClockStatus("clockedOut");
      setClockTime(new Date().toLocaleTimeString());
      alert("Clocked out successfully!");
    } catch (error) {
      console.error("Error during Clock Out:", error);
      alert(`Clock Out failed: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
      setOvertimeHours("0");
      setOvertimeMinutes("0");
    }
  };

  return (
    <div>
      <h2>Clock Functions</h2>

      {/* Clock Status Section */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Clock Status</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor:
                clockStatus === "clockedIn"
                  ? "green"
                  : clockStatus === "clockedOut"
                  ? "red"
                  : "yellow",
            }}
          ></span>
          <p>
            {clockStatus === "clockedIn" && `Clocked In at ${clockTime}`}
            {clockStatus === "clockedOut" && `Clocked Out at ${clockTime}`}
            {clockStatus === "needsClockIn" && "Please clock in."}
          </p>
        </div>
      </div>

      <LocationManager setCurrentLocation={setCurrentLocation} setDistanceToWorkplace={setDistanceToWorkplace} />
      <p>Current Location: {currentLocation || "Not Set"} {distanceToWorkplace && `(${distanceToWorkplace} km)`}</p>
      
      <button className="btn btn-success" onClick={handleClockIn} disabled={loading || !currentLocation}>
        {loading ? "Clocking In..." : "Clock In"}
      </button>
      <button className="btn btn-danger" onClick={handleClockOut} disabled={loading || !currentLocation}>
        {loading ? "Clocking Out..." : "Clock Out"}
      </button>

      <HistoryManager history={history} />

      {showOvertimeModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Did you work overtime?</h3>
            <label>
              Hours:
              <input
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                min="0"
                placeholder="0"
              />
            </label>
            <label>
              Minutes:
              <input
                type="number"
                value={overtimeMinutes}
                onChange={(e) => setOvertimeMinutes(e.target.value)}
                min="0"
                max="59"
                placeholder="0"
              />
            </label>
            <button onClick={confirmClockOut} className="btn btn-primary">
              Confirm Clock Out
            </button>
            <button
              onClick={() => setShowOvertimeModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClockFunctionsManager;
