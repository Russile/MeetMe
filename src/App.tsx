import { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AddressInput } from './components/AddressInput';
import { Map } from './components/Map';
import { useMidpoint } from './hooks/useMidpoint';
import { usePlaces } from './hooks/usePlaces';
import { MapPin, Clock, Navigation, Search, Star, Locate } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function App() {
  // Suppress known Google Maps deprecation warnings that we can't avoid
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Suppress PlacesService and deprecated field warnings
      if (message.includes('PlacesService is not available') ||
        message.includes('AutocompleteService is not available') ||
        message.includes('AutocompleteSuggestion is recommended') ||
        message.includes('google.maps.Marker is deprecated') ||
        message.includes('AdvancedMarkerElement is recommended') ||
        message.includes('open_now is deprecated') ||
        message.includes('permanently_closed is deprecated') ||
        message.includes('google.maps.places.Place is recommended')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Suppress deprecated field errors and map clearing errors
      if (message.includes('open_now is deprecated') ||
        message.includes('permanently_closed is deprecated') ||
        message.includes('InvalidValueError: setDirections')) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const [addressA, setAddressA] = useState<google.maps.places.PlaceResult | null>(null);
  const [addressB, setAddressB] = useState<google.maps.places.PlaceResult | null>(null);
  const [addressAText, setAddressAText] = useState<string>(''); // Display text for address A
  const [mode, setMode] = useState<'time' | 'distance'>('time');
  const [category, setCategory] = useState('restaurant');
  const [radius, setRadius] = useState(8047); // 5 miles default (in meters)

  const { calculateMidpoint, result: midpointResult, loading: midpointLoading, error: midpointError } = useMidpoint();
  const { searchPlaces, places, loading: placesLoading, error: placesError } = usePlaces();

  const handleCalculate = () => {
    if (addressA && addressB) {
      calculateMidpoint(addressA, addressB, mode);
    }
  };

  useEffect(() => {
    if (midpointResult?.midpoint && addressA?.geometry?.location && addressB?.geometry?.location) {
      // Convert to LatLngLiteral if they are LatLng objects
      const originA = {
        lat: typeof addressA.geometry.location.lat === 'function' ? addressA.geometry.location.lat() : (addressA.geometry.location as any).lat,
        lng: typeof addressA.geometry.location.lng === 'function' ? addressA.geometry.location.lng() : (addressA.geometry.location as any).lng
      };
      const originB = {
        lat: typeof addressB.geometry.location.lat === 'function' ? addressB.geometry.location.lat() : (addressB.geometry.location as any).lat,
        lng: typeof addressB.geometry.location.lng === 'function' ? addressB.geometry.location.lng() : (addressB.geometry.location as any).lng
      };

      searchPlaces(midpointResult.midpoint, originA, originB, category, radius);
    }
  }, [midpointResult, addressA, addressB, category, radius, searchPlaces]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Create a PlaceResult-like object from coordinates
        const currentLocationPlace: google.maps.places.PlaceResult = {
          geometry: {
            location: new google.maps.LatLng(latitude, longitude)
          } as google.maps.places.PlaceGeometry,
          name: 'Current Location',
          formatted_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          place_id: `current_location_${Date.now()}`,
        };

        setAddressA(currentLocationPlace);

        // Reverse geocode to get readable address and place_id
        if (typeof google !== 'undefined' && google.maps) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                const placeId = results[0].place_id;

                // Now fetch the full place details using the place_id
                // This ensures it's treated exactly like a manually selected address
                const dummyDiv = document.createElement('div');
                const placesService = new google.maps.places.PlacesService(dummyDiv);

                placesService.getDetails(
                  {
                    placeId: placeId,
                    fields: ['geometry', 'name', 'formatted_address', 'place_id', 'rating', 'user_ratings_total', 'vicinity']
                  },
                  (place, placeStatus) => {
                    if (placeStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                      // Use the full place details
                      setAddressA(place);
                      setAddressAText(`Current Location: ${address}`);
                    } else {
                      // Fallback to basic geocoded result
                      currentLocationPlace.formatted_address = address;
                      currentLocationPlace.name = address;
                      currentLocationPlace.place_id = placeId;
                      setAddressA(currentLocationPlace);
                      setAddressAText(`Current Location: ${address}`);
                    }
                  }
                );
              } else {
                // Fallback to coordinates if geocoding fails
                setAddressAText(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
              }
            }
          );
        } else {
          // Fallback if Google Maps not loaded
          setAddressAText(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
      },
      (error) => {
        alert(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
        <div className="w-full max-w-6xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[80vh]">

          {/* Left Panel: Controls */}
          <div className="p-8 lg:col-span-1 border-r border-gray-200/50 flex flex-col h-full overflow-y-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Meet Me
              </h1>
              <p className="text-gray-500 mt-2 text-sm">Find the perfect halfway spot.</p>
            </div>

            <div className="space-y-6 flex-grow">
              <div className="space-y-4">
                <div>
                  <AddressInput
                    label="Your Location"
                    value={addressAText}
                    onPlaceSelect={(p) => {
                      setAddressA(p);
                      setAddressAText(''); // Clear custom text when user selects manually
                    }}
                    placeholder="Enter starting point A"
                  />
                  <button
                    onClick={handleUseCurrentLocation}
                    className="mt-2 w-full flex items-center justify-center px-3 py-2 border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Locate className="w-4 h-4 mr-2" />
                    Use Current Location
                  </button>
                </div>

                <AddressInput
                  label="Friend's Location"
                  onPlaceSelect={(p) => {
                    setAddressB(p);
                  }}
                  placeholder="Enter starting point B"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Optimization Mode</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setMode('time')}
                    className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === 'time'
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200'
                      : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Time
                  </button>
                  <button
                    onClick={() => setMode('distance')}
                    className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === 'distance'
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200'
                      : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Distance
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Place Category</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 bg-white border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none cursor-pointer"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="bar">Bar</option>
                    <option value="park">Park</option>
                    <option value="shopping_mall">Shopping</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Radius</label>
                <div className="relative">
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="block w-full px-4 py-2 bg-white border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none cursor-pointer"
                  >
                    <option value={1609}>1 mile</option>
                    <option value={4828}>3 miles</option>
                    <option value={8047}>5 miles</option>
                    <option value={16093}>10 miles</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!addressA || !addressB || midpointLoading}
                className={`w-full py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]
                  ${addressA && addressB && !midpointLoading
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'
                    : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {midpointLoading ? 'Calculating Route...' : 'Find Midpoint'}
              </button>

              {midpointError && <p className="text-red-500 text-center text-xs bg-red-50 p-2 rounded-lg">{midpointError}</p>}
              {placesError && <p className="text-red-500 text-center text-xs bg-red-50 p-2 rounded-lg">{placesError}</p>}
            </div>
          </div>

          {/* Right Panel: Map & Results */}
          <div className="lg:col-span-2 flex flex-col bg-gray-50/50 overflow-hidden">
            <div className="flex-1 min-h-0">
              <Map route={midpointResult?.route || null} midpoint={midpointResult?.midpoint || null} places={places} />
            </div>

            {placesLoading && (
              <div className="p-6 text-center text-gray-500 animate-pulse border-t border-gray-200 bg-white">
                Finding the best spots for you...
              </div>
            )}

            {!placesLoading && places.length > 0 && (
              <div className="max-h-[40vh] overflow-y-auto p-6 border-t border-gray-200 bg-white">
                <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                  Recommended Places ({places.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {places.map((place) => (
                    <div key={place.place_id} className="group border border-gray-100 rounded-xl p-4 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm hover:shadow-md">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 truncate">{place.name}</h3>
                      <p className="text-gray-500 text-xs mt-1 truncate">{place.vicinity}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {place.rating && (
                            <div className="flex items-center bg-yellow-100 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 text-yellow-600 fill-current" />
                              <span className="text-yellow-700 text-xs font-bold ml-1">{place.rating}</span>
                            </div>
                          )}
                          {place.user_ratings_total && (
                            <span className="text-gray-400 text-xs">({place.user_ratings_total} reviews)</span>
                          )}
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.vicinity || place.formatted_address || place.name || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Directions
                        </a>
                      </div>

                      {/* Trip Info Section */}
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col space-y-1">
                          <span className="text-gray-400 font-medium">From You</span>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-3 h-3 mr-1 text-indigo-400" />
                            <span>{(place as any).durationToA || '--'}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Navigation className="w-3 h-3 mr-1 text-indigo-400" />
                            <span>{(place as any).distanceToA || '--'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-gray-400 font-medium">From Friend</span>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-3 h-3 mr-1 text-purple-400" />
                            <span>{(place as any).durationToB || '--'}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Navigation className="w-3 h-3 mr-1 text-purple-400" />
                            <span>{(place as any).distanceToB || '--'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </APIProvider>
  );
}

export default App;
