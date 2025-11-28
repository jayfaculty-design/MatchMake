import { useContext, type PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoutes = ({ children }: PropsWithChildren) => {
  const isAuthenticated = localStorage.getItem("token");
  const { team } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <div>{children}</div>;
};

export default ProtectedRoutes;
