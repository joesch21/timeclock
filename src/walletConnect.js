import Onboard from "@web3-onboard/core";
import injectedWalletsModule from "@web3-onboard/injected-wallets";

const injectedWallets = injectedWalletsModule();

const onboard = Onboard({
  wallets: [injectedWallets],
  chains: [
    {
      id: "0x61", // Binance Smart Chain Testnet Chain ID
      token: "BNB",
      label: "Binance Smart Chain Testnet",
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    },
  ],
  appMetadata: {
    name: "Employee Clock App",
    description: "A dApp for tracking employee time",
  },
});

export default onboard;
