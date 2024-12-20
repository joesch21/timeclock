import { ethers } from "ethers";
import CryptoJS from "crypto-js";

const STORAGE_KEY = "encryptedWalletPrivateKey";

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

// Create a new wallet and save the encrypted private key locally
export const createWallet = (password) => {
  const wallet = ethers.Wallet.createRandom();
  const encryptedKey = encryptKey(wallet.privateKey, password);
  localStorage.setItem(STORAGE_KEY, encryptedKey);
  return wallet;
};

// Load wallet from local storage with decryption
export const loadWallet = (password) => {
  const encryptedKey = localStorage.getItem(STORAGE_KEY);
  if (encryptedKey) {
    const privateKey = decryptKey(encryptedKey, password);
    return new ethers.Wallet(privateKey);
  }
  return null;
};

// Load wallet with provider
export const loadWalletWithProvider = (rpcUrl, password) => {
  const encryptedKey = localStorage.getItem(STORAGE_KEY);
  if (encryptedKey) {
    const privateKey = decryptKey(encryptedKey, password);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  }
  return null;
};

// Fetch wallet balance using provider
export const getWalletBalance = async (rpcUrl, password) => {
  const wallet = loadWalletWithProvider(rpcUrl, password);
  if (wallet) {
    const balance = await wallet.provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  }
  return "0";
};

// Reset wallet (clear local storage)
export const resetWallet = () => {
  localStorage.removeItem(STORAGE_KEY);
};
