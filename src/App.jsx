import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ActivitiesInfo from './pages/ActivitiesInfo';
import ActivityHistory from './pages/ActivityHistory';
import SubmitActivity from './pages/SubmitActivity';
import Competencies from './pages/Competencies';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
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
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Dashboard routes (no main navbar) */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activities-info" element={<ActivitiesInfo />} />
        <Route path="/activity-history" element={<ActivityHistory />} />
        <Route path="/submit-activity" element={<SubmitActivity />} />
        <Route path="/competencies" element={<Competencies />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;