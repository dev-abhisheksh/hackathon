import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Placeholder pages to be implemented in future batches
const CustomerPortal = () => <div className="p-8">Customer Portal</div>;
const AgentDashboard = () => <div className="p-8">Agent Dashboard</div>;
const AdminPanel = () => <div className="p-8">Admin Panel</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
