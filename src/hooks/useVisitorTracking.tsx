import { useEffect } from 'react';

interface TrackingData {
  page_visited: string;
  referrer?: string;
  user_location?: {
    ip?: string;
    city?: string;
    country?: string;
  };
  screen_resolution?: string;
  language?: string;
  time_on_page?: number;
}

const useVisitorTracking = (pageName: string) => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Get user location and other data
        const trackingData: TrackingData = {
          page_visited: pageName,
          referrer: document.referrer || 'Direct',
          screen_resolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
        };

        // Try to get user location (optional)
        try {
          const locationResponse = await fetch('https://ipapi.co/json/');
          if (locationResponse.ok) {
            const locationData = await locationResponse.json();
            trackingData.user_location = {
              ip: locationData.ip,
              city: locationData.city,
              country: locationData.country_name,
            };
          }
        } catch (locationError) {
          console.log('Could not get location data:', locationError);
        }

        // Send tracking data
        const response = await fetch('https://spadadibattaglia.com/mom/api/track_visitors.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingData),
        });

        const result = await response.json();
        if (result.status === 'success') {
          console.log('Visitor tracked successfully');
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    // Track visitor after a short delay to ensure page is loaded
    const timeoutId = setTimeout(trackVisitor, 1000);

    // Track time on page
    const startTime = Date.now();
    const handleBeforeUnload = async () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      try {
        await fetch('https://spadadibattaglia.com/mom/api/track_visitors.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page_visited: pageName,
            time_on_page: timeOnPage,
          }),
          keepalive: true,
        });
      } catch (error) {
        console.error('Error updating time on page:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pageName]);
};

export default useVisitorTracking;