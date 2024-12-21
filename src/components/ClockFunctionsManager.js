import React, { useState } from "react";
import { executeClockIn, executeClockOut, fetchClockRecords } from "../utils/clockFunctions";


const WORKPLACE_LAT = -33.931672;
const WORKPLACE_LON = 151.165399;
const MAX_DISTANCE_KM = 20; // Maximum allowed distance

const ClockFunctionsManager = ({ contract }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [distanceToWorkplace, setDistanceToWorkplace] = useState(null);

  // Calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Fetch current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, WORKPLACE_LAT, WORKPLACE_LON);

        if (distance <= MAX_DISTANCE_KM) {
          setCurrentLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setDistanceToWorkplace(distance.toFixed(2));
          alert(`Location fetched: You are ${distance.toFixed(2)} km from the workplace.`);
        } else {
          setDistanceToWorkplace(distance.toFixed(2));
          alert(`You are ${distance.toFixed(2)} km away from the workplace. Clock-in/out is not allowed.`);
        }
      },
      (error) => {
        console.error("Error fetching location:", error);
        alert("Failed to fetch location.");
      }
    );
  };

  // Clock in
  const handleClockIn = async () => {
    if (!contract) {
      alert("Contract not initialized. Load wallet first.");
      return;
    }
    if (!currentLocation) {
      alert("Location not set. Fetch your location first.");
      return;
    }

    setLoading(true);
    try {
      await executeClockIn(contract, currentLocation); // Call ABI-defined function
      alert("Clocked in successfully!");
    } catch (error) {
      console.error("Error during Clock In:", error);
      alert(`Failed to clock in. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clock out
  const handleClockOut = async () => {
    if (!contract) {
      alert("Contract not initialized. Load wallet first.");
      return;
    }
    if (!currentLocation) {
      alert("Location not set. Fetch your location first.");
      return;
    }

    setLoading(true);
    try {
      await executeClockOut(contract, currentLocation); // Call ABI-defined function
      alert("Clocked out successfully!");
    } catch (error) {
      console.error("Error during Clock Out:", error);
      alert(`Failed to clock out. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clock history
  const handleGetHistory = async () => {
    if (!contract) {
      alert("Contract not initialized. Load wallet first.");
      return;
    }

    setLoading(true);
    try {
      const records = await fetchClockRecords(contract); // Call ABI-defined function
      setHistory(records);
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Failed to fetch clock-in/out history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Clock Functions</h2>
      <button onClick={handleGetLocation} disabled={loading}>
        {loading ? "Fetching Location..." : "Get Location"}
      </button>
      <p>
        Current Location: {currentLocation || "Not Set"}{" "}
        {distanceToWorkplace && `(${distanceToWorkplace} km from workplace)`}
      </p>
      <button onClick={handleClockIn} disabled={loading || !currentLocation}>
        {loading ? "Clocking In..." : "Clock In"}
      </button>
      <button onClick={handleClockOut} disabled={loading || !currentLocation}>
        {loading ? "Clocking Out..." : "Clock Out"}
      </button>
      <button onClick={handleGetHistory} disabled={loading}>
        {loading ? "Fetching History..." : "Get History"}
      </button>
      {history.length > 0 && (
        <div>
          <h3>Clock History</h3>
          <ul>
            {history.map((record, index) => (
              <li key={index}>
                <strong>Timestamp:</strong> {new Date(record.timestamp * 1000).toLocaleString()} -{" "}
                <strong>Location:</strong> {record.location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClockFunctionsManager;
