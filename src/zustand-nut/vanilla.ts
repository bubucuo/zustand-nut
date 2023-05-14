// js 状态管理库

type SetStateInternal<T> = {
  _(
    partial: T | Partial<T> | {_(state: T): T | Partial<T>}["_"],
    replace?: boolean | undefined
  ): void;
}["_"];

export interface StoreApi<T> {
  getState: () => T;
  // setState: (
  //   partial: T | Partial<T> | {_(state: T): T | Partial<T>}["_"],
  //   replace?: boolean | undefined
  // ) => void;
  setState: SetStateInternal<T>;

  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}

type Get<T, K, F> = K extends keyof T ? T[K] : F;

export type Mutate<S, Ms> = number extends Ms["length" & keyof Ms]
  ? S
  : Ms extends []
  ? S
  : Ms extends [[infer Mi, infer Ma], ...infer Mrs]
  ? Mutate<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier], Mrs>
  : never;

export interface StoreMutators<S, A> {}
export type StoreMutatorIdentifier = keyof StoreMutators<unknown, unknown>;

// export type StateCreator<T> = (
//   setState: StoreApi<T>["setState"],
//   getState: StoreApi<T>["getState"]
// ) => T;

export type StateCreator<
  T,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  U = T
> = ((
  setState: Get<Mutate<StoreApi<T>, Mis>, "setState", never>,
  getState: Get<Mutate<StoreApi<T>, Mis>, "getState", never>,
  store: Mutate<StoreApi<T>, Mis>
) => U) & {$$storeMutators?: Mos};

type CreateStore = <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
  initializer: StateCreator<T, [], Mos>
) => Mutate<StoreApi<T>, Mos>;

export const createStore: CreateStore = (createState) => {
  type TState = ReturnType<typeof createState>;
  type Listener = (state: TState, prevState: TState) => void;

  let state: TState;
  const listeners: Set<Listener> = new Set();

  const setState: StoreApi<TState>["setState"] = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;

    if (!Object.is(nextState, state)) {
      const previousState = state;
      state =
        replace ?? typeof nextState !== "object"
          ? nextState
          : Object.assign({}, state, nextState);

      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState: StoreApi<TState>["getState"] = () => state;
  const subscribe: StoreApi<TState>["subscribe"] = (listener: Listener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };
  const destroy: StoreApi<TState>["destroy"] = () => {
    listeners.clear();
  };

  const api = {
    getState,
    setState,
    destroy,
    subscribe,
  };

  state = createState(setState, getState, api);

  return api as any;
};
