import {useSyncExternalStore} from "react";
import {createStore} from "./vanilla";

export function create() {
  return createImpl;
}

function createImpl(createState: any) {
  const api =
    typeof createState === "function" ? createStore(createState) : createState;
  const useBoundStore: any = () => useStore(api);

  return useBoundStore;
}

export function useStore(
  api: any // WithReact<StoreApi<TState>>,
  // selector: (state: TState) => StateSlice = api.getState as any,
) {
  const slice = useSyncExternalStore(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState
    // selector,
    // equalityFn
  );
  return slice;
}
