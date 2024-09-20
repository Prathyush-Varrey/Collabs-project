const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();  // Ensure this is properly set up

const JWT_SECRET = process.env.JWT_SECRET;  // This must match the secret used during login

function auth(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];  // Extract token after "Bearer"
     
     
     if (!token) {
         return res.status(401).send({ message: 'Access Denied. No Token Provided.' });
     }

     try {
          const response = jwt.verify(token, JWT_SECRET);

         req.user = response;  // Attach the decoded user data to req
         next();
     } catch (error) {
         res.status(403).send({ message: `Invalid Credentials: ${error.message}` });
     }
}

module.exports = { auth, JWT_SECRET };
