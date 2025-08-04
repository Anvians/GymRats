import React, { useState } from "react";
import './index.css';
import Cookies from "js-cookie";
const initialState = {
    
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    body_fat_percent: "",
    fitness_goal: "",
    experience_level: "",
    available_equipment: [],
    workout_location: "",
    injuries: [],
};

const equipmentOptions = [
    "dumbbells",
    "resistance bands",
    "barbell",
    "kettlebell",
    "bodyweight",
];

const injuryOptions = [
    "knee",
    "lower back",
    "shoulder",
    "ankle",
    "wrist",
];

const CurrentDetails = () => {
    const [form, setForm] = useState(initialState);
    const [message, setMessage] = useState("");
    const token = Cookies.get('auth_token');
    if (!token) {
        window.location.href = '/login';
    }
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox" && name === "available_equipment") {
            setForm((prev) => ({
                ...prev,
                available_equipment: checked
                    ? [...prev.available_equipment, value]
                    : prev.available_equipment.filter((eq) => eq !== value),
            }));
        } else if (type === "checkbox" && name === "injuries") {
            setForm((prev) => ({
                ...prev,
                injuries: checked
                    ? [...prev.injuries, value]
                    : prev.injuries.filter((inj) => inj !== value),
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/userdata`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    age: Number(form.age),
                    height_cm: Number(form.height_cm),
                    weight_kg: Number(form.weight_kg),
                    body_fat_percent: form.body_fat_percent
                        ? Number(form.body_fat_percent)
                        : null,
                }),
            });
            if (res.ok) {
                setMessage(" User details submitted successfully!");
                setForm(initialState);
            } else {
                const data = await res.json();
                setMessage(data.message || " Submission failed.");
            }
        } catch (err) {
            setMessage(" Error submitting form.");
        }
    };

    return (
        <form className="details-form" onSubmit={handleSubmit}>
            <h2>Enter Your Details</h2>

            <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />

            <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>

            <input name="height_cm" type="number" placeholder="Height (cm)" value={form.height_cm} onChange={handleChange} required />
            <input name="weight_kg" type="number" placeholder="Weight (kg)" value={form.weight_kg} onChange={handleChange} required />
            <input name="body_fat_percent" type="number" placeholder="Body Fat % (optional)" value={form.body_fat_percent} onChange={handleChange} min="0" max="100" />

            <select name="fitness_goal" value={form.fitness_goal} onChange={handleChange} required>
                <option value="">Select Fitness Goal</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="endurance">Endurance</option>
                <option value="general_fitness">General Fitness</option>
            </select>

            <select name="experience_level" value={form.experience_level} onChange={handleChange} required>
                <option value="">Experience Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
            </select>

            <div className="checkbox-group">
                <label>Available Equipment:</label>
                <div className="checkbox-list">
                    {equipmentOptions.map((eq) => (
                        <label key={eq}>
                            <input className="checkbox_class" type="checkbox" name="available_equipment" value={eq} checked={form.available_equipment.includes(eq)} onChange={handleChange} />
                            {eq}
                        </label>
                    ))}
                </div>
            </div>

            <select name="workout_location" value={form.workout_location} onChange={handleChange} required>
                <option value="">Workout Location</option>
                <option value="home">Home</option>
                <option value="gym">Gym</option>
            </select>

            <div className="checkbox-group">
                <label>Injuries:</label>
                <div className="checkbox-list">
                    {injuryOptions.map((inj) => (
                        <label key={inj}>
                            <input type="checkbox" name="injuries" value={inj} checked={form.injuries.includes(inj)} onChange={handleChange} />
                            {inj}
                        </label>
                    ))}
                </div>
            </div>

            <button type="submit">Submit</button>

            {message && <div className="form-message">{message}</div>}
        </form>
    );
};

export default CurrentDetails;
