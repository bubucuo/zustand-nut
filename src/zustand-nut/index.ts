import {useSyncExternalStore} from "react";
import {StateCreator, StoreApi, createStore} from "./vanilla";

type ExtractState<S> = S extends {getState: () => infer T} ? T : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "subscribe">;

type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>;
};

export function create<T>(createState: StateCreator<T>) {
  return createImpl(createState);
}

function createImpl<T>(createState: StateCreator<T>) {
  const api = createStore(createState);

  const useBoundStore: any = () => useStore(api);

  return useBoundStore;
}

export function useStore<TState>(api: WithReact<StoreApi<TState>>) {
  const slice = useSyncExternalStore(api.subscribe, api.getState);

  return slice;
}
