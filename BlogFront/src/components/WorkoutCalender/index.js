import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip'
import axios from 'axios';
import Cookies from 'js-cookie';

const WorkoutCalendar = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            setLoading(true);
            try {
                const token = Cookies.get('auth_token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/workouts/heatmap-data`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHeatmapData(response.data.heatmapData);
            } catch (error) {
                console.error("Failed to fetch heatmap data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmapData();
    }, []);

    if (loading) return <div className="placeholder-content">Loading Calendar...</div>;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return (
        <div className="widget">
            <h3>Workout Consistency (Last Year)</h3>
            <div className="calendar-container">
                <CalendarHeatmap
                    startDate={oneYearAgo}
                    endDate={new Date()}
                    values={heatmapData}
                    classForValue={(value) => {
                        if (!value) { return 'color-empty'; }
                        return `color-scale-${Math.min(value.count, 4)}`;
                    }}
                    tooltipDataAttrs={value => {
                        if (!value || !value.date) return null;
                        const date = new Date(value.date).toLocaleDateString();
                        const countText = value.count === 1 ? '1 workout' : `${value.count} workouts`;
                        return {
                            'data-tooltip-id': 'heatmap-tooltip',
                            'data-tooltip-content': `${date}: ${countText}`
                        };
                    }}
                    
                />
                <Tooltip id="heatmap-tooltip" />
            </div>
        </div>
    );
};

export default WorkoutCalendar;