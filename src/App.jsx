import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/users/Home';
import Login from './pages/users/Login';
import Register from './pages/users/Register';
import Profile from './pages/users/Profile';
import Dashboard from './pages/users/Dashboard';
import ActivitiesInfo from './pages/users/ActivitiesInfo';
import ActivityHistory from './pages/users/ActivityHistory';
import SubmitActivity from './pages/users/SubmitActivity';
import Competencies from './pages/users/Competencies';
import AdminDashboard from './pages/admin/AdminDashboard';
import Settings from './pages/users/Settings';
import ForgotPassword from './pages/users/ForgotPassword';
import Leaderboard from './pages/users/Leaderboard';
import ResetPassword from './pages/users/ResetPassword';
// Layout component with the main navbar
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with the main navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Dashboard routes (no main navbar) */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activities-info" element={<ActivitiesInfo />} />
        <Route path="/activity-history" element={<ActivityHistory />} />
        <Route path="/submit-activity" element={<SubmitActivity />} />
        <Route path="/competencies" element={<Competencies />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;