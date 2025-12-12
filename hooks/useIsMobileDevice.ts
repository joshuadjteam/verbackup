
import { useState, useEffect } from 'react';

const useIsMobileDevice = (): boolean => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
        const mobile = Boolean(
            /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
        );
        setIsMobile(mobile);
    }, []);

    return isMobile;
};

export default useIsMobileDevice;
