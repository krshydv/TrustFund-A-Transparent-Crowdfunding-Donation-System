const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// 1. Create Campaign
exports.createCampaign = async (req, res) => {
  try {
    req.body.creator = req.user.id;
    
    // FIX: Map 'categoryId' (from Frontend) to 'category' (for Database)
    if (req.body.categoryId) {
        req.body.category = req.body.categoryId;
    }

    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) { 
    res.status(500).json({ success: false, message: error.message }); 
  }
};

// 2. Get All Campaigns (THIS IS THE ONE CAUSING THE ERROR)
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('creator', 'firstName lastName profileImage');
    res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 3. Get Single Campaign
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('creator', 'firstName lastName');
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const donations = await Donation.find({ campaign: req.params.id }).populate('donor', 'firstName lastName');
    res.status(200).json({ success: true, data: { campaign, donations } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 4. Update Campaign
exports.updateCampaign = async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: campaign });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 5. Delete Campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await campaign.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};