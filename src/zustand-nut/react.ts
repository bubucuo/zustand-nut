// react 状态管理库

import {useSyncExternalStore} from "react";
import type {StateCreator, StoreApi} from "./vanilla";
import {createStore} from "./vanilla";

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

export const create = function <T>(createState: StateCreator<T> | undefined) {
  return createState ? createImpl(createState) : createImpl;
} as Create;

function createImpl<T>(createState: StateCreator<T>) {
  const api =
    typeof createState === "function" ? createStore(createState) : createState;

  const useBoundStore = (selector?: any) => useStore(api, selector);

  return useBoundStore;
}

export function useStore<TState, StateSlice>(
  api: StoreApi<TState>,
  selector: (state: TState) => StateSlice = api.getState as any
) {
  const slice = useSyncExternalStore(api.subscribe, api.getState);
  return selector(slice);
}
