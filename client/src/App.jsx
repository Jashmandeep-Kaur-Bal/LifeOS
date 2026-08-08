import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Health from "./pages/Health";
import Finance from "./pages/Finance";
import Study from "./pages/Study";
import Calendar from "./pages/Calendar";
import Email from "./pages/Email";
import Travel from "./pages/Travel";
import Shopping from "./pages/Shopping";
import AgentTasks from "./pages/AgentTasks";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireOnboarded={false}>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <Health />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <Finance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study"
        element={
          <ProtectedRoute>
            <Study />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/email"
        element={
          <ProtectedRoute>
            <Email />
          </ProtectedRoute>
        }
      />
      <Route
        path="/travel"
        element={
          <ProtectedRoute>
            <Travel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping"
        element={
          <ProtectedRoute>
            <Shopping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-tasks"
        element={
          <ProtectedRoute>
            <AgentTasks />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
