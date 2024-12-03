import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to manage page titles
 * @param title - The title to set for the page
 * @param description - Optional meta description to update
 */
export function useTitle(title: string, description?: string) {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = `${title} | Recovery Directory`;
    
    // Update meta description if provided
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Recovery Directory';
      if (description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', 'Find trusted rehabilitation centers and treatment facilities.');
        }
      }
    };
  }, [title, description, location.pathname]); // Re-run when pathname changes
}
