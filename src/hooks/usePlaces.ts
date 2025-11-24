import { useState, useCallback } from 'react';

export const usePlaces = () => {
    const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchPlaces = useCallback((
        location: google.maps.LatLngLiteral,
        type: string = 'restaurant',
        radius: number = 1000 // 1km default (in meters)
    ) => {
        // Check if google.maps is available (loaded by APIProvider)
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.error('Google Maps Places not loaded');
            setError('Maps not ready. Please try again.');
            return;
        }

        setLoading(true);
        setError(null);

        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        const service = new google.maps.places.PlacesService(dummyDiv);

        const request: google.maps.places.PlaceSearchRequest = {
            location,
            radius,
            type, // Using the string directly
        };

        service.nearbySearch(request, (results, status) => {
            setLoading(false);

            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                setPlaces(results);
            } else {
                console.error('Places search failed:', status);
                setError(`Failed to find ${type}s nearby.`);
                setPlaces([]);
            }
        });
    }, []);

    return { searchPlaces, places, loading, error };
};
