import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RouteSelector = ({ onRouteSelect }) => {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRouteDetails, setSelectedRouteDetails] = useState(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5001/api/routes');
                console.log('Fetched routes:', response.data);
                setRoutes(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching routes:', err);
                setError('Failed to fetch routes');
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    const handleRouteChange = async (e) => {
        const routeId = e.target.value;
        setSelectedRoute(routeId);
        
        if (routeId) {
            try {
                const response = await axios.get(`http://localhost:5001/api/routes/${routeId}`);
                setSelectedRouteDetails(response.data);
                onRouteSelect(routeId);
            } catch (err) {
                console.error('Error fetching route details:', err);
                setError('Failed to fetch route details');
            }
        } else {
            setSelectedRouteDetails(null);
            onRouteSelect(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert-error fade-in" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="heading-3">Select Your Route</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Choose your bus route to start tracking
                </p>
                <select
                    value={selectedRoute}
                    onChange={handleRouteChange}
                    className="form-input"
                >
                    <option value="">Select a route</option>
                    {routes.map(route => (
                        <option key={route._id} value={route._id}>
                            {route.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedRouteDetails && (
                <div className="space-y-4 fade-in">
                    <h4 className="font-medium text-gray-900">Route Details</h4>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">{selectedRouteDetails.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                        <h5 className="text-sm font-medium text-gray-700">Stops</h5>
                        {selectedRouteDetails.path.map((point, index) => (
                            point.isStop && (
                                <div key={index} className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span className="text-sm text-gray-600">{point.name}</span>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="space-y-3">
                        <h5 className="text-sm font-medium text-gray-700">Schedule</h5>
                        {selectedRouteDetails.schedule.map((schedule, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 space-y-2"
                            >
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Departure</span>
                                    <span className="font-medium text-gray-900">
                                        {schedule.departureTime}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Arrival</span>
                                    <span className="font-medium text-gray-900">
                                        {schedule.arrivalTime}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {schedule.days.map((day, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                        >
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteSelector;
