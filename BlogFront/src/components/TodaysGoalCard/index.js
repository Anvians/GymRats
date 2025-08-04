import "./index.css";
import { useState } from "react";
import megaGym from './megaGymDataset.json'
const TodaysGoalCard = ({ dataGoal, isClicked, selectedBodyPart}) => {
  const [isGoalStarted, setIsGoalStarted] = useState(false);
  console.log('dataGoal', dataGoal)
  const start_today = () => {
    // Logic to start the goal
    setIsGoalStarted(true);
    console.log("Starting today's goal activities...");
  }

  //filter the dataGoal 
  const filterGoal = dataGoal.filter((each)=>{
    return !selectedBodyPart || each.BodyPart === selectedBodyPart;
  })



  const handleStartClick = () => {
    setIsGoalStarted(true);
    console.log("Starting today's goal activities...");
  };

  return (
    <div>
      <div className="goal-card">
       
        <div className="progress-bar">
          <div
            className="progress"
            // style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
        {/* <p className="progress-text">{goal.progress}% completed</p> */}
        {isClicked && (
          <div className="goal-actions">
            <button onClick={handleStartClick} className="start-button">Start</button>
            <button className="start-button">Skip</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default TodaysGoalCard;
