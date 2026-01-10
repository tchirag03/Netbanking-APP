import React, { useEffect } from 'react';
import { useCameraStream } from '../../hooks/useCameraStream';

export const BiometricViewport = () => {
    const { videoRef, startCamera, stopCamera } = useCameraStream();

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    return (
        <div className="relative w-64 h-64 mx-auto">
            <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-appleWhite">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Laser scanning animation */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-appleWhite to-transparent animate-scan opacity-50" />
            </div>
        </div>
    );
};
