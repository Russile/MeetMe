import { useState, useEffect } from 'react';
import { Clock, Navigation, Star } from 'lucide-react';
import type { PlaceWithDistance } from '../hooks/usePlaces';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { ShareButton } from './ShareButton';

interface PlaceCardProps {
    place: PlaceWithDistance;
    originA: google.maps.LatLngLiteral;
    originB: google.maps.LatLngLiteral;
    getPlaceDistance: (
        originA: google.maps.LatLngLiteral,
        originB: google.maps.LatLngLiteral,
        destination: google.maps.LatLngLiteral
    ) => Promise<{
        distanceToA?: string;
        durationToA?: string;
        distanceToB?: string;
        durationToB?: string;
    }>;
    onSelect: () => void;
}

export const PlaceCard = ({ place, originA, originB, getPlaceDistance, onSelect }: PlaceCardProps) => {
    const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
    const [details, setDetails] = useState<{
        distanceToA?: string;
        durationToA?: string;
        distanceToB?: string;
        durationToB?: string;
    }>({
        distanceToA: place.distanceToA,
        durationToA: place.durationToA,
        distanceToB: place.distanceToB,
        durationToB: place.durationToB,
    });
    const [loaded, setLoaded] = useState(!!place.distanceToA);

    useEffect(() => {
        if (isIntersecting && !loaded && place.geometry?.location) {
            const destination = {
                lat: typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : (place.geometry.location as any).lat,
                lng: typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : (place.geometry.location as any).lng
            };

            getPlaceDistance(originA, originB, destination).then((result) => {
                setDetails(result);
                setLoaded(true);
            });
        }
    }, [isIntersecting, loaded, place, originA, originB, getPlaceDistance]);

    return (
        <div
            ref={ref}
            className="group border border-gray-100 rounded-xl p-4 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm hover:shadow-md cursor-pointer"
            onClick={onSelect}
        >
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
                <div className="flex flex-col space-y-2 w-28">
                    <ShareButton place={place} />
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.vicinity || place.formatted_address || place.name || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                    </a>
                </div>
            </div>

            {/* Trip Info Section */}
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col space-y-1">
                    <span className="text-gray-400 font-medium">Your Trip</span>
                    <div className="flex items-center text-gray-600">
                        <Clock className="w-3 h-3 mr-1 text-indigo-400" />
                        <span>{details.durationToA || '--'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Navigation className="w-3 h-3 mr-1 text-indigo-400" />
                        <span>{details.distanceToA || '--'}</span>
                    </div>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className="text-gray-400 font-medium">Friend's Trip</span>
                    <div className="flex items-center text-gray-600">
                        <Clock className="w-3 h-3 mr-1 text-purple-400" />
                        <span>{details.durationToB || '--'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Navigation className="w-3 h-3 mr-1 text-purple-400" />
                        <span>{details.distanceToB || '--'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
