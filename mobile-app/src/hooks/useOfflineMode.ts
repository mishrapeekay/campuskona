import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useOfflineMode = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [isConnectionExpensive, setIsConnectionExpensive] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOffline(state.isConnected === false); // explicit check for false
            setIsConnectionExpensive(state.details && 'isConnectionExpensive' in state.details
                ? (state.details.isConnectionExpensive as boolean)
                : false
            );
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return {
        isOffline,
        isConnectionExpensive,
        isOnline: !isOffline
    };
};

export default useOfflineMode;
