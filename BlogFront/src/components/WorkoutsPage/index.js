import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./index.css";
import { FaDumbbell, FaStar } from "react-icons/fa";

const WorkoutCard = ({ routine, onStart }) => (
  <div className="routine-card" onClick={() => onStart(routine._id)}>
    <div className="card-header">
      <h3 className="card-title">{routine.title}</h3>
      <div className="card-rating">
        <FaStar /> {(routine.rating ?? 0).toFixed(1)}
      </div>
    </div>
    <p className="card-description">{routine.desc}</p>
    <div className="card-tags">
      <span
        className={`tag level-${routine.level?.toLowerCase() || "unknown"}`}
      >
        {routine.level || "Unknown"}
      </span>
      <span className="tag">{routine.bodyPart}</span>
      <span className="tag">{routine.type}</span>
    </div>
    <button className="start-workout-btn">View Workout</button>
  </div>
);

const WorkoutsPage = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for filters
  const [filterType, setFilterType] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");

  useEffect(() => {
    const fetchRoutines = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("auth_token");
        // We'll modify the backend to accept query params for filtering
        const response = await axios.get("http://localhost:5000/api/routines", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoutines(response.data.routines);
      } catch (err) {
        setError("Could not load workouts.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  const filteredRoutines = routines.filter(
    (r) =>
      (filterType === "All" || r.type === filterType) &&
      (filterLevel === "All" || r.level === filterLevel)
  );

  return (
    <div className="workouts-page-container">
      <header className="workouts-header">
        <h1>Find Your Next Workout</h1>
        <div className="filters-container">
          <div className="filter-group">
            <label>Type</label>
            <select onChange={(e) => setFilterType(e.target.value)}>
              <option>All</option>
              <option>Strength</option>
              <option>Stretching</option>
              <option>Plyometrics</option>
              <option>Powerlifting</option>
              <option>Strongman</option>
              <option>Cardio</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Level</label>
            <select onChange={(e) => setFilterLevel(e.target.value)}>
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      </header>

      <div className="routines-grid">
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading &&
          filteredRoutines.map((routine) => (
            <WorkoutCard
              key={routine._id}
              routine={routine}
              onStart={() => navigate(`/workout/${routine._id}`)}
            />
          ))}
      </div>
    </div>
  );
};

export default WorkoutsPage;
