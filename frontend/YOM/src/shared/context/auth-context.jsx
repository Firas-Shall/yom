import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  friends: [],
  setFriends: () => {},
  sentRequests: [],
  setSentRequests: () => {},
  receivedRequests: [],
  setReceivedRequests: () => {},
  login: () => {},
  logout: () => {},
});
