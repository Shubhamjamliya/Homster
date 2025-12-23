const Vendor = require('../../models/Vendor');
const Transaction = require('../../models/Transaction');

/**
 * Get vendor wallet
 */
const getWallet = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const vendor = await Vendor.findById(vendorId).select('wallet');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        balance: vendor.wallet?.balance || 0
      }
    });
  } catch (error) {
    console.error('Get vendor wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet'
    });
  }
};

/**
 * Get vendor transactions
 */
const getTransactions = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 20, type, status } = req.query;

    const query = { vendorId };
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('bookingId', 'bookingNumber serviceName');

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get vendor transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

/**
 * Request withdrawal
 */
const requestWithdrawal = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const currentBalance = vendor.wallet?.balance || 0;

    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      vendorId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      description: 'Withdrawal request',
      balanceBefore: currentBalance,
      balanceAfter: currentBalance - amount,
      metadata: { bankDetails }
    });

    // Deduct from wallet
    vendor.wallet.balance = currentBalance - amount;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted',
      data: transaction
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal'
    });
  }
};

module.exports = {
  getWallet,
  getTransactions,
  requestWithdrawal
};
