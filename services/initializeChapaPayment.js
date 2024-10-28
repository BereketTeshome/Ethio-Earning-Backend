// services/initializePayment.js

// Import your Chapa library or SDK
import Chapa from 'chapa'; // Ensure the Chapa package is installed and properly imported
const myChapa = new Chapa(process.env.Chapa_Secret_Key); 
 

/**
 * Initializes a payment with Chapa
 * @param {Object} user - User object containing email and name
 * @param {Number} amount - The amount to be deposited
 * @param {String} [currency='ETB'] - Currency type (defaults to 'ETB')
 * @returns {Promise} - Returns a promise with the Chapa payment initialization response
 */
export const initializeChapaPayment = async (user, amount, transactionType = 'deposit',currency = 'ETB') => {
    try {
        const customerInfo = {
            amount: amount,
            currency: currency,
            email: user.email,
            first_name: user.name.split(" ")[0] || 'First Name',
            last_name: user.name.split(" ")[1] || 'Last Name',
            callback_url: process.env.Chapa_CallBack_URL + '/payment/callback', // Replace with your actual callback URL
            customization: {
                title: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} ${currency}`,
                description: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} of ${currency} ${amount}` 
            } 
        };  
          
        // Initialize payment with Chapa
        const chapaResponse = await myChapa.initialize(customerInfo, { autoRef: true });
        return chapaResponse;
    } catch (error) {
        console.error('Error initializing Chapa payment:', error);
        throw error;
    }
}; 


