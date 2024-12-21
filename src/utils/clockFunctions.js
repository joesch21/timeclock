import { ethers } from "ethers"; // Ensure ethers is imported

// Execute ClockIn function
export const executeClockIn = async (contract, location) => {
  try {
    if (!contract.clockIn) throw new Error("clockIn function not found in contract.");
    const tx = await contract.clockIn(location);
    await tx.wait();
  } catch (error) {
    console.error("Error during clockIn:", error);
    throw new Error("ClockIn failed.");
  }
};

// Execute ClockOut function
export const executeClockOut = async (contract, location) => {
  try {
    if (!contract.clockOut) throw new Error("clockOut function not found in contract.");
    const tx = await contract.clockOut(location);
    await tx.wait();
  } catch (error) {
    console.error("Error during clockOut:", error);
    throw new Error("ClockOut failed.");
  }
};

// Fetch Clock Records
export const fetchClockRecords = async (contract) => {
  try {
    const walletAddress = await contract.signer.getAddress(); // Fetch wallet address
    const records = await contract.getClockRecords(walletAddress); // Pass address to the function
    return records.map((record) => ({
      timestamp: parseInt(record.timestamp), // Convert timestamp to integer
      location: record.location,
    }));
  } catch (error) {
    console.error("Error fetching clock records:", error);
    throw new Error("Failed to fetch clock records.");
  }
};

// Setup Contract
export const setupContract = (contractAddress, abi, wallet) => {
  try {
    return new ethers.Contract(contractAddress, abi, wallet); // Use ethers here
  } catch (error) {
    console.error("Error setting up contract:", error);
    throw new Error("Failed to set up contract.");
  }
};
