import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [isEditUser, setIsEditUser] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);

  return (
    <UserContext.Provider value={{ isEditUser, setIsEditUser, showChatbot, setShowChatbot, showDashboard, setShowDashboard }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
