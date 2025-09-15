// components/PrivateRoute.tsx
import { useContext, type JSX } from "react";
import { AuthContext } from "react-oauth2-code-pkce";


export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useContext(AuthContext);

  if (!token) return null; // 🔁 Redirect handled by autoLogin

  return children;
};
