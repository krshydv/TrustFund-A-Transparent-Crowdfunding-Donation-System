const Donation = require('../models/Donation');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

// @desc    Get Analytics Dashboard Data
// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Stats (Counters)
    const totalDonationsCount = await Donation.countDocuments({ status: 'completed' });
    
    // Sum total amount
    const totalAmountResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRaised = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // 2. Monthly Breakdown (For the Bar Chart)
    const monthlyData = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by Month (1-12)
          amount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort Jan -> Dec
    ]);

    // Map months numbers to names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlyData.map(item => ({
      name: monthNames[item._id - 1],
      amount: item.amount
    }));

    // 3. Top Donors (For the Leaderboard)
    // Note: Since we store donorName in Donation model, we can group by that
    const topDonors = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: "$donor", // Group by User ID
          name: { $first: "$donorName" }, // Take the name
          totalDonated: { $sum: "$amount" }
        }
      },
      { $sort: { totalDonated: -1 } }, // Highest first
      { $limit: 5 } // Top 5 only
    ]);

    // 4. Find the absolute Top Donor for the card
    const topDonorName = topDonors.length > 0 ? topDonors[0].name : "N/A";
    const topDonorAmount = topDonors.length > 0 ? topDonors[0].totalDonated : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDonations: totalDonationsCount,
        totalAmount: totalRaised,
        topDonor: { name: topDonorName, amount: topDonorAmount },
        monthlyData: formattedMonthly,
        topDonors: topDonors
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};