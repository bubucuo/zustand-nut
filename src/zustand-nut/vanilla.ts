export interface StoreApi<T> {
  setState: (
    partial: T | Partial<T> | {_(state: T): T | Partial<T>}["_"],
    replace?: boolean | undefined
  ) => void;

  getState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}

export type StateCreator<T> = (
  setState: StoreApi<T>["setState"],
  getState: StoreApi<T>["getState"]
) => T;

export const createStore = (createState: any) => createStoreImpl(createState);

const createStoreImpl = (createState: any) => {
  type TState = ReturnType<typeof createState>;
  let state: TState;
  type Listener = (state: TState, prevState: TState) => void;

  const listeners: Set<Listener> = new Set();

  const setState: StoreApi<TState>["setState"] = (partial, replace) => {
    const nextState =
      typeof partial === "function"
        ? (partial as (state: TState) => TState)(state)
        : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      // 如果replace为true，或者nextState不是对象，则不是合并，而是直接替换旧state
      state =
        replace ?? typeof nextState !== "object"
          ? (nextState as TState)
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState: StoreApi<TState>["getState"] = () => state;

  const subscribe: StoreApi<TState>["subscribe"] = (listener) => {
    listeners.add(listener);
    // Unsubscribe
    return () => listeners.delete(listener);
  };

  const destroy: StoreApi<TState>["destroy"] = () => {
    listeners.clear();
  };

  const api = {setState, getState, subscribe, destroy};
  state = createState(setState, getState, api);
  return api as any;
};
