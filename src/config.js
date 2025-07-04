const config = {
    development: {
        apiUrl: 'http://localhost:5000'
    },
    production: {
        apiUrl: 'https://zen-pdf-backend-izaa.onrender.com'  // Your Render backend URL
    }
};

export default config[process.env.NODE_ENV || 'development']; 