// @ts-nocheck
"use client";

import { Provider } from "react-redux";
import store from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
import SignInModal from "./components/SignInModal";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
        <SignInModal />
      </AuthProvider>
    </Provider>
  );
}
