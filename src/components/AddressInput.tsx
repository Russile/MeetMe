import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressInputProps {
    label: string;
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    placeholder?: string;
    value?: string; // External value to display
}

export const AddressInput: React.FC<AddressInputProps> = ({ label, onPlaceSelect, placeholder, value }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState('');
    const placesLib = useMapsLibrary('places');
    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!placesLib) return;

        setAutocompleteService(new placesLib.AutocompleteService());

        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        setPlacesService(new placesLib.PlacesService(dummyDiv));
    }, [placesLib]);

    // Sync external value to internal state
    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.length > 2 && autocompleteService) {
            autocompleteService.getPlacePredictions(
                { input: value },
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setPredictions(predictions);
                        setShowDropdown(true);
                    } else {
                        setPredictions([]);
                    }
                }
            );
        } else {
            setPredictions([]);
            setShowDropdown(false);
        }
    };

    const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
        setInputValue(prediction.description);
        setShowDropdown(false);
        setPredictions([]);

        // Get place details with geometry
        if (placesService) {
            placesService.getDetails(
                {
                    placeId: prediction.place_id,
                    fields: ['geometry', 'name', 'formatted_address', 'place_id', 'rating', 'user_ratings_total', 'vicinity']
                },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        onPlaceSelect(place);
                    }
                }
            );
        }
    };

    return (
        <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={placeholder || 'Enter an address'}
            />

            {showDropdown && predictions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                    {predictions.map((prediction) => (
                        <li
                            key={prediction.place_id}
                            onClick={() => handleSelectPrediction(prediction)}
                            className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                        >
                            {prediction.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Add type definition for the event if missing
declare global {
    namespace google.maps.places {
        interface PlaceAutocompleteElementEvent extends Event {
            place: google.maps.places.Place;
        }
    }
}
