import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import connectDB from './db/connectDB.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './strategies/google.strategy.js'
import './strategies/local.strategy.js'
import userRoutes from "./routes/user.route.js";
import categoryRoutes from "./routes/categories.route.js"
import packageRoutes from './routes/packageRoutes.js'; // Import the package routes
import { googleAuthHandler } from './controllers/auth.controller.js';

const app = express();

dotenv.config()
app.use(express.json());

app.use(cookieParser());  
// Initialize Passport
app.use(passport.initialize());

// If you're using sessions, include this middleware as well
app.use(session({
  secret: process.env.SESSION_SECRET,  // Use a secret key for session encryption
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.session());

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["https://ethio-earning.vercel.app", "http://localhost:3000"],  // Replace with your frontend URL
    credentials: true, // This allows credentials to be sent
  })
);

app.get('/',(req,res)=>{
    res.send("hello")
})

app.use("/api/users", userRoutes);
// Use the category routes
app.use('/api/categories', categoryRoutes);
// Use the package routes
app.use('/api/packages', packageRoutes);

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),googleAuthHandler);
connectDB() 

app.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`); 
});   