import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [isEditUser, setIsEditUser] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [layoutMode, setLayoutMode] = useState('standard');

  return (
    <UserContext.Provider value={{ isEditUser, setIsEditUser, showChatbot, setShowChatbot, showDashboard, setShowDashboard, layoutMode, setLayoutMode }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
