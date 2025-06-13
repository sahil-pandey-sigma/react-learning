import React from "react";
import UserContext from "./UserContext";
function UserContextProvider({ children }) {
  const [user, setUser] = React.useState(null);
  return (
    // By prop value we are passing object is which you can give the access to whatever you want
    <UserContext.Provider value={{ user, setUser }}>
      {/* Provider is property which will provide */}
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
