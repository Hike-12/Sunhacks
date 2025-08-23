const fetch = require('node-fetch');

const UNSPLASH_API_URL = 'https://api.unsplash.com';

const getImageForKeyword = async (keyword) => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(keyword)}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
};

module.exports = {
  getImageForKeyword
};