import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CustomerPortal from "./pages/CustomerPortal";
import AgentDashboard from "./pages/AgentDashboard";

// Placeholder page to be implemented in future batches
const AdminPanel = () => <div className="p-8">Admin Panel</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/customer/*" 
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerPortal />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/agent/*" 
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <AgentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
