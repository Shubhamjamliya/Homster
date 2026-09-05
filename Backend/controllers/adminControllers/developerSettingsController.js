const Booking = require('../../models/Booking');
const BookingRequest = require('../../models/BookingRequest');
const VendorBill = require('../../models/VendorBill');
const Transaction = require('../../models/Transaction');

const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access is required.'
    });
  }

  next();
};

const clearBookingActivity = async (req, res) => {
  if (req.body.confirmation !== 'CLEAR ALL') {
    return res.status(400).json({
      success: false,
      message: 'Type CLEAR ALL to confirm this reset.'
    });
  }

  try {
    const bookingIds = await Booking.distinct('_id');
    const bookingFilter = bookingIds.length > 0
      ? { bookingId: { $in: bookingIds } }
      : { bookingId: { $exists: true, $ne: null } };

    const [bookingRequests, vendorBills, transactions, bookings] = await Promise.all([
      BookingRequest.deleteMany(bookingFilter),
      VendorBill.deleteMany(bookingFilter),
      Transaction.deleteMany(bookingFilter),
      Booking.deleteMany({})
    ]);

    res.status(200).json({
      success: true,
      message: 'Booking activity has been reset.',
      deleted: {
        bookings: bookings.deletedCount,
        bookingRequests: bookingRequests.deletedCount,
        vendorBills: vendorBills.deletedCount,
        transactions: transactions.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear booking activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to reset booking activity. No other data was targeted.'
    });
  }
};

module.exports = {
  requireSuperAdmin,
  clearBookingActivity
};
