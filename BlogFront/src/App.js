// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout'; // The main layout wrapper
import PrivateRoute from './components/PrivateRoute';
// --- All your page components ---
import Home from './components/Home';
import Login from './components/Login/login';
import Registration from './components/Registration';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Dashboard from './components/Dashboard';
import MessagingPage from './components/MessagingPage';
import WorkoutsPage from './components/WorkoutsPage';
import WorkoutPlayer from './components/WorkoutPlayer';
import SinglePost from './components/SinglePost';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
        <Routes>
          {/* --- Public Routes (No Layout) --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/" element={<Login />} />

          {/* --- Private Routes (ALL use the same Layout) --- */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/workout/:routineId" element={<WorkoutPlayer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/post/:postId" element={<SinglePost />} />
              <Route path="/messages" element={<MessagingPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  );
}

export default App;