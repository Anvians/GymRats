import React from 'react';
import { FaFire, FaDumbbell, FaWeight } from 'react-icons/fa';
import './index.css'; // It will share the same CSS file

const StatCard = ({ icon, label, value }) => (
    <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

const DashboardHeader = ({ user }) => {
    return (
        <header className="dashboard-header">
            <h1 className="welcome-message">Welcome back, {user.username}!</h1>
            <div className="stats-grid">
                <StatCard 
                    icon={<FaFire />} 
                    label="Workout Streak" 
                    value={`${user.streak} Days`} 
                />
                <StatCard 
                    icon={<FaDumbbell />} 
                    label="Last Workout" 
                    value={user.lastWorkout} 
                />
                <StatCard 
                    icon={<FaWeight />} 
                    label="Current Weight" 
                    value={`${user.currentWeight} kg`} 
                />
            </div>
        </header>
    );
};

export default DashboardHeader;