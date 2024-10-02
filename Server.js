import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import dotenv from "dotenv";
import fs from 'fs';
import https from 'https';
import Auth from "./routers/Auth.router.js";
import Users from "./routers/Users.router.js";
import Admin from "./routers/admin.router.js";
import Seller from './routers/seller.router.js';

const app = express(); // Tell server type is express

dotenv.config();

// Connect to MongoDB
try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("The BookIt database is connected");
} catch (error) {
    console.log("Failed to connect to the BookIt database", error);
}

// Allowed origins
const allowedOrigins = ["http://localhost:60477", "http://localhost:5173"];

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Allow credentials (e.g., cookies, authorization headers)
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", Auth);
app.use("/api/Users", Users);
app.use("/api/Admin/Actions/", Admin);
app.use("/api/seller/actions", Seller);

// Read the SSL certificate and key files
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start HTTPS server
httpsServer.listen(4488, () => {
    console.log("The backend server is running on HTTPS (zay el fool ya bashaaa)!");
});

// Optionally redirect HTTP to HTTPS
const http = express();

http.get('*', (req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
});

http.listen(80, () => {
    console.log('HTTP Server running on port 80 and redirecting to HTTPS');
});
