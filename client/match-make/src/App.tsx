import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { createTheme, MantineProvider, Notification } from "@mantine/core";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthenticationTitle } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { HeaderSimple } from "./components/Header";
import CreateProfile from "./pages/CreateProfile";
import Dashboard from "./pages/Dashboard";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import CreateNewRequest from "./pages/CreateNewRequest";
import AllTeams from "./pages/AllTeams";
import { MatchRequestsProvider } from "./contexts/MatchRequestsContext";
import AllMatchRequests from "./pages/AllMatchRequests";
import { TeamProvider } from "./contexts/TeamContext";

function App() {
  const theme = createTheme({
    fontFamily: "Plus Jakarta Sans, sans-serif",
    components: {
      Button: {
        defaultProps: {
          color: "green",
        },
      },
      Input: {
        defaultProps: {
          color: "green",
        },
      },
    },
  });

  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <AuthProvider>
        <TeamProvider>
          <MatchRequestsProvider>
            <BrowserRouter>
              <ToastContainer autoClose={1000} />
              <HeaderSimple />
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoutes>
                      <Dashboard />
                    </ProtectedRoutes>
                  }
                />
                <Route path="/auth/login" element={<AuthenticationTitle />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/teams" element={<AllTeams />} />

                <Route
                  path="/create-request"
                  element={
                    <ProtectedRoutes>
                      <CreateNewRequest />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/create-team-profile"
                  element={
                    <ProtectedRoutes>
                      <CreateProfile />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoutes>
                      <Dashboard />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/match-requests"
                  element={
                    <ProtectedRoutes>
                      <AllMatchRequests />
                    </ProtectedRoutes>
                  }
                />
              </Routes>
            </BrowserRouter>
          </MatchRequestsProvider>
        </TeamProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
