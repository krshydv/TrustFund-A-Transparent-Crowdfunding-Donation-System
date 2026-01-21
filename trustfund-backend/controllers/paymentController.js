const User = require('../models/User'); // <--- IMPORT THIS AT THE TOP
const Transaction = require('../models/Transaction');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

exports.processMockPayment = async (req, res) => {
  try {
    const { amount, campaignId, cardNumber } = req.body;

  
    await new Promise(resolve => setTimeout(resolve, 1500));

   
    const fakeTxnId = "mock_" + Math.random().toString(36).substring(7);
 
    let donorName = "Valued Donor";
    if (req.user.firstName) donorName = `${req.user.firstName} ${req.user.lastName}`;

    
    const transaction = await Transaction.create({
      donation: null,
      paymentProvider: 'mock_gateway',
      transactionId: fakeTxnId,
      amount: amount,
      status: 'succeeded',
      currency: 'INR',
      metadata: { demoMode: true }
    });

    const donation = await Donation.create({
      donor: req.user.id,
      campaign: campaignId,
      amount: amount,
      donorName: donorName,
      donorEmail: req.user.email,
      status: 'completed',
      transactionId: transaction._id
    });

    transaction.donation = donation._id;
    await transaction.save();

  
    await Campaign.findByIdAndUpdate(campaignId, { 
        $inc: { currentAmount: amount, donorCount: 1 } 
    });

    
    await User.findByIdAndUpdate(req.user.id, {
        $inc: { totalDonated: amount, donationCount: 1 }
    });

    res.status(200).json({ success: true, message: "Payment Successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Payment Failed" });
  }
};