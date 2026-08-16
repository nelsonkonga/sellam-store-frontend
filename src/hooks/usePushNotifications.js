import { useEffect, useState, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import { subscribeToPushNotifications, urlBase64ToUint8Array } from '../services/pushNotificationService';
import api from '../services/api';

export function usePushNotifications() {
  const { selectedShopId } = useShop();
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const requestPermissionAndSubscribe = useCallback(async () => {
    if (!selectedShopId || !('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[Push] Not supported or no shopId');
      return { ok: false, reason: 'not-supported' };
    }

    try {
      setIsSubscribing(true);

      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);
      console.log('[Push] Permission:', currentPermission);

      if (currentPermission !== 'granted') {
        setIsSubscribing(false);
        return { ok: false, reason: 'denied' };
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('[Push] ServiceWorker ready, scope:', registration.scope);

      // Récupère la clé publique VAPID depuis le backend
      const { data } = await api.get('/notifications/push/vapid-key');
      const publicKey = data.publicKey;
      console.log('[Push] VAPID public key:', publicKey ? publicKey.substring(0, 20) + '...' : 'MISSING');

      if (!publicKey) {
        setIsSubscribing(false);
        return { ok: false, reason: 'missing-vapid' };
      }

      // Désabonne d'abord l'ancienne souscription pour forcer un refresh des clés
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        console.log('[Push] Existing subscription found, unsubscribing to refresh keys...');
        await existingSub.unsubscribe();
      }

      // Crée une nouvelle souscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Vérifie que les clés sont bien présentes
      const subJson = subscription.toJSON();
      console.log('[Push] New subscription created:');
      console.log('[Push]   endpoint:', subscription.endpoint.substring(0, 60) + '...');
      console.log('[Push]   p256dh:', subJson.keys?.p256dh ? subJson.keys.p256dh.substring(0, 20) + '...' : 'MISSING');
      console.log('[Push]   auth:', subJson.keys?.auth ? subJson.keys.auth.substring(0, 10) + '...' : 'MISSING');

      if (!subJson.keys?.p256dh || !subJson.keys?.auth) {
        console.error('[Push] CRITICAL: Subscription keys are missing!');
        setIsSubscribing(false);
        return { ok: false, reason: 'missing-keys' };
      }

      // Envoie au backend
      const result = await subscribeToPushNotifications(selectedShopId, subscription);
      console.log('[Push] Backend response:', result);

      setIsSubscribing(false);
      return { ok: true };
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      setIsSubscribing(false);
      return { ok: false, reason: 'failed' };
    }
  }, [selectedShopId]);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);
    
    // Auto-subscribe if already granted but maybe not registered in DB
    if (Notification.permission === 'granted' && selectedShopId) {
      requestPermissionAndSubscribe();
    }
  }, [selectedShopId, requestPermissionAndSubscribe]);

  return { permission, isSupported, isSubscribing, requestPermissionAndSubscribe };
}
