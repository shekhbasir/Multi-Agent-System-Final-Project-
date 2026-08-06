import Home from "./pages/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNot from "./components/PageNot.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Settings from "./pages/Settings.jsx";
import Explore from "./pages/Explore.jsx";
import MySessionsPage from "./pages/MySessionsPage.jsx";
import Host from "./pages/Host.jsx";
import MyCertificates from "./pages/MyCertificates.jsx";
import OpportunityMap from "./pages/OpportunityMap";
import OpportunityTracker from "./pages/OpportunityTracker.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="settings" element={<Settings />} />
              <Route path="certificates" element={<MyCertificates />} />
            </Route>

            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/my-sessions"
              element={
                <ProtectedRoute>
                  <MySessionsPage />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/host"
              element={
                <ProtectedRoute>
                  <Host />
                </ProtectedRoute>
              }
            ></Route>

            <Route path="/meeting/:roomId" element={<MeetingRoom />}></Route>
            <Route
              path="/verify-certificate/:certificateId"
              element={<VerifyCertificate />}
            ></Route>
            <Route
              path="/opportunity-map"
              element={
                <ProtectedRoute>
                  <OpportunityMap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunity-map/tracker"
              element={<OpportunityTracker />}
            />

            <Route path="*" element={<PageNot />}></Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
