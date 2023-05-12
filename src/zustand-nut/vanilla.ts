// js 状态管理库

export interface StoreApi<T> {
  getState: () => T;
  setState: (
    partial: T | Partial<T> | {_(state: T): T | Partial<T>}["_"],
    replace?: boolean | undefined
  ) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}

export type StateCreator<T> = (
  setState: StoreApi<T>["setState"],
  getState: StoreApi<T>["getState"]
) => T;

export const createStore = (createState: any) => {
  type TState = ReturnType<typeof createState>;
  type Listener = (state: TState, prevState: TState) => void;

  let state: TState;
  let listeners: Set<Listener> = new Set();

  const getState: StoreApi<TState>["getState"] = () => state;
  // 修改状态值的函数
  const setState: StoreApi<TState>["setState"] = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;

    if (!Object.is(nextState, state)) {
      const prevState = state;
      state =
        replace ?? typeof nextState !== "object"
          ? nextState
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, prevState));
    }
  };

  const subscribe: StoreApi<TState>["subscribe"] = (listener: Listener) => {
    listeners.add(listener);
    // 取消订阅
    return () => listeners.delete(listener);
  };
  const destroy: StoreApi<TState>["destroy"] = () => {
    listeners.clear();
  };

  state = createState(setState, getState);

  const api = {
    getState,
    setState,
    subscribe,
    destroy,
  };

  return api;
};
