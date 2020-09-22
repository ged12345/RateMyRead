import axios from 'axios';

/* Usually, we wouldn't share this publicly but with *this* key it's definitely
 supposed to be used publicly. We've enabled restricted access in the Google // API though. */
const KEY = 'RnrAsOzR76ogqVctJlYyug';

// We do this because you can't config the params twice/in part now, you need to do it once in the call via axios.
export const baseParams = {
  format: 'xml',
  key: KEY,
};

export default axios.create({
  baseURL: 'https://www.goodreads.com/search',
});
