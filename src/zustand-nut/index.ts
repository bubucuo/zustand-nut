// import {useSyncExternalStore} from "react";
import type {StateCreator, StoreApi} from "./vanilla";
import {createStore} from "./vanilla";
import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector";

const {useSyncExternalStoreWithSelector} = useSyncExternalStoreExports;

type ExtractState<S> = S extends {getState: () => infer T} ? T : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "subscribe">;

type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>;
};

export function create<T>(createState: StateCreator<T> | undefined) {
  return createState ? createImpl(createState) : createImpl;
}

function createImpl<T>(createState: StateCreator<T>) {
  const api = createStore(createState);

  const useBoundStore: any = (selector?: any) => useStore(api, selector);

  return useBoundStore;
}

export function useStore<TState, StateSlice>(
  api: WithReact<StoreApi<TState>>,
  selector: (state: TState) => StateSlice = api.getState as any
) {
  // const slice = useSyncExternalStore(api.subscribe, api.getState);

  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState,
    selector
  );

  return slice;
}
