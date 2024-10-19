import PurchasedPackage from '../models/purchasedPackage.model.js'; // Your PurchasedPackage model
import Subscription from '../models/subscription.model.js'

export const SubscribePackage = async(req,res)=>{
    const { packageId, screenshotUrl, viewConfirmation } = req.body;
    try {
        const earnerId = req.user._id;
    
        const purchasedPackage = await PurchasedPackage.findById(packageId);
        if (!purchasedPackage) {
          return res.status(404).json({ message: 'Package not found.' });
        }
    
        const newSubscription = new Subscription({
          earner: earnerId,
          investor: purchasedPackage.investor, // Assuming investor is linked to the purchased package
          package: packageId,
          screenshotUrl,
          viewConfirmation,
          viewed: !!viewConfirmation, // Assume 'viewed' is true if viewConfirmation is provided
        });
    
        await newSubscription.save();
        res.status(201).json({ message: 'Subscription added successfully.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding subscription.' });
      }
}