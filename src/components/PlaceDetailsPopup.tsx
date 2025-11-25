import { useEffect, useState } from 'react';
import { X, Star, Globe, Phone, Clock, MapPin, User } from 'lucide-react';

interface PlaceDetailsPopupProps {
    placeId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PlaceDetailsPopup({ placeId, isOpen, onClose }: PlaceDetailsPopupProps) {
    const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !placeId) return;

        setLoading(true);
        setError(null);
        setPlaceDetails(null);

        // We need to use the PlacesService, which requires a DOM element (even a dummy one)
        const dummyDiv = document.createElement('div');
        const service = new google.maps.places.PlacesService(dummyDiv);

        const request: google.maps.places.PlaceDetailsRequest = {
            placeId: placeId,
            fields: [
                'name',
                'rating',
                'user_ratings_total',
                'formatted_address',
                'formatted_phone_number',
                'opening_hours',
                'website',
                'reviews',
                'photos',
                'url' // Google Maps URL
            ]
        };

        service.getDetails(request, (place, status) => {
            setLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                setPlaceDetails(place);
            } else {
                setError('Failed to load place details.');
                console.error('Place details fetch failed:', status);
            }
        });
    }, [placeId, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">

                {/* Header / Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm z-10 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {loading && (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {error && (
                    <div className="flex-1 flex items-center justify-center p-12 text-red-500">
                        {error}
                    </div>
                )}

                {!loading && !error && placeDetails && (
                    <>
                        {/* Hero Image (if available) */}
                        <div className="h-48 bg-gray-200 relative">
                            {placeDetails.photos && placeDetails.photos.length > 0 ? (
                                <img
                                    src={placeDetails.photos[0].getUrl({ maxWidth: 800, maxHeight: 400 })}
                                    alt={placeDetails.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                    <MapPin className="w-16 h-16" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                                <h2 className="text-2xl font-bold text-white">{placeDetails.name}</h2>
                                <div className="flex items-center text-white/90 mt-1 space-x-2">
                                    {placeDetails.rating && (
                                        <div className="flex items-center bg-yellow-400/20 px-2 py-0.5 rounded backdrop-blur-md">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="ml-1 font-bold">{placeDetails.rating}</span>
                                            <span className="ml-1 text-xs opacity-80">({placeDetails.user_ratings_total})</span>
                                        </div>
                                    )}
                                    {placeDetails.opening_hours && (
                                        <span className={`text-sm px-2 py-0.5 rounded ${placeDetails.opening_hours.isOpen() ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                                            {placeDetails.opening_hours.isOpen() ? 'Open Now' : 'Closed'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Scrollable Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                                {placeDetails.website && (
                                    <a
                                        href={placeDetails.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        <Globe className="w-4 h-4 mr-2" />
                                        Visit Website / Menu
                                    </a>
                                )}
                                {placeDetails.url && (
                                    <a
                                        href={placeDetails.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <MapPin className="w-4 h-4 mr-2" />
                                        View on Maps
                                    </a>
                                )}
                                {placeDetails.formatted_phone_number && (
                                    <a
                                        href={`tel:${placeDetails.formatted_phone_number}`}
                                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call
                                    </a>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400" />
                                            <span>{placeDetails.formatted_address}</span>
                                        </div>
                                        {placeDetails.formatted_phone_number && (
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                                <span>{placeDetails.formatted_phone_number}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {placeDetails.opening_hours && placeDetails.opening_hours.weekday_text && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Hours
                                        </h3>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {placeDetails.opening_hours.weekday_text.map((day, i) => (
                                                <li key={i}>{day}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Reviews */}
                            {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Reviews</h3>
                                    <div className="space-y-4">
                                        {placeDetails.reviews.slice(0, 5).map((review, i) => (
                                            <div key={i} className="bg-gray-50 p-4 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs mr-3">
                                                            {review.profile_photo_url ? (
                                                                <img
                                                                    src={review.profile_photo_url}
                                                                    alt={review.author_name}
                                                                    className="w-8 h-8 rounded-full"
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                            ) : (
                                                                <User className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-gray-900 text-sm">{review.author_name}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                                        <span className="text-sm font-bold text-gray-700">{review.rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
                                                <p className="text-gray-400 text-xs mt-2">{review.relative_time_description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
