import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState<boolean>(() =>
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();
  const isTopLevel = typeof window !== 'undefined' && window.top === window.self;
  const isSecure = typeof window !== 'undefined' && (window as any).isSecureContext === true;
  const openEnableInNewTab = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/profile?enablePush=1`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Check if user already has a subscription
      if (user && Notification.permission === 'granted') {
        checkExistingSubscription();
      }
    } else {
      setIsSupported(false);
    }

    // If opened via ?enablePush=1, auto-trigger the permission flow and then clean the URL
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('enablePush') === '1') {
        if (isSecure && isTopLevel) {
          setTimeout(() => {
            requestPermission();
          }, 0);
        }
        params.delete('enablePush');
        const newUrl =
          window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    } catch (_) {
      // no-op
    }
  }, [user, isSecure, isTopLevel]);

  const checkExistingSubscription = async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      // Some browsers may not expose PushManager
      // Guard before attempting to read existing subscription
      // @ts-ignore - pushManager may be undefined in some engines
      const pushMgr = (registration as any).pushManager;
      if (registration && pushMgr) {
        const existingSubscription = await pushMgr.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
        }
      }
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notifications are not available in this view.');
      if (!isTopLevel || !isSecure) openEnableInNewTab();
      return false;
    }

    try {
      if (!isSecure) {
        toast.error('Notifications require a secure (HTTPS) context.');
        openEnableInNewTab();
        return false;
      }
      if (!isTopLevel) {
        toast.message('Opening a new tab to enable notifications...');
        openEnableInNewTab();
        return false;
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToPush();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported || !user) return;

    try {
      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      }
      await navigator.serviceWorker.ready;
      
      // Ensure proper context and Push API availability
      if (!isSecure || !isTopLevel) {
        toast.error('Push cannot be enabled inside an embedded or insecure view. Opening a new tab to finish setup...');
        openEnableInNewTab();
        return;
      }
      if (!('PushManager' in window) || !registration.pushManager) {
        toast.error('Web Push is unavailable here. Opening a new tab to finish setup...');
        openEnableInNewTab();
        return;
      }
      // VAPID key for testing (replace with proper key in production)
      const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI6DjbYm6WMIbHrcpXD2pfU1U1FMrKNjN5M8VdrJg1JH6FvhsU3uEwxdOo';
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      setSubscription(subscription);

      // Save subscription to database
      const subscriptionData = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving subscription:', error);
        toast.error('Failed to enable notifications');
      } else {
        toast.success('Push notifications enabled! You\'ll receive gentle reminders 3 times a day.');
        console.log('Push subscription saved successfully');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      if (error instanceof Error) {
        if (error.name === 'NotSupportedError') {
          toast.error('Push notifications are not supported in this browser');
        } else if (error.name === 'NotAllowedError') {
          toast.error('Push notifications permission denied');
        } else {
          toast.error('Failed to enable notifications');
        }
      }
    }
  };

  const unsubscribe = async () => {
    if (!subscription || !user) return;

    try {
      await subscription.unsubscribe();
      
      // Remove from database
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('Error removing subscription:', error);
      }

      setSubscription(null);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to disable notifications');
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    unsubscribe,
    // Helpful context for UI handling
    isTopLevel,
    isSecure,
    openEnableInNewTab,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}