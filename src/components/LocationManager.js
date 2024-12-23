import React from "react";
import { calculateDistance } from "../utils/locationUtils";

const WORKPLACE_LAT = -33.931672;
const WORKPLACE_LON = 151.165399;
const MAX_DISTANCE_KM = 1;

const LocationManager = ({ setCurrentLocation, setDistanceToWorkplace }) => {
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

  return (
    <button className="btn btn-info" onClick={handleGetLocation}>
      Get Location
    </button>
  );
};

export default LocationManager;
