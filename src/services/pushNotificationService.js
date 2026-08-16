import api from './api';

export async function subscribeToPushNotifications(shopId, subscription) {
  if (!shopId || !subscription) return null;

  const subJson = subscription.toJSON();
  const payload = {
    endpoint: subscription.endpoint,
    p256dh: subJson.keys?.p256dh,
    auth: subJson.keys?.auth,
  };

  const response = await api.post(`/notifications/push/subscribe?shopId=${shopId}`, payload);
  return response.data;
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}
