import axios from 'axios';

/* Usually, we wouldn't share this publicly but with *this* key it's definitely
 supposed to be used publicly. We've enabled restricted access in the Google // API though. */
const KEY = 'RnrAsOzR76ogqVctJlYyug';

// We do this because you can't config the params twice/in part now, you need to do it once in the call via axios.
export const baseAPIParams = {
  format: 'xml',
  key: KEY,
};

export const searchGoodreads = async (term) => {
  const response = await goodreadsAPI.get('', {
    params: {
      q: term,
      ...baseAPIParams,
    },
  });

  return response;
};

export const goodreadsAPI = axios.create({
  baseURL: 'https://www.goodreads.com/search',
});
