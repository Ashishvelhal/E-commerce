import api from './api';

export interface IpWhoIsResponse {
  ip?: string;
  success?: boolean;
  type?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  flag?: {
    img?: string;
    emoji?: string;
  };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    current_time?: string;
  };
}

/**
 * Queries https://ipwho.is/ and records admin access or login attempts in backend MongoDB
 */
export const recordAdminAccess = async (
  action: 'Navbar Admin Click' | 'Login Attempt' | 'Login Success' | 'Login Failed' | string,
  attemptedEmail?: string
): Promise<void> => {
  try {
    // 1. Query ipwho.is with a fast 3.5s timeout so UI is never blocked
    let geoData: IpWhoIsResponse | null = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://ipwho.is/', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        geoData = await res.json();
      }
    } catch (geoErr) {
      console.warn('⚠️ ipwho.is lookup timed out or failed (using fallback info):', geoErr);
    }

    // 2. Prepare payload
    const payload = {
      ip: geoData?.ip || '',
      city: geoData?.city || 'Unknown City',
      region: geoData?.region || 'Unknown Region',
      country: geoData?.country || 'Unknown Country',
      countryCode: geoData?.country_code || '',
      flag: {
        img: geoData?.flag?.img || '',
        emoji: geoData?.flag?.emoji || '🌐',
      },
      latitude: geoData?.latitude || null,
      longitude: geoData?.longitude || null,
      isp: geoData?.connection?.isp || geoData?.connection?.org || 'Unknown ISP',
      org: geoData?.connection?.org || '',
      asn: geoData?.connection?.asn ? String(geoData.connection.asn) : '',
      timezone: geoData?.timezone?.id || '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenResolution:
        typeof window !== 'undefined'
          ? `${window.screen?.width || 0}x${window.screen?.height || 0}`
          : '',
      attemptedEmail: attemptedEmail || '',
      action,
    };

    // 3. Post to backend endpoint using Axios instance
    await api.post('/analytics/admin-access-log', payload, {
      timeout: 4000,
    });
  } catch (err) {
    // Silent fail so customer experience is unaffected
    console.debug('Admin access logging silent note:', err);
  }
};
