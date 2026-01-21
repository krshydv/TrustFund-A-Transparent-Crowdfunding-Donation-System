
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const Transaction = require('../models/Transaction');
const Receipt = require('../models/Receipt');
const User = require('../models/User');

exports.createDonation = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    // Check if campaign exists
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // 1️⃣ Create donation
    const donation = await Donation.create({
      donor: req.user.id,
      campaign: req.params.campaignId,
      amount,
      donorName: `${req.user.firstName} ${req.user.lastName}`,
      donorEmail: req.user.email
    });

    // 2️⃣ Create transaction (basic, Razorpay-ready)
    const transaction = await Transaction.create({
      donation: donation._id,
      amount,
      paymentMethod: paymentMethod || "online",
      currency: "INR",
      status: "captured"
    });

    // 3️⃣ Update campaign raised amount
    campaign.currentAmount += Number(amount);
    await campaign.save();

    // 4️⃣ Update user total donated
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalDonated: amount }
    });

    // 5️⃣ Create a receipt for user
    const receipt = await Receipt.create({
      donation: donation._id,
      receiptNumber: "R-" + Date.now(),
      amount,
      issuedTo: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Donation processed successfully",
      donation,
      transaction,
      receipt
    });

  } catch (error) {
    console.error("Donation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
