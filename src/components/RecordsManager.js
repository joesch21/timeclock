import React from "react";
import { executeClockIn, executeClockOut, fetchClockRecords, setupContract } from "../utils/clockFunctions";


const RecordsManager = ({ contract, location, loading, setLoading }) => {
  const handleClock = async (method) => {
    setLoading(true);
    try {
      if (method === "clockIn") {
        await executeClockIn(contract, location);
        alert("Clocked in successfully!");
      } else if (method === "clockOut") {
        await executeClockOut(contract, location);
        alert("Clocked out successfully!");
      }
    } catch (error) {
      alert(`Failed to ${method}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRecords = async () => {
    setLoading(true);
    try {
      const records = await fetchClockRecords(contract);
      alert(JSON.stringify(records));
    } catch (error) {
      alert("Failed to fetch records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn btn-success" onClick={() => handleClock("clockIn")} disabled={loading}>Clock In</button>
      <button className="btn btn-danger" onClick={() => handleClock("clockOut")} disabled={loading}>Clock Out</button>
      <button className="btn btn-info" onClick={handleFetchRecords} disabled={loading}>Fetch Records</button>
    </div>
  );
};

export default RecordsManager;
