import { useState, useCallback } from 'react';

export interface PlaceWithDistance extends google.maps.places.PlaceResult {
    distanceToA?: string;
    durationToA?: string;
    distanceToB?: string;
    durationToB?: string;
}

export const usePlaces = () => {
    const [places, setPlaces] = useState<PlaceWithDistance[]>([]);
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
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                setPlaces(results);
                setLoading(false);
            } else {
                console.error('Places search failed:', status);
                setError(`Failed to find ${type}s nearby.`);
                setPlaces([]);
                setLoading(false);
            }
        });
    }, []);

    const getPlaceDistance = useCallback((
        originA: google.maps.LatLngLiteral,
        originB: google.maps.LatLngLiteral,
        destination: google.maps.LatLngLiteral
    ): Promise<{
        distanceToA?: string;
        durationToA?: string;
        distanceToB?: string;
        durationToB?: string;
    }> => {
        return new Promise((resolve) => {
            if (typeof google === 'undefined' || !google.maps) {
                resolve({});
                return;
            }

            const distanceService = new google.maps.DistanceMatrixService();
            distanceService.getDistanceMatrix({
                origins: [originA, originB],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
            }, (response, status) => {
                if (status === google.maps.DistanceMatrixStatus.OK && response) {
                    const resultA = response.rows[0].elements[0];
                    const resultB = response.rows[1].elements[0];
                    resolve({
                        distanceToA: resultA?.distance?.text,
                        durationToA: resultA?.duration?.text,
                        distanceToB: resultB?.distance?.text,
                        durationToB: resultB?.duration?.text,
                    });
                } else {
                    console.error('Distance Matrix failed:', status);
                    resolve({});
                }
            });
        });
    }, []);

    return { searchPlaces, places, loading, error, getPlaceDistance };
};
