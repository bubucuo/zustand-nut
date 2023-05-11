// import {create} from "zustand";
import {create} from "../zustand-nut";

interface BearState {
  bears: number; // 状态值
  increase: (by?: number) => void;
  decrease: (by?: number) => void;
  reset: () => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: (by = 1) => set((state) => ({bears: state.bears + by})),
  decrease: (by = 1) => set((state) => ({bears: state.bears - by})),
  reset: () => set({bears: 0}),
}));

export default useBearStore;
