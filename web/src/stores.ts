import { writable } from "svelte/store";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  balance: "0",
};

export const walletStore = writable<WalletState>(initialState);
