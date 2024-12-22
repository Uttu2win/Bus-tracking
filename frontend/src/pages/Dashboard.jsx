import React, { useState } from 'react';
import RouteSelector from '../components/Route/RouteSelector';
import BusMap from '../components/Map/BusMap';

const Dashboard = () => {
    const [selectedRoute, setSelectedRoute] = useState(null);

    const handleRouteSelect = (routeId) => {
        setSelectedRoute(routeId);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Route Selector Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            <RouteSelector onRouteSelect={handleRouteSelect} />
                        </div>
                    </div>

                    {/* Map Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow" style={{ height: '70vh' }}>
                            <BusMap selectedRoute={selectedRoute} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
