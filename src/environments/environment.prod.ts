export const environment = {
    production: true,
    // Point to the VPS IP (Backend via Nginx)
    apiUrl: 'http://35.239.137.125/api',
    cryptoKey: 'your-crypto-key', // Ensure this matches logic or remove if handled server-side
    useNgrok: false
};
