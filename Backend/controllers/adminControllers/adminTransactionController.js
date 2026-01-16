const Transaction = require('../../models/Transaction');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Vendor = require('../../models/Vendor');
const Worker = require('../../models/Worker');

/**
 * Get all transactions with pagination and filtering
 */
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type, entity } = req.query;

    // --- SPECIAL HANDLING FOR ADMIN REVENUE (Extract from Bookings) ---
    if (entity === 'admin') {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query for Bookings
      let bookingQuery = {
        status: { $in: ['COMPLETED', 'completed', 'paid', 'PAID'] } // Assuming revenue realized on completion
      };

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const [users, vendors] = await Promise.all([
          User.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select('_id'),
          Vendor.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select('_id'),
        ]);

        bookingQuery.$or = [
          { bookingNumber: searchRegex },
          { userId: { $in: users.map(u => u._id) } },
          { vendorId: { $in: vendors.map(v => v._id) } }
        ];
      }

      // Helper to determine if we should include a specific type
      const shouldInclude = (t) => type === 'all' || type === t;

      // We fetch bookings first
      // Note: Pagination here applies to bookings, not rows, which might result in variable row counts per page
      // This is an acceptable trade-off for virtualizing the data
      const bookings = await Booking.find(bookingQuery)
        .populate('userId', 'name email phone')
        .populate('vendorId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalBookings = await Booking.countDocuments(bookingQuery);

      // Transform bookings into virtual transactions
      let virtualTransactions = [];

      bookings.forEach(booking => {
        // 1. Commission
        if (shouldInclude('commission') && booking.adminCommission > 0) {
          virtualTransactions.push({
            _id: `${booking._id}_comm`,
            referenceId: `COMM-${booking.bookingNumber}`,
            bookingId: booking,
            userId: booking.userId, // Attributing to user/booking context
            vendorId: booking.vendorId,
            type: 'commission',
            amount: booking.adminCommission,
            status: 'completed',
            paymentMethod: 'system',
            createdAt: booking.completedAt || booking.updatedAt || booking.createdAt,
            description: `Commission for booking ${booking.bookingNumber}`
          });
        }

        // 2. GST (Tax)
        if (shouldInclude('gst') && booking.tax > 0) {
          virtualTransactions.push({
            _id: `${booking._id}_gst`,
            referenceId: `GST-${booking.bookingNumber}`,
            bookingId: booking,
            type: 'gst',
            amount: booking.tax,
            status: 'completed',
            paymentMethod: 'system',
            createdAt: booking.completedAt || booking.updatedAt || booking.createdAt,
            description: `GST for booking ${booking.bookingNumber}`
          });
        }

        // 3. Convenience Fee (Visiting Charges or similar)
        // Assuming visitingCharges might be the convenience fee, or if explicitly defined
        // Using visitingCharges as a proxy for "Platform/Convenience Fee" for now if confirmed
        if (shouldInclude('convenience_fee') && booking.visitingCharges > 0) {
          virtualTransactions.push({
            _id: `${booking._id}_conv`,
            referenceId: `FEE-${booking.bookingNumber}`,
            bookingId: booking,
            type: 'convenience_fee',
            amount: booking.visitingCharges,
            status: 'completed',
            paymentMethod: 'system',
            createdAt: booking.completedAt || booking.updatedAt || booking.createdAt,
            description: `Convenience Fee for booking ${booking.bookingNumber}`
          });
        }

        // 4. Platform Fee (if separate from above, extracted from extraCharges or base)
        // For now, let's assume adminCommission covers the main platform fee unless specified
      });

      return res.status(200).json({
        success: true,
        data: virtualTransactions,
        pagination: {
          total: totalBookings, // Note: This is total bookings, not total rows
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalBookings / parseInt(limit))
        }
      });

    }

    // --- STANDARD LOGIC FOR OTHERS (User, Vendor, Worker, All) ---
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    // Apply status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Apply type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Apply entity filter
    if (entity) {
      if (entity === 'user') {
        query.$or = [
          { userId: { $ne: null } },
          { type: 'cash_collected' },
          { type: 'payment' }
        ];
      } else if (entity === 'vendor') {
        query.vendorId = { $ne: null };
      } else if (entity === 'worker') {
        query.workerId = { $ne: null };
      }
    }

    // Apply search filter (Transaction ID, Order ID, or Customer/Vendor/Worker Name/Email)
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      // We need to find matching users, vendors, workers and bookings first
      const [users, vendors, workers, bookings] = await Promise.all([
        User.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select('_id'),
        Vendor.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select('_id'),
        Worker.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select('_id'),
        Booking.find({ bookingNumber: searchRegex }).select('_id')
      ]);

      const userIds = users.map(u => u._id);
      const vendorIds = vendors.map(v => v._id);
      const workerIds = workers.map(w => w._id);
      const bookingIds = bookings.map(b => b._id);

      // Find bookings where the USER matches the search (for indirect transactions like cash_collected)
      const userBookingIds = await Booking.find({ userId: { $in: userIds } }).select('_id');
      const allBookingIds = [...bookingIds, ...userBookingIds.map(b => b._id)];

      query.$or = [
        { referenceId: searchRegex },
        { userId: { $in: userIds } },
        { vendorId: { $in: vendorIds } },
        { workerId: { $in: workerIds } },
        { bookingId: { $in: allBookingIds } }
      ];

      // If it looks like an ObjectId, search by ID too
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'name email phone')
      .populate('workerId', 'name email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingNumber userId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

/**
 * Get transaction statistics for dashboard
 */
const getTransactionStats = async (req, res) => {
  try {
    const { entity } = req.query;

    // --- SPECIAL HANDLING FOR ADMIN REVENUE (Extract from Bookings) ---
    if (entity === 'admin') {
      const stats = await Booking.aggregate([
        {
          $match: {
            status: { $in: ['COMPLETED', 'completed', 'paid', 'PAID'] }
          }
        },
        {
          $group: {
            _id: null,
            totalCommission: { $sum: '$adminCommission' },
            totalGST: { $sum: '$tax' },
            totalFees: { $sum: '$visitingCharges' },
            // If total revenue includes all earning components
            totalRevenue: {
              $sum: { $add: ['$adminCommission', '$tax', '$visitingCharges'] }
            }
          }
        }
      ]);

      const data = stats[0] || { totalCommission: 0, totalGST: 0, totalFees: 0, totalRevenue: 0 };

      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: data.totalRevenue,
          totalCommission: data.totalCommission,
          netRevenue: data.totalCommission + data.totalFees, // Net usually excludes tax
          details: {
            gst: data.totalGST,
            fees: data.totalFees
          }
        }
      });
    }

    // --- STANDARD LOGIC FOR OTHERS ---
    let matchQuery = {
      status: 'completed',
      type: { $in: ['credit', 'debit', 'refund', 'commission', 'cash_collected', 'payment'] }
    };

    // Apply entity filter
    if (entity) {
      if (entity === 'user') matchQuery.userId = { $ne: null };
      if (entity === 'vendor') matchQuery.vendorId = { $ne: null };
      if (entity === 'worker') matchQuery.workerId = { $ne: null };
    }

    // We count 'completed' transactions for revenue
    const revenueStats = await Transaction.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $in: ['$type', ['credit', 'commission', 'cash_collected', 'payment', 'platform_fee', 'convenience_fee', 'gst', 'penalty', 'tds_deduction']] }, '$amount', 0]
            }
          },
          totalRefunds: {
            $sum: {
              $cond: [{ $in: ['$type', ['refund', 'withdrawal']] }, '$amount', 0] // Withdrawal is not exactly refund but money out
            }
          }
        }
      }
    ]);

    const stats = revenueStats[0] || { totalRevenue: 0, totalRefunds: 0 };
    const netRevenue = stats.totalRevenue - stats.totalRefunds;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: stats.totalRevenue,
        totalRefunds: stats.totalRefunds,
        netRevenue
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics'
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionStats
};
