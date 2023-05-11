import useBearStore from "../store/useBearStore";

export default function BearsPage() {
  const bearsStore = useBearStore();
  const {bears, increase, decrease} = bearsStore;
  return (
    <div>
      <h3>BearsPage</h3>

      <button onClick={() => increase()}>increase {bears}</button>
      <button onClick={() => decrease()}>decrease {bears}</button>
    </div>
  );
}
