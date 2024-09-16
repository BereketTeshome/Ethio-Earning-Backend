import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import connectDB from './db/connectDB.js';
import session from 'express-session';
import passport from 'passport';
import './strategies/google.strategy.js'
import './strategies/local.strategy.js'
import userRouter from "./routes/user.route.js";
import { googleAuthHandler } from './controllers/auth.controller.js';
const app = express();

dotenv.config()
app.use(express.json());
 
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

app.use(cors()) 

app.get('/',(req,res)=>{
    res.send("hello")
})

app.use("/api/users", userRouter);
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),googleAuthHandler);
connectDB() 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});   