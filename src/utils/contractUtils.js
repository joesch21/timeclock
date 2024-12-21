import { ethers } from "ethers";

export const initContract = (contractAddress, abi, wallet) => {
  try {
    return new ethers.Contract(contractAddress, abi, wallet); // Initialize contract
  } catch (error) {
    console.error("Error initializing contract:", error);
    throw new Error("Failed to initialize contract.");
  }
};
