import React, { useState, useContext } from "react";
import UserContext from "../context/UserContext";
// useContext hook is responsible for fetching the data or component in UserContext

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //   setUser was the method for setting user in UserContext so by using setUser we will be update or adding the values in context and by using "user" we'll be retrieving the data
  const { setUser } = useContext(UserContext);
  const handleSubmit = (e) => {
    // preventing default as on submit the data is sent to some url which we don't want in this situation
    e.preventDefault();
    // Sending data in form of object having username and password
    setUser({ username, password });
  };
  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="text"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Login;
