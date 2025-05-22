import { useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";

function App() {
  let [count, setCount] = useState(0);
  // Here the count is variable and setCount is function responsible to update the value of count, here useState is Hook which is responsible to track the change of state.
  // Hooks in react are responsible for updation of values in ui
  function addValue() {
    if (count < 20) {
      setCount(count + 1);
      setCount((count) => count + 1); // this is the callback which is returning the prev state
      // setCount((counterr) => counterr + 1);// this is also same as above
    }
  }
  function subValue() {
    if (count > 0) setCount(count - 1);
  }
  return (
    <>
      <h1>Counter Project</h1>
      <h2>Count : {count}</h2>
      {/* <button onClick={setCount(count + 1)}>+</button>
      <button onClick={setCount(count - 1)}>-</button>
      this is throwing error as the setCount is updating the value as soon the button is renders which, is not even defined on that moment
      */}
      <button className="btn-count" onClick={addValue}>
        +
      </button>
      <button
        className="btn-count"
        onClick={() => {
          setCount(0);
        }}
      >
        Reset
      </button>
      <button className="btn-count" onClick={subValue}>
        -
      </button>
    </>
  );
}

export default App;
