// react 状态管理库

import {useSyncExternalStore} from "react";
import {StateCreator, StoreApi, createStore} from "./vanilla";

type ExtractState<S> = S extends {getState: () => infer T} ? T : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "subscribe">;

type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>;
};

export type UseBoundStore<S extends WithReact<ReadonlyStoreApi<unknown>>> = {
  (): ExtractState<S>;
  <U>(
    selector: (state: ExtractState<S>) => U,
    equals?: (a: U, b: U) => boolean
  ): U;
} & S;

type Create = {
  <T>(createState: StateCreator<T>): UseBoundStore<StoreApi<T>>;
  <T>(): (createState: StateCreator<T>) => UseBoundStore<StoreApi<T>>;
};

export const create = function <T>(createState: StateCreator<T>) {
  return createState ? createImpl(createState) : createImpl;
} as Create;

function createImpl(createState: StateCreator<T>) {
  const api =
    typeof createState === "function" ? createStore(createState) : createState;

  const useBoundStore = (selector?: any) => useStore(api, selector);

  return useBoundStore;
}

function useStore<TState, StateSlice>(
  api: WithReact<StoreApi<TState>>,
  selector: (state: TState) => StateSlice = api.getState as any
) {
  const slice = useSyncExternalStore(
    api.subscribe,
    api.getState,
    api.getServerState
  );
  return selector(slice);
}
