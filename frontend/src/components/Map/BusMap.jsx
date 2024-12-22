import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: '/bus-icon.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Map bounds adjuster component
const MapBoundsAdjuster = ({ routePath }) => {
    const map = useMap();

    useEffect(() => {
        if (routePath && routePath.length > 0) {
            const bounds = L.latLngBounds(routePath.map(point => point.coordinates.reverse()));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, routePath]);

    return null;
};

const BusMap = ({ selectedRoute }) => {
    const [buses, setBuses] = useState([]);
    const [routePath, setRoutePath] = useState([]);
    const [socket, setSocket] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);

    useEffect(() => {
        // Connect to WebSocket
        const newSocket = io('http://localhost:5001');
        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, []);

    useEffect(() => {
        // Fetch route details and buses when a route is selected
        const fetchRouteDetails = async () => {
            if (selectedRoute) {
                try {
                    const response = await axios.get(`http://localhost:5001/api/routes/${selectedRoute}`);
                    setRouteDetails(response.data);
                    setRoutePath(response.data.path);

                    // Fetch buses for this route
                    const busesResponse = await axios.get(`http://localhost:5001/api/buses`);
                    const routeBuses = busesResponse.data.filter(bus => bus.route === selectedRoute);
                    setBuses(routeBuses);
                } catch (error) {
                    console.error('Error fetching route details:', error);
                }
            } else {
                setRouteDetails(null);
                setRoutePath([]);
                setBuses([]);
            }
        };

        fetchRouteDetails();
    }, [selectedRoute]);

    useEffect(() => {
        if (socket) {
            socket.on('busLocationUpdate', (updatedBus) => {
                setBuses(prevBuses => {
                    const index = prevBuses.findIndex(bus => bus._id === updatedBus.busId);
                    if (index !== -1) {
                        const newBuses = [...prevBuses];
                        newBuses[index].currentLocation.coordinates = updatedBus.position;
                        return newBuses;
                    }
                    return prevBuses;
                });
            });
        }
    }, [socket]);

    const defaultCenter = [20.5937, 78.9629]; // Center of India

    return (
        <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Route path */}
            {routePath.length > 0 && (
                <>
                    <Polyline
                        positions={routePath.map(point => point.coordinates.reverse())}
                        color="#2563eb"
                        weight={4}
                        opacity={0.7}
                    />
                    {/* Route stops */}
                    {routePath.map((point, index) => (
                        point.isStop && (
                            <Marker
                                key={index}
                                position={point.coordinates.reverse()}
                                icon={new L.DivIcon({
                                    className: 'custom-div-icon',
                                    html: `<div style="background-color: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                                    iconSize: [12, 12],
                                    iconAnchor: [6, 6]
                                })}
                            >
                                <Popup>
                                    <div className="text-sm font-medium">{point.name}</div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </>
            )}

            {/* Bus markers */}
            {buses.map(bus => (
                <Marker
                    key={bus._id}
                    position={bus.currentLocation.coordinates.reverse()}
                    icon={busIcon}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-medium text-gray-900">Bus {bus.busNumber}</h3>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                    Status: <span className="font-medium text-gray-900">{bus.status}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Occupancy: <span className="font-medium text-gray-900">
                                        {bus.currentOccupancy}/{bus.capacity}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Last Updated: <span className="font-medium text-gray-900">
                                        {new Date(bus.lastUpdated).toLocaleTimeString()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Adjust map bounds to show the entire route */}
            {routePath.length > 0 && <MapBoundsAdjuster routePath={routePath} />}
        </MapContainer>
    );
};

export default BusMap;
