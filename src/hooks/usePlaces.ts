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
        originA: google.maps.LatLngLiteral,
        originB: google.maps.LatLngLiteral,
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
                // Now calculate distances from both origins to these places
                const destinations = results.map(place => place.geometry?.location).filter(Boolean) as google.maps.LatLng[];
                
                if (destinations.length === 0) {
                    setPlaces(results);
                    setLoading(false);
                    return;
                }

                const distanceService = new google.maps.DistanceMatrixService();
                
                distanceService.getDistanceMatrix({
                    origins: [originA, originB],
                    destinations: destinations,
                    travelMode: google.maps.TravelMode.DRIVING,
                }, (response, status) => {
                    if (status === google.maps.DistanceMatrixStatus.OK && response) {
                        const enhancedPlaces: PlaceWithDistance[] = results.map((place, index) => {
                            const resultA = response.rows[0].elements[index];
                            const resultB = response.rows[1].elements[index];
                            
                            return {
                                ...place,
                                distanceToA: resultA?.distance?.text,
                                durationToA: resultA?.duration?.text,
                                distanceToB: resultB?.distance?.text,
                                durationToB: resultB?.duration?.text,
                            };
                        });
                        setPlaces(enhancedPlaces);
                    } else {
                        console.error('Distance Matrix failed:', status);
                        // Fallback to just places without distance info
                        setPlaces(results);
                    }
                    setLoading(false);
                });

            } else {
                console.error('Places search failed:', status);
                setError(`Failed to find ${type}s nearby.`);
                setPlaces([]);
                setLoading(false);
            }
        });
    }, []);

    return { searchPlaces, places, loading, error };
};
