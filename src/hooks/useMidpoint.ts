import { useState, useCallback } from 'react';

export interface MidpointResult {
    midpoint: google.maps.LatLngLiteral;
    route: google.maps.DirectionsResult;
    timeBased: boolean;
}

export const useMidpoint = () => {
    const [result, setResult] = useState<MidpointResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateMidpoint = useCallback(async (
        origin: google.maps.places.PlaceResult,
        destination: google.maps.places.PlaceResult,
        mode: 'time' | 'distance' = 'time'
    ) => {
        // Check if google.maps is available (it should be loaded by APIProvider)
        if (typeof google === 'undefined' || !google.maps) {
            const errorMsg = 'Google Maps not loaded yet. Please wait a moment and try again.';
            console.error(errorMsg);
            setError(errorMsg);
            return;
        }

        if (!origin.geometry?.location || !destination.geometry?.location) {
            const errorMsg = 'Address missing location data. Please reselect addresses.';
            console.error('Missing geometry', { originLoc: origin.geometry?.location, destLoc: destination.geometry?.location });
            setError(errorMsg);
            return;
        }

        setLoading(true);
        setError(null);

        // DirectionsService is available on global google.maps
        const directionsService = new google.maps.DirectionsService();

        try {
            const response = await directionsService.route({
                origin: origin.geometry.location,
                destination: destination.geometry.location,
                travelMode: google.maps.TravelMode.DRIVING,
            });

            if (response.routes.length > 0 && response.routes[0].legs.length > 0) {
                const route = response.routes[0];
                const leg = route.legs[0];
                const totalValue = mode === 'time' ? leg.duration?.value : leg.distance?.value;

                if (totalValue === undefined) {
                    throw new Error('Could not calculate route duration/distance');
                }

                const targetValue = totalValue / 2;
                let currentValue = 0;
                let midpoint: google.maps.LatLngLiteral | null = null;

                // Iterate through steps to find the midpoint
                for (const step of leg.steps) {
                    const stepValue = mode === 'time' ? step.duration?.value : step.distance?.value;
                    if (stepValue === undefined) continue;

                    if (currentValue + stepValue >= targetValue) {
                        // Midpoint is in this step
                        // Simple interpolation for now (could be more precise with path decoding)
                        const ratio = (targetValue - currentValue) / stepValue;
                        const path = step.path;
                        const index = Math.floor(path.length * ratio);
                        const point = path[index];
                        midpoint = { lat: point.lat(), lng: point.lng() };
                        break;
                    }
                    currentValue += stepValue;
                }

                // Fallback if loop finishes without finding (shouldn't happen if logic is right)
                if (!midpoint) {
                    const lastStep = leg.steps[leg.steps.length - 1];
                    const end = lastStep.path[lastStep.path.length - 1];
                    midpoint = { lat: end.lat(), lng: end.lng() };
                }

                setResult({
                    midpoint,
                    route: response,
                    timeBased: mode === 'time'
                });
            }
        } catch (err) {
            console.error('Error calculating route:', err);
            setError('Failed to calculate route. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    return { calculateMidpoint, result, loading, error };
};
