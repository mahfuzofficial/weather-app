WeatherWise App (MERN)------------------------------------------------------------------------------------------------------------------------------------
This is a comprehensive weather application project I built to deepen my understanding of full-stack development. It allows users to log in, search for current weather by city, save cities to their profile, and view 5-day forecasts for saved locations. The application demonstrates dynamic data fetching, user authentication, and responsive design.


Project Description-------------------------------------------------------------------------------------------------------------------------------------
WeatherWise is a fully functional weather information manager built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. Key features include:
User Authentication: Secure user registration and login using JWT.
Current Weather Search: Users can search for and view current weather conditions for any city globally.
Saved Cities: Authenticated users can save cities to their profile for quick access.
5-Day Forecast: View detailed 5-day weather forecasts for saved cities.
Dynamic Data Fetching: Integrates with a third-party weather API (e.g., OpenWeatherMap) to fetch real-time weather data.
Responsive Design: Optimized for various screen sizes.
It uses MongoDB Atlas to store user data and saved city preferences, with protected routes for user-specific actions.


GitHub Repository------------------------------------------------------------------------------------------------------------------------------------------
WeatherWise: https://github.com/mahfuzofficial/weather-app


Live Links-------------------------------------------------------------------------------------------------------------------------------------------------
Frontend (React + Vercel): https://weather-app-iota-lemon-96.vercel.app
Backend (Express + Render): https://weather-app-n9h4.onrender.com


Technologies Used--------------------------------------------------------------------------------------------------------------------------------------------
* Frontend
React.js: For building the dynamic user interface.
React Router DOM: For handling client-side routing between pages (Login, Current Weather, Saved Cities).
Context API: For global state management (e.g., authentication status).
Axios: For making HTTP requests to the backend API.
CSS (custom styling): For styling the application, including responsive design.
Vercel: For deploying the frontend online.

* Backend
Node.js: Server-side JavaScript runtime.
Express.js: Web application framework for building RESTful APIs.
MongoDB Atlas: Cloud-hosted NoSQL database for storing user accounts and saved city data.
Mongoose: ODM (Object Data Modeling) library for MongoDB and Node.js.
JWT (JSON Web Token): For secure user authentication and authorization.
Bcrypt.js: For securely hashing user passwords.
Dotenv: For loading environment variables from a .env file.
CORS: To enable cross-origin communication between the frontend and backend.
Axios: For backend to fetch data from external weather APIs (if applicable).
Render: For deploying the backend API online.
Other Tools
VS Code: Primary code editor.
Git + GitHub: For version control and code hosting.


Setup Instructions for Running Frontend and Backend Locally--------------------------------------------------------------------------------------
This project consists of two independent parts — a React frontend and a Node.js backend — both need to run concurrently for the application to function.

Project Folder Structure (Example)
weatherwise/
 ├── client/   # React (frontend) 
 └── server/   # Node.js (backend)

Step 1: Clone the Repository
Open your terminal and run:
git clone https://github.com/mahfuzofficial/weather-app
cd weatherwise-mern

Step 2: Install Dependencies
Backend Dependencies (in ./server folder)
cd server
npm install

This installs:
express – for building the server and API routes
mongoose – to connect with MongoDB Atlas
dotenv – for loading environment variables from .env
cors – to allow frontend/backend communication
jsonwebtoken – for generating and verifying login tokens
bcryptjs – for password hashing
nodemon (dev only) – for automatic server restarts during development
Frontend Dependencies (in ./client folder)

Open a second terminal window:
cd client
npm install

This installs:
react – the frontend UI framework
react-router-dom – for client-side navigation
axios – for making HTTP requests to your backend and external weather API
Context API related packages (if any, otherwise built-in React features)

Step 3: Setup .env files
For Backend (inside ./server folder)
Create a file named .env in your server/ directory with the following content:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_jwt_key
OPENWEATHER_API_KEY=your_openweather_api_key

Make sure:
MONGO_URI is copied from MongoDB Atlas → Database → Connect → Drivers.
JWT_SECRET is any random strong string (e.g., supersecretkey123).
OPENWEATHER_API_KEY is your API key obtained from OpenWeatherMap (or whichever external weather API you use).

For Frontend (inside ./client folder)
Create a file named .env in your client/ directory with the following content:
REACT_APP_API_BASE_URL=http://localhost:5000/api

Make sure:
REACT_APP_API_BASE_URL points to your local backend server's API base.
Remember that all custom React environment variables must be prefixed with REACT_APP_.

Step 4: Start the Servers
Start Backend
In your first terminal (inside server/):
npm run dev

You should see output similar to:
Server is running on port 5000
MongoDB connected successfully!

Start Frontend
In your second terminal (inside client/):
npm start

Your browser should automatically open http://localhost:3000.

App Running Locally:
    
      Part                     URL              

    Frontend            http://localhost:3000
    Backend             http://localhost:5000



Challenges Faced & How I Solved Them------------------------------------------------------------------------------------------------------------------------------
Throughout the development of WeatherWise, I encountered several common full-stack development challenges, which provided significant learning opportunities:

CORS (Cross-Origin Resource Sharing) Issues in Deployment:
    Challenge: When deploying the frontend to Vercel and the backend to Render, I frequently faced "Access-Control-Allow-Origin" errors, preventing the frontend from fetching data.
    Solution: This was consistently resolved by ensuring the backend's cors middleware was correctly configured to include the exact URL of the deployed frontend (e.g., https://weather-app-iota-lemon-96.vercel.app) in its origin array in server.js. Crucially, this change required a successful redeployment of the backend on Render to take effect.

Environment Variable Mismatch (Frontend Deployment):
    Challenge: My Vercel-deployed frontend failed to fetch data, even after seemingly correct API_BASE_URL setup.
    Solution: I discovered a typo in the environment variable name on Vercel (T_APP_API_BASE_URL instead of REACT_APP_API_BASE_URL). React applications built with Create React App require environment variables to be prefixed with REACT_APP_. Correcting the variable name on Vercel and triggering a new frontend deployment resolved the issue.

"Could not load saved cities. Please try again." / 401 Unauthorized:
    Challenge: Even with CORS potentially fixed, the frontend showed "Could not load saved cities" and browser console revealed 401 Unauthorized errors.
    Solution: This indicated that while the connection to the backend was made, the backend was rejecting the request due to missing or invalid authentication tokens. The fix involved ensuring the user was properly logged in, and that the frontend's Axios requests to protected routes were consistently including the JWT token in the Authorization: Bearer <token> header, usually retrieved from localStorage after login.

Backend Not Responding / ERR_CONNECTION_REFUSED:
    Challenge: Sometimes the frontend would show a connection refused error, indicating the backend was completely unreachable.
    Solution: The primary solution was to diligently check the Render dashboard for the backend service. This usually meant the backend service was not running, had crashed, or was stuck in a deployment state. Restarting or redeploying the backend on Render, and checking its logs for startup errors, always resolved this.

API Key Management:
    Challenge: Directly embedding API keys for services like OpenWeatherMap in the frontend is insecure and can lead to exposure.
    Solution: All sensitive API keys were moved to the backend's .env file, and API calls to external services were made from the backend. The frontend only communicates with my Express backend, which then securely handles calls to third-party APIs.

These were valuable real-world problems that significantly contributed to my full-stack development learning.

Screenshots-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    Login&SignupPage.png
    Homepage.png
    SavedCitiesList.png
    SavedCities5daysForecast.png


Test Credentials--------------------------------------------------------------------------------------------------------------------------------------------------------------------
To test the application, you can use the following credentials:

Email: testuser@email.com
Password: user1234

