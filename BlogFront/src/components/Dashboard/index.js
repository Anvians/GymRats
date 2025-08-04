import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import DashboardHeader from "../DashboardHeader";
import ProfileSkeleton from "../ProfileSkeleton";
import ProgressChart from "../ProgressChart";
import WorkoutCalendar from "../WorkoutCalender"; // Corrected spelling
import "./index.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = Cookies.get("auth_token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setDashboardData(response.data.dashboard);
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <div className="profile-error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader user={dashboardData} />
      <div className="dashboard-grid">
        <main className="main-panel">
          <ProgressChart />
          <WorkoutCalendar />
        </main>
        
        <aside className="side-panel">
          <div className="widget">
            <h3>Personal Records (PRs)</h3>
            <div className="pr-list">
              {dashboardData.personalRecords?.length > 0 ? (
                dashboardData.personalRecords.slice(0, 5).map((pr, index) => (
                  <div key={index} className="pr-item">
                    <span>{pr.exercise}</span>
                    <strong>{pr.value}</strong>
                  </div>
                ))
              ) : (
                <p className="widget-placeholder-text">No PRs logged yet.</p>
              )}
            </div>
          </div>

          <div className="widget">
            <h3>Recent Activity</h3>
            <div className="notification-list-widget">
              {dashboardData.recentNotifications?.length > 0 ? (
                dashboardData.recentNotifications.map((n) => (
                  <div key={n._id} className="notification-item-widget">
                    <img src={n.sender.dp} alt={n.sender.username} />
                    <p><strong>{n.sender.username}</strong> {n.type === 'follow' ? 'started following you.' : `liked your post.`}</p>
                  </div>
                ))
              ) : (
                <p className="widget-placeholder-text">No recent activity.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;