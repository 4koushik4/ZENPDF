const config = {
    development: {
        apiUrl: 'http://localhost:5000'
    },
    production: {
        apiUrl: 'https://zen-pdf-backend.onrender.com'  // Replace with your Render backend URL
    }
};

export default config[process.env.NODE_ENV || 'development']; 