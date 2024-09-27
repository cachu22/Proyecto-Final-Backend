const config = {
    apiUrl: process.env.NODE_ENV === 'production'
      ? 'https://proyecto-final-backend-z3fv.onrender.com'
      : 'http://127.0.0.1:8000'
  };
  
  export default config;