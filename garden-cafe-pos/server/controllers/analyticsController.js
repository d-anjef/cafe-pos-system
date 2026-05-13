const Order = require("../models/Order");

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    // ✅ Revenue Today
    const revenueToday = await Order.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // ✅ Last 7 Days Revenue
    const revenueChart = await Order.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$completedAt"
            }
          },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // ✅ Top Selling Items
    const topItems = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantity: { $sum: "$items.quantity" },
          revenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"]
            }
          }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    // ✅ Peak Hours
    const peakHours = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $hour: "$completedAt" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // ✅ Total Revenue All Time
    const totalRevenue = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      revenueToday: revenueToday[0] || { total: 0, count: 0 },
      revenueChart,
      topItems,
      peakHours,
      totalRevenue: totalRevenue[0] || { total: 0, count: 0 }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Analytics Error" });
  }
};