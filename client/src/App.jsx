import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import EditJob from './pages/EditJob';
import PostJob from './pages/PostJob';
import MyApplications from './pages/MyApplications';
import JobApplications from './pages/JobApplications';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import StudentStatus from './pages/StudentStatus';
import CareerPath from './pages/CareerPath';
import LearningRoadmap from './pages/LearningRoadmap';
import InterviewSchedule from './pages/InterviewSchedule';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (user) return <Navigate to="/dashboard" />;
    return children;
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
          <Navbar />
          <div className="container mx-auto px-4 py-8 pt-24">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                  <PublicRoute>
                      <LandingPage />
                  </PublicRoute>
              } />
              <Route path="/login" element={
                  <PublicRoute>
                      <Login />
                  </PublicRoute>
              } />
              <Route path="/register" element={
                  <PublicRoute>
                      <Register />
                  </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

              <Route path="/jobs" element={
                <PrivateRoute>
                  <Jobs />
                </PrivateRoute>
              } />

              <Route path="/jobs/:id" element={
                <PrivateRoute>
                  <JobDetails />
                </PrivateRoute>
              } />

              <Route path="/jobs/:id/edit" element={
                <PrivateRoute>
                  <EditJob />
                </PrivateRoute>
              } />

              <Route path="/my-applications" element={
                <PrivateRoute roles={['student']}>
                  <MyApplications />
                </PrivateRoute>
              } />

              <Route path="/resume-analyzer" element={
                <PrivateRoute roles={['student']}>
                  <ResumeAnalyzer />
                </PrivateRoute>
              } />

              <Route path="/career-path" element={
                <PrivateRoute roles={['student']}>
                  <CareerPath />
                </PrivateRoute>
              } />

              <Route path="/career-path/roadmap/:roleId" element={
                <PrivateRoute roles={['student']}>
                  <LearningRoadmap />
                </PrivateRoute>
              } />

              <Route path="/interviews" element={
                <PrivateRoute roles={['student']}>
                  <InterviewSchedule />
                </PrivateRoute>
              } />

              <Route path="/admin/post-job" element={
                <PrivateRoute roles={['admin']}>
                  <PostJob />
                </PrivateRoute>
              } />
              
              <Route path="/admin/applications/:jobId" element={
                <PrivateRoute roles={['admin']}>
                  <JobApplications />
                </PrivateRoute>
              } />

              <Route path="/admin/student-status" element={
                <PrivateRoute roles={['admin']}>
                  <StudentStatus />
                </PrivateRoute>
              } />

            </Routes>
          </div>
          <ToastContainer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
