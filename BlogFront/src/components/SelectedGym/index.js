import React from 'react';
import { useLocation } from 'react-router-dom';
import './index.css';
import megaGym from './megaGymDataset.json';

const SelectedGym = () => {
  const location = useLocation();
  const { bodyPart, userData } = location.state || {};


  const filteredData =
    Array.isArray(megaGym) && userData?.experience_level
      ? megaGym.filter(
          (item) =>
            String(userData.experience_level).toLowerCase() ===
            String(item.Level).toLowerCase()
        )
      : [];

  const exercisesForBodyPart = filteredData.filter(
    (item) => item.BodyPart.toLowerCase() === bodyPart.toLowerCase()
  );
  console.log("Filtered Exercises for Body Part:", exercisesForBodyPart);
  // console.log("Selected Gym:", bodyPart, userData);

  return (
    <div className="selected-gym">
      <h2>Workout Plan for: {bodyPart}</h2>
      {
        exercisesForBodyPart.length > 0 ? (
          <ul className="exercise-list">
            {exercisesForBodyPart.map((exercise, index) => (
              <li key={index}>
                <div className="exercise-card">
                  <h3>{exercise.Title}</h3>
                  <p>Equipment: {exercise.Equipment}</p>
                  <p>Level: {exercise.Level}</p>
                  <p>Type: {exercise.Type}</p>
                  {/* <p>Description: {exercise.Desc}</p> */}
                  
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No exercises found for this body part.</p>
        )
      }
      {/* You can add exercise list based on bodyPart if you want */}
    </div>
  );
};

export default SelectedGym;
