export const createStore = ((createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl) as CreateStore;

type SetStateInternal<T> = {
  _(
    partial: T | Partial<T> | {_(state: T): T | Partial<T>}["_"],
    replace?: boolean | undefined
  ): void;
}["_"];

export interface StoreApi<T> {
  setState: SetStateInternal<T>;
  getState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}

const createStoreImpl = (createState) => {
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
