export const environment = {
    production: true,
    // Point to Vercel Proxy (resolves Mixed Content Issue)
    apiUrl: '/api',
    cryptoKey: 'your-crypto-key', // Ensure this matches logic or remove if handled server-side
    useNgrok: false
};
