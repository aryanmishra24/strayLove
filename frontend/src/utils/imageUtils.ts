/**
 * Constructs a full image URL from a relative URL returned by the backend
 * @param relativeUrl - The relative URL from the backend (e.g., "/api/v1/images/filename.jpg")
 * @returns The full URL that can be used in img src attributes
 */
export const getFullImageUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  
  // If it's already a full URL, return as is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // Get the base URL from environment or default to localhost
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  
  // Remove the /api/v1 part from baseUrl since the relative URL already includes it
  const cleanBaseUrl = baseUrl.replace('/api/v1', '');
  
  // Ensure the relative URL starts with a slash
  const cleanRelativeUrl = relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl;
  
  return cleanBaseUrl + cleanRelativeUrl;
};

/**
 * Processes an array of image URLs to ensure they are all full URLs
 * @param imageUrls - Array of image URLs (can be relative or absolute)
 * @returns Array of full image URLs
 */
export const processImageUrls = (imageUrls: string[]): string[] => {
  if (!imageUrls || !Array.isArray(imageUrls)) return [];
  
  return imageUrls.map(url => getFullImageUrl(url));
}; 