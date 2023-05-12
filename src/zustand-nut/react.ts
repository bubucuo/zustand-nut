// react 状态管理库

import {useSyncExternalStore} from "react";
import {StateCreator, StoreApi, createStore} from "./vanilla";

export function create<T>(createState: StateCreator<T>) {
  return createImpl(createState);
}

export function createImpl<T>(createState: StateCreator<T>) {
  const api = createStore(createState);

  const useBoundStore: any = () => useStore(api);

  return useBoundStore;
}

export function useStore<TState>(api: StoreApi<TState>) {
  const slice = useSyncExternalStore(api.subscribe, api.getState);
  return slice;
}
