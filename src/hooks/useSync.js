import { useEffect } from 'react';
import { syncPendingActions } from '../services/salesOfflineService';

export function useAutoSync() {
    useEffect(() => {
        const handleOnline = () => {
            console.log('Connexion rétablie, synchronisation...');
            syncPendingActions();
        };

        window.addEventListener('online', handleOnline);

        const interval = setInterval(() => {
            if (navigator.onLine) syncPendingActions();
        }, 120000);

        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(interval);
        };
    }, []);
}