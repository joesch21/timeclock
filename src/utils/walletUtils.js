import { ethers } from "ethers";
import CryptoJS from "crypto-js";

const STORAGE_KEY = "encryptedWallets"; // Key to store an array of encrypted private keys
const ADDRESS_KEY = "walletAddresses"; // Key to store an array of wallet addresses

const DEFAULT_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/"; // Default RPC URL

// Encrypt the private key
export const encryptKey = (privateKey, password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match. Please try again.");
  }
  return CryptoJS.AES.encrypt(privateKey, password).toString();
};

// Decrypt the private key
export const decryptKey = (encryptedKey, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, password);
    const decryptedKey = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedKey) throw new Error("Invalid password or corrupted data.");
    return decryptedKey;
  } catch (error) {
    throw new Error("Decryption failed. Invalid password or corrupted data.");
  }
};

// Create a new wallet with password confirmation and attach a provider
export const createWallet = (password, confirmPassword, rpcUrl = DEFAULT_RPC_URL) => {
  if (!rpcUrl) throw new Error("RPC URL is required to create a wallet.");
  
  const wallet = ethers.Wallet.createRandom();
  const encryptedKey = encryptKey(wallet.privateKey, password, confirmPassword);

  console.log("Encrypted Private Key (saving to localStorage):", encryptedKey);
  console.log("Wallet Address (saving to localStorage):", wallet.address);

  // Save encrypted key and address to arrays in localStorage
  const encryptedKeys = loadEncryptedKeysFromLocalStorage();
  const walletAddresses = loadWalletsFromLocalStorage();

  encryptedKeys.push(encryptedKey);
  walletAddresses.push(wallet.address);

  saveEncryptedKeysToLocalStorage(encryptedKeys);
  saveWalletsToLocalStorage(walletAddresses);

  // Attach a provider to the wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return wallet.connect(provider);
};

// Load wallet from localStorage using password and attach a provider
export const loadWallet = (password, rpcUrl = DEFAULT_RPC_URL) => {
  const encryptedKeys = loadEncryptedKeysFromLocalStorage();
  if (!encryptedKeys || encryptedKeys.length === 0) {
    throw new Error("No wallets found in localStorage.");
  }

  // Assuming the first encrypted key is used for simplicity
  const encryptedKey = encryptedKeys[0];
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

// Save wallet addresses to localStorage
export const saveWalletsToLocalStorage = (walletAddresses) => {
  if (!Array.isArray(walletAddresses)) {
    throw new Error("Wallet addresses must be an array.");
  }
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(walletAddresses));
};

// Load wallet addresses from localStorage
export const loadWalletsFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem(ADDRESS_KEY)) || [];
};

// Save encrypted private keys to localStorage
export const saveEncryptedKeysToLocalStorage = (encryptedKeys) => {
  if (!Array.isArray(encryptedKeys)) {
    throw new Error("Encrypted keys must be an array.");
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedKeys));
};

// Load encrypted private keys from localStorage
export const loadEncryptedKeysFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};
