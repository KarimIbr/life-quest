export const convertToDirectImageUrl = (url: string): string => {
  try {
    // Handle Imgur URLs
    if (url.includes('imgur.com')) {
      // Remove any file extension from the URL first
      url = url.replace(/\.[^/.]+$/, '');
      
      // Extract the ID from various Imgur URL formats
      let id;
      if (url.includes('/a/') || url.includes('/gallery/')) {
        // Handle album/gallery URLs
        id = url.split('/').pop();
      } else {
        // Handle direct image URLs
        id = url.split('/').pop();
      }
      
      if (id) {
        return `https://i.imgur.com/${id}.jpg`;
      }
    }

    // Handle Pinterest URLs
    if (url.includes('pinterest.com')) {
      // Convert to direct pinimg.com URL if not already
      if (!url.includes('pinimg.com')) {
        const matches = url.match(/\/pin\/(\d+)/);
        if (matches && matches[1]) {
          return `https://i.pinimg.com/originals/${matches[1]}.jpg`;
        }
      }
    }

    // Handle direct pinimg.com URLs
    if (url.includes('pinimg.com')) {
      // For direct pinimg.com URLs, just keep the URL as is
      // Pinterest's CDN handles the image quality automatically
      return url;
    }

    return url;
  } catch (error) {
    console.error('Error converting URL:', error);
    return url;
  }
};

export const validateImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}; 