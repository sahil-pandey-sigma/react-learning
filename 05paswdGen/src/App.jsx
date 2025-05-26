import { useState, useCallback, useEffect, useRef } from "react";

function App() {
  const [length, setLength] = useState(8);
  const [numberAllowed, setNumberAllowed] = useState(false);
  const [charAllowed, setCharAllowed] = useState(false);
  const [password, setPassword] = useState("");

  // Initializing useRef hook for creating ref to copy to clipboard of the items in the input text
  const passwordRef = useRef(null);
  // useCallback is the hook which is used for memoization, which stores redundant data of function so that it doesn't take extra time to update. You have to provide dependencies also with this hook.

  // We are using useCallback for optimization but we are using useEffect for changing the password with the dependencise.
  const passwordGenerator = useCallback(() => {
    let pass = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (numberAllowed) str += "0123456789";
    if (charAllowed) str += "!@#$%^&*-_+=[]{}~`";

    for (let i = 1; i <= length; i++) {
      let char = Math.floor(Math.random() * str.length);
      pass += str.charAt(char);
    }

    setPassword(pass);
  }, [length, numberAllowed, charAllowed, setPassword]);
  // here if you give setPassword it's good for memoization that hook will remember which function you need to change, also it remembers that you don't need to put password as dependency otherwise you'll be in infinite loop

  const copyPasswordToClipboard = useCallback(() => {
    // current? means if current has element then only select everything--> select() will select everything where as you can provide selection range with setSelectionRange()
    passwordRef.current?.select();
    passwordRef.current?.setSelectionRange(0, 999);
    window.navigator.clipboard.writeText(password); // this is directly how you could do the copy thing but passwordRef gives you freedom to do copy more precisely. Also to show the text selected which gives user feel that text has been copied
  }, [password]);

  // For running function with synchronization
  useEffect(() => {
    passwordGenerator();
  }, [length, numberAllowed, charAllowed, passwordGenerator]);

  return (
    <div className="w-full max-w-md mx-auto my-10 px-6 py-6 bg-gray-800 text-orange-500 shadow-lg rounded-lg">
      <h1 className="text-white text-center text-lg font-semibold mb-4">
        Password generator
      </h1>

      <div className="flex overflow-hidden rounded-lg shadow">
        <input
          type="text"
          value={password}
          readOnly
          // providing ref to passwordRef
          ref={passwordRef}
          placeholder="Password"
          className="w-full px-4 py-2 outline-none text-gray-900 placeholder-gray-400 bg-amber-50"
        />
        <button
          onClick={copyPasswordToClipboard}
          className="bg-blue-700 text-white px-4 py-2 text-sm font-medium shrink-0 hover:bg-blue-600 transition"
        >
          Copy
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm mt-6">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={6}
            max={100}
            value={length}
            className="cursor-pointer"
            onChange={(e) => setLength(Number(e.target.value))}
          />
          <label>Length: {length}</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="numberInput"
            checked={numberAllowed}
            onChange={() => setNumberAllowed((prev) => !prev)}
            // setNumberAllowed((prev) => !prev) we are firing the callback to access the current state and then change accordingly so if it's true then make it false or vice versa
          />
          <label htmlFor="numberInput">Numbers</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="characterInput"
            checked={charAllowed}
            onChange={() => setCharAllowed((prev) => !prev)}
          />
          <label htmlFor="characterInput">Characters</label>
        </div>
      </div>
    </div>
  );
}

export default App;
