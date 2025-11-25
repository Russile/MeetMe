import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, MessageSquare, Check } from 'lucide-react';

interface ShareButtonProps {
    place: google.maps.places.PlaceResult;
}

export function ShareButton({ place }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getShareText = () => {
        const address = place.vicinity || place.formatted_address || '';
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + address)}`;
        return `Let's meet at ${place.name}!\n${address}\n${mapsUrl}`;
    };

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(getShareText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setIsOpen(false);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleNativeShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareData = {
            title: `Meet at ${place.name}`,
            text: getShareText(),
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                setIsOpen(false);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback to copy if native share fails/unsupported
            handleCopy(e);
        }
    };

    const handleSMS = (e: React.MouseEvent) => {
        e.stopPropagation();
        const body = encodeURIComponent(getShareText());
        window.location.href = `sms:?body=${body}`;
        setIsOpen(false);
    };

    // Check if share API is supported to conditionally render the button
    // We use a type guard or just check it safely to avoid TS errors about it being always defined
    const isShareSupported = typeof navigator.share === 'function';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="w-full flex items-center justify-center px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                title="Share"
            >
                <Share2 className="w-3 h-3 mr-1" />
                Share
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in duration-200 origin-bottom-right">
                    <div className="py-1">
                        <button
                            onClick={handleCopy}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>

                        {isShareSupported && (
                            <button
                                onClick={handleNativeShare}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share via...
                            </button>
                        )}

                        <button
                            onClick={handleSMS}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center transition-colors"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Text
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
