const PROD_URL = 'https://guineaday.onrender.com';
const DEV_URL = 'http://localhost:8000';

export const API_URL = import.meta.env.PROD ? PROD_URL : DEV_URL;
