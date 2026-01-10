import { create } from 'zustand';
import type { Account, Transaction } from '../types';

interface AccountStore {
    account: Account | null;
    transactions: Transaction[];
    setAccount: (account: Account) => void;
    setTransactions: (transactions: Transaction[]) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
    account: null,
    transactions: [],
    setAccount: (account) => set({ account }),
    setTransactions: (transactions) => set({ transactions }),
}));
