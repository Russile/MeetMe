import React, { useEffect, useState } from 'react';
import { Map as GoogleMap, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface MapProps {
    route: google.maps.DirectionsResult | null;
    midpoint: google.maps.LatLngLiteral | null;
    places?: google.maps.places.PlaceResult[];
}

const DirectionsRenderer = ({ route }: { route: google.maps.DirectionsResult | null }) => {
    const map = useMap();
    const routesLib = useMapsLibrary('routes');
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (!routesLib || !map) return;
        setDirectionsRenderer(new routesLib.DirectionsRenderer({ map }));
    }, [routesLib, map]);

    useEffect(() => {
        if (directionsRenderer) {
            if (route) {
                directionsRenderer.setDirections(route);
            } else {
                // Clear the route by setting an empty routes array
                directionsRenderer.setDirections({ routes: [] } as any);
            }
        }
    }, [directionsRenderer, route]);

    return null;
};

export const Map: React.FC<MapProps> = ({ route, midpoint, places = [] }) => {
    return (
        <div className="w-full h-full rounded-xl overflow-hidden shadow-md">
            <GoogleMap
                defaultCenter={{ lat: 40.7128, lng: -74.0060 }} // Default to NYC
                defaultZoom={10}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                className="w-full h-full"
            >
                <DirectionsRenderer route={route} />
                {midpoint && <Marker position={midpoint} title="Midpoint" />}
                {places.map((place) => (
                    place.geometry?.location && (
                        <Marker
                            key={place.place_id}
                            position={{
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            }}
                            title={place.name}
                        />
                    )
                ))}
            </GoogleMap>
        </div>
    );
};
