// src/lib/device.ts
// Utility to generate a persistent device fingerprint and friendly name for device binding

export interface DeviceInfo {
  deviceFingerprint: string;
  deviceName: string;
}

export function getClientDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceFingerprint: 'server_dummy_fingerprint',
      deviceName: 'Unknown Server Environment',
    };
  }

  const STORAGE_KEY = 'examhub_device_fingerprint';
  let fingerprint = localStorage.getItem(STORAGE_KEY);

  if (!fingerprint) {
    // Generate a unique persistent ID
    const randomPart = Math.random().toString(36).substring(2, 12);
    const timePart = Date.now().toString(36);
    fingerprint = `dev_${timePart}_${randomPart}`;
    try {
      localStorage.setItem(STORAGE_KEY, fingerprint);
    } catch {
      // ignore quota or storage blocked errors
    }
  }

  // Parse friendly browser & OS name
  const userAgent = navigator.userAgent || '';
  let os = 'Unknown OS';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  let browser = 'Browser';
  if (/edg/i.test(userAgent)) browser = 'Edge';
  else if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent)) browser = 'Safari';

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  const deviceName = `${browser} on ${os} (${deviceType})`;

  return {
    deviceFingerprint: fingerprint,
    deviceName,
  };
}
