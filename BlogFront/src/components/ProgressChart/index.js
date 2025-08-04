import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import Cookies from 'js-cookie';

// We need to register the components we are using from Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressChart = () => {
    const [chartData, setChartData] = useState(null);
    const [exercise, setExercise] = useState('Bench Press'); // Default exercise to show
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const token = Cookies.get('auth_token');
                const response = await axios.get(`http://localhost:5000/api/workouts/chart-data?exercise=${exercise}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setChartData({
                    labels: response.data.labels,
                    datasets: [{
                        label: `${exercise} Progress (Max Weight in kg)`,
                        data: response.data.data,
                        borderColor: '#0a84ff',
                        backgroundColor: 'rgba(10, 132, 255, 0.2)',
                        fill: true,
                        tension: 0.1
                    }]
                });
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
                setChartData(null); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [exercise]); // Refetch data whenever the selected exercise changes

    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' } }
    };

    return (
        <div className="widget">
            <div className="chart-header">
                <h3>Progress Chart</h3>
                <select value={exercise} onChange={(e) => setExercise(e.target.value)}>
                    <option>Bench Press</option>
                    <option>Deadlifts</option>
                    <option>Barbell Squats</option>
                </select>
            </div>
            <div className="chart-container">
                {loading && <p>Loading chart data...</p>}
                {!loading && chartData && chartData.labels.length > 0 && <Line options={chartOptions} data={chartData} />}
                {!loading && (!chartData || chartData.labels.length === 0) && <p>No data available for this exercise. Go log a workout!</p>}
            </div>
        </div>
    );
};

export default ProgressChart;