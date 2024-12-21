import React, { useState } from "react";
import { ethers } from "ethers";

const ClockFunctionsManager = ({ contract }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [distanceToWorkplace, setDistanceToWorkplace] = useState(null);

  const WORKPLACE_LAT = -33.931672;
  const WORKPLACE_LON = 151.165399;
  const MAX_DISTANCE_KM = 20;

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
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
          const location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setCurrentLocation(location);
          setDistanceToWorkplace(distance.toFixed(2));
          alert(`Location fetched: ${location}. You are within ${distance.toFixed(2)} km of the workplace.`);
        } else {
          setDistanceToWorkplace(distance.toFixed(2));
          alert(`You are ${distance.toFixed(2)} km away from the workplace. Clock-in/out is not allowed.`);
        }
      },
      (error) => {
        console.error("Error fetching location:", error);
        alert("Failed to fetch location. Please try again.");
      }
    );
  };

  // Clock In Function
  const handleClockIn = async () => {
    if (!contract) {
      alert("Contract not initialized. Load wallet first.");
      return;
    }
    if (!currentLocation) {
      alert("Location not set. Please fetch your location first.");
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.clockIn(currentLocation);
      await tx.wait();
      alert("Clocked in successfully!");
    } catch (error) {
      console.error("Error during Clock In:", error);
      alert("Failed to clock in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clock Out Function
  const handleClockOut = async () => {
    if (!contract) {
      alert("Contract not initialized. Load wallet first.");
      return;
    }
    if (!currentLocation) {
      alert("Location not set. Please fetch your location first.");
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.clockOut(currentLocation);
      await tx.wait();
      alert("Clocked out successfully!");
    } catch (error) {
      console.error("Error during Clock Out:", error);
      alert("Failed to clock out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Clock-In/Out History
  const handleGetHistory = async () => {
    if (!contract) {
      alert("Contract not initialized. Load wallet first.");
      return;
    }

    setLoading(true);
    try {
      const records = await contract.getClockRecords();
      setHistory(
        records.map((record) => ({
          timestamp: new Date(record.timestamp * 1000).toLocaleString("en-AU", {
            timeZone: "Australia/Sydney",
          }),
          location: record.location,
        }))
      );
      alert("History fetched successfully!");
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Failed to fetch clock-in/out history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Clock Functions</h2>
      <button className="btn btn-info" onClick={handleGetLocation} disabled={loading}>
        {loading ? "Fetching Location..." : "Get Location"}
      </button>
      <p>
        Current Location: {currentLocation || "Not Set"}{" "}
        {distanceToWorkplace && `(${distanceToWorkplace} km from workplace)`}
      </p>
      <button className="btn btn-success" onClick={handleClockIn} disabled={loading || !currentLocation}>
        {loading ? "Clocking In..." : "Clock In"}
      </button>
      <button className="btn btn-danger" onClick={handleClockOut} disabled={loading || !currentLocation}>
        {loading ? "Clocking Out..." : "Clock Out"}
      </button>
      <button className="btn btn-info" onClick={handleGetHistory} disabled={loading}>
        {loading ? "Fetching History..." : "Get History"}
      </button>
      {history.length > 0 && (
        <div>
          <h3>Clock History</h3>
          <ul>
            {history.map((record, index) => (
              <li key={index}>
                <strong>Timestamp:</strong> {record.timestamp} - <strong>Location:</strong> {record.location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClockFunctionsManager;
