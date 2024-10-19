import axios from "axios"

export async function generateAccessToken() {
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    })             
    return response.data.access_token 
}
export const createPayPalOrder = async (selectedPackage,currency) => {
    const accessToken = await generateAccessToken()

    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    items: [
                        {
                            name: selectedPackage.name, // Use package name
                            description: selectedPackage.description, // Use package description
                            quantity: 1,
                            unit_amount: {
                                currency_code: currency,
                                value: selectedPackage.priceUSD.toFixed(2) // Format price as needed
                            }
                        }
                    ],
                    amount: {
                        currency_code: currency,
                        value: selectedPackage.priceUSD.toFixed(2), // Total amount
                        breakdown: {
                            item_total: {
                                currency_code: currency,
                                value: selectedPackage.priceUSD.toFixed(2) // Item total
                            }
                        } 
                    }
                }
            ],
            application_context: {
                return_url: process.env.BASE_URL + '/callback/complete-order-usd',
                cancel_url: process.env.BASE_URL + '/api/packages/cancel-order',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'manfra.io'
            } 
        })
    })

    return response
}
export const capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken()

    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    })

    return response.data
}

