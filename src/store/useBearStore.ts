// import {create} from "zustand";
import {create} from "../zustand-nut";

interface BearState {
  bears: number;
  increase: (by?: number) => void;
  decrease: (by?: number) => void;
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by = 1) => set((state) => ({bears: state.bears + by})),
  decrease: (by = 1) => set((state) => ({bears: state.bears - by})),
}));

export default useBearStore;
