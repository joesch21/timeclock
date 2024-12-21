import { ethers } from "ethers";
import CryptoJS from "crypto-js";

const STORAGE_KEY = "encryptedWalletPrivateKey";
const ADDRESS_KEY = "walletAddress";

// Encrypt the private key
const encryptKey = (privateKey, password) => {
  return CryptoJS.AES.encrypt(privateKey, password).toString();
};

// Decrypt the private key
const decryptKey = (encryptedKey, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error("Decryption failed. Invalid password or corrupted data.");
  }
};

// Create a new wallet and attach a provider
export const createWallet = (password, rpcUrl) => {
  if (!rpcUrl) throw new Error("RPC URL is required to create a wallet.");
  
  const wallet = ethers.Wallet.createRandom();
  const encryptedKey = encryptKey(wallet.privateKey, password);

  console.log("Encrypted Private Key (saving to localStorage):", encryptedKey);
  console.log("Wallet Address (saving to localStorage):", wallet.address);

  localStorage.setItem(STORAGE_KEY, encryptedKey);
  localStorage.setItem(ADDRESS_KEY, wallet.address);

  // Attach a provider to the wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return wallet.connect(provider);
};

// Load wallet from localStorage and attach a provider
export const loadWallet = (password, rpcUrl) => {
  const encryptedKey = localStorage.getItem(STORAGE_KEY);
  if (!encryptedKey) throw new Error("No wallet found in localStorage.");

  const privateKey = decryptKey(encryptedKey, password);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  console.log("Decrypted Private Key:", privateKey);
  return new ethers.Wallet(privateKey, provider);
};

// Fetch wallet balance using provider
export const getWalletBalance = async (wallet) => {
  if (!wallet || !wallet.provider) {
    throw new Error("Wallet or provider is not available.");
  }

  try {
    const balance = await wallet.provider.getBalance(wallet.address);
    console.log("Wallet Balance:", ethers.formatEther(balance));
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw new Error("Failed to fetch wallet balance.");
  }
};

// Save wallet address to localStorage
export const saveWalletToLocalStorage = (address) => {
  if (!address || address.length !== 42) {
    throw new Error("Invalid wallet address.");
  }
  localStorage.setItem(ADDRESS_KEY, address);
};

// Load wallet address from localStorage
export const loadWalletAddressFromLocalStorage = () => {
  return localStorage.getItem(ADDRESS_KEY) || null;
};
