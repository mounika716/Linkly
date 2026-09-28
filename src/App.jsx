import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import ShortLink from "./pages/ShortLink";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/s/:code"
            element={<ShortLink />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;