import { ethers } from "ethers";
import CryptoJS from "crypto-js";

const STORAGE_KEY = "encryptedWalletPrivateKey";

// Encrypt the private key
const encryptKey = (privateKey, password) => {
  // AES encryption using the provided password
  return CryptoJS.AES.encrypt(privateKey, password).toString();
};

// Decrypt the private key
const decryptKey = (encryptedKey, password) => {
  try {
    // AES decryption using the provided password
    const bytes = CryptoJS.AES.decrypt(encryptedKey, password);
    return bytes.toString(CryptoJS.enc.Utf8); // Convert to string
  } catch (error) {
    throw new Error("Decryption failed. Invalid password or corrupted data.");
  }
};

// Create a new wallet and save the encrypted private key locally
export const createWallet = (password) => {
  const wallet = ethers.Wallet.createRandom(); // Generate a new wallet
  const encryptedKey = encryptKey(wallet.privateKey, password); // Encrypt private key
  localStorage.setItem(STORAGE_KEY, encryptedKey); // Store encrypted key in localStorage
  return wallet; // Return wallet object
};

// Load wallet from local storage with decryption
export const loadWallet = (password) => {
  const encryptedKey = localStorage.getItem(STORAGE_KEY); // Retrieve encrypted key
  if (encryptedKey) {
    const privateKey = decryptKey(encryptedKey, password); // Decrypt using password
    return new ethers.Wallet(privateKey); // Create and return wallet object
  }
  return null; // Return null if no wallet exists
};

// Load wallet with provider
export const loadWalletWithProvider = (rpcUrl, password) => {
  const encryptedKey = localStorage.getItem(STORAGE_KEY); // Retrieve encrypted key
  if (encryptedKey) {
    const privateKey = decryptKey(encryptedKey, password); // Decrypt private key
    const provider = new ethers.JsonRpcProvider(rpcUrl); // Connect to blockchain provider
    return new ethers.Wallet(privateKey, provider); // Return wallet with provider
  }
  return null; // Return null if no wallet exists
};

// Fetch wallet balance using provider
export const getWalletBalance = async (rpcUrl, password) => {
  const wallet = loadWalletWithProvider(rpcUrl, password); // Load wallet with provider
  if (wallet) {
    const balance = await wallet.provider.getBalance(wallet.address); // Fetch balance
    return ethers.formatEther(balance); // Convert to Ether format
  }
  return "0"; // Return 0 if wallet doesn't exist
};

// Reset wallet (clear local storage)
export const resetWallet = () => {
  localStorage.removeItem(STORAGE_KEY); // Clear the stored encrypted key
};
