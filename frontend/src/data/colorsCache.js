import axios from 'axios';

export const COLOR_MAP = {
  'Black': '#1a1a1a',
  'White': '#f5f5f5',
  'Grey': '#9e9e9e',
  'Gray': '#9e9e9e',
  'Navy': '#1b2a4a',
  'Beige': '#d4b896',
  'Brown': '#7b4f2e',
  'Red': '#d32f2f',
  'Blue': '#1976d2',
  'Green': '#388e3c',
  'Yellow': '#fbc02d',
  'Orange': '#F1642E',
  'Pink': '#e91e8c',
  'Purple': '#7b1fa2',
  'Khaki green': '#8b9b5e',
  'Khaki': '#c3b091',
  'Light blue': '#90caf9',
  'Dark blue': '#0d1b4b',
  'Turquoise': '#00bcd4',
  'Silver': '#c0c0c0',
  'Gold': '#ffd700',
  'Coral': '#ff6b6b',
  'Mint': '#98d8c8',
  'Lilac': '#c8a2c8',
  'Camel': '#c19a6b',
  'Olive': '#6b7c2e',
  'Burgundy': '#800020',
  'Tan': '#d2b48c',
  'Cream': '#fffdd0',
  'Mustard': '#ffdb58',
  'Teal': '#008080',
  'Rust': '#b7410e',
  'Lavender': '#b57edc',
  'Peach': '#ffcba4',
};

function extractColors(products) {
  const seen = new Set();
  const result = [];
  for (const p of products) {
    const name = p.color;
    if (name && !seen.has(name) && COLOR_MAP[name]) {
      seen.add(name);
      result.push({ name, hex: COLOR_MAP[name], border: name === 'White' || name === 'Cream' });
    }
  }
  return result;
}

let cachedColors = [];
let fetchPromise = null;

export function prefetchColors() {
  if (fetchPromise) return fetchPromise;
  fetchPromise = axios.get('/api/store/products/?page_size=500')
    .then(res => {
      cachedColors = extractColors(res.data.results ?? res.data);
      return cachedColors;
    })
    .catch(() => []);
  return fetchPromise;
}

export function getCachedColors() {
  return cachedColors;
}
