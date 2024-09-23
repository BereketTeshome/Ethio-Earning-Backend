import express from 'express';
import PurchasedPackage from '../models/purchasedPackage.model'; // Your PurchasedPackage model
import Transaction from '../models/transaction.model'; // Your Transaction model
import Package from '../models/package.model'; // Your Package model
import User from '../models/user.model'; // Your User model
import Chapa from 'chapa'; // Import Chapa SDK


const router = express.Router();


const myChapa = new Chapa()


