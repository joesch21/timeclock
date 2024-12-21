import React, { useState } from "react";

const GeolocationManager = ({ setLocation }) => {
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = `${latitude}, ${longitude}`;
        setLocation(location); // Set the fetched location
        alert(`Location fetched: ${location}`);
      },
      (error) => {
        console.error("Error fetching location:", error);
        alert("Failed to fetch location. Please try again.");
      }
    );
  };

  return (
    <div>
      
    </div>
  );
};

export default GeolocationManager;
