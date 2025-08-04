// components/WorkoutPlayer.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaClock, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
import './index.css';

const SetTrackerRow = ({ setIndex, setData, log, isComplete }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(setIndex, name, value);
    };

    return (
        <div className={`set-row ${isComplete ? 'complete' : ''}`}>
            <div className="set-number">SET {setIndex + 1}</div>
            <div className="input-field">
                <label>Weight (kg)</label>
                <input
                    type="number"
                    name="weight"
                    value={log.weight}
                    onChange={handleInputChange}
                    placeholder="0"
                />
            </div>
            <div className="input-field">
                <label>Reps</label>
                <input
                    type="number"
                    name="reps"
                    value={log.reps}
                    onChange={handleInputChange}
                    placeholder="0"
                />
            </div>
            <button
                className="set-complete-btn"
                onClick={() => setData(setIndex, 'isComplete', true)}
            >
                <FaCheck />
            </button>
        </div>
    );
};

const WorkoutPlayer = () => {
    const { routineId } = useParams();
    const navigate = useNavigate();

    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [workoutLog, setWorkoutLog] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // NEW: loading state for saving
    const [masterTime, setMasterTime] = useState(0);
    const [restTime, setRestTime] = useState(0);
    const masterTimerRef = useRef(null);
    const restTimerRef = useRef(null);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const fetchRoutine = async () => {
        try {
            const token = Cookies.get('auth_token');
            const response = await axios.get(`http://localhost:5000/api/routines/${routineId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const routineData = response.data.routine;

            if (!routineData || !Array.isArray(routineData.exercises)) {
                throw new Error("Invalid routine format from server");
            }

            setRoutine(routineData);

            const initialLog = routineData.exercises.map((ex) => ({
                exerciseId: ex._id,
                exerciseName: ex.name,
                sets: Array.from(
                    { length: Number(ex.targetSets || 1) },
                    () => ({ weight: '', reps: '', isComplete: false })
                ),
            }));

            setWorkoutLog(initialLog);
        } catch (error) {
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login');
            } else {
                console.error("Failed to fetch routine:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutine();
    }, [routineId]);

    useEffect(() => {
        masterTimerRef.current = setInterval(() => {
            setMasterTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(masterTimerRef.current);
    }, []);

    useEffect(() => {
        if (restTime > 0) {
            restTimerRef.current = setInterval(() => {
                setRestTime((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(restTimerRef.current);
    }, [restTime]);

    const handleSetData = (setIndex, field, value) => {
        const newWorkoutLog = [...workoutLog];
        const newSets = [...newWorkoutLog[currentExerciseIndex].sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        newWorkoutLog[currentExerciseIndex].sets = newSets;
        setWorkoutLog(newWorkoutLog);

        if (field === 'isComplete' && value === true) {
            setRestTime(60);
        }
    };

    const handleFinishWorkout = async () => {
        setIsSaving(true); // Set loading state

        try {
            const token = Cookies.get('auth_token');
            const payload = {
                routineId: routine._id,
                durationMinutes: Math.round(masterTime / 60) || 1, // Ensure it's at least 1 minute
                log: workoutLog,
            };

            // Call the new endpoint
            await axios.post('http://localhost:5000/api/workouts/complete', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If successful, show the summary screen
            setIsFinished(true);

        } catch (error) {
            console.error("Failed to save workout:", error);
            alert("Sorry, there was an error saving your workout.");
        } finally {
            setIsSaving(false); // Unset loading state
        }
    };

    const goToNextExercise = () => {
        if (currentExerciseIndex < routine.exercises.length - 1) {
            setCurrentExerciseIndex((prev) => prev + 1);
        }
    };

    const goToPrevExercise = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex((prev) => prev - 1);
        }
    };

    if (loading) return <div>Loading workout...</div>;
    if (!routine || !routine.exercises || routine.exercises.length === 0) {
        return <div>Workout not found or has no exercises.</div>;
    }
    if (!workoutLog[currentExerciseIndex]) {
        return <div>Loading exercise log...</div>;
    }

    const currentExercise = routine.exercises[currentExerciseIndex];
    const currentLog = workoutLog[currentExerciseIndex];

    if (isFinished) {
        return (
            <div className="workout-summary-container">
                <h2>Workout Complete!</h2>
                <p>Great job finishing the <strong>{routine.name}</strong> workout.</p>
                <p>Your session has been saved to your dashboard.</p>
                <button onClick={() => navigate('/dashboard')} className="summary-btn">
                    View Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="workout-player-container">
            <header className="player-header">
                <h3>{routine.name}</h3>
                <div className="master-timer">
                    <FaClock /> <span>{formatTime(masterTime)}</span>
                </div>
            </header>

            <div className="exercise-navigation">
                <button onClick={goToPrevExercise} disabled={currentExerciseIndex === 0}>
                    <FaChevronLeft /> Prev
                </button>
                <span>Exercise {currentExerciseIndex + 1} of {routine.exercises.length}</span>
                <button onClick={goToNextExercise} disabled={currentExerciseIndex === routine.exercises.length - 1}>
                    Next <FaChevronRight />
                </button>
            </div>

            <main className="current-exercise-panel">
                <h2 className="exercise-title">{currentExercise.name}</h2>
                <div className="sets-tracker">
                    {currentLog.sets.map((setLog, index) => (
                        <SetTrackerRow
                            key={index}
                            setIndex={index}
                            setData={handleSetData}
                            log={setLog}
                            isComplete={setLog.isComplete}
                        />
                    ))}
                </div>

                {restTime > 0 && (
                    <div className="rest-timer">
                        <p>REST TIMER: <span>{formatTime(restTime)}</span></p>
                    </div>
                )}
            </main>

            <footer className="player-footer">
                <button 
                    className="finish-workout-btn" 
                    onClick={handleFinishWorkout}
                    disabled={isSaving} // Disable button while saving
                >
                    {isSaving ? 'Saving...' : 'Finish Workout'}
                </button>
            </footer>
        </div>
    );
};

export default WorkoutPlayer;
