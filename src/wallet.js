import { ethers } from "ethers";

const STORAGE_KEY = "walletPrivateKey";

// Create a new wallet and save the private key locally
export const createWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  localStorage.setItem(STORAGE_KEY, wallet.privateKey);
  return wallet;
};

// Load wallet from local storage
export const loadWallet = () => {
  const privateKey = localStorage.getItem(STORAGE_KEY);
  if (privateKey) {
    return new ethers.Wallet(privateKey);
  }
  return null;
};

// Load wallet with provider
export const loadWalletWithProvider = (rpcUrl) => {
  const privateKey = localStorage.getItem(STORAGE_KEY);
  if (privateKey) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  }
  return null;
};

// Fetch wallet balance using provider
export const getWalletBalance = async (rpcUrl) => {
  const wallet = loadWalletWithProvider(rpcUrl);
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
