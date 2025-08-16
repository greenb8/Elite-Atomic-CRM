import { useEffect, useState } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as
    | string
    | undefined;
const SCRIPT_ID = 'google-maps-script';

export const useGoogleMapsScript = (): boolean => {
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).google?.maps) {
            setLoaded(true);
            return;
        }

        const existing = document.getElementById(
            SCRIPT_ID
        ) as HTMLScriptElement | null;
        if (existing) {
            const onLoad = () => setLoaded(true);
            existing.addEventListener('load', onLoad);
            return () => existing.removeEventListener('load', onLoad);
        }

        if (!GOOGLE_MAPS_API_KEY) {
            // Fail silently; component using the hook can decide what to render
            return;
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);

        return () => {
            // keep script for subsequent mounts; no cleanup
        };
    }, []);

    return loaded;
};
