exports.processPayment = async (req, res) => {
  res.json({
    status: 'success',
    message: 'Payment processed successfully',
    transactionId: 'txn_mock_123456',
    amount: req.body.amount || 500,
    currency: req.body.currency || 'INR'
  });
};

exports.getPaymentHistory = async (req, res) => {
  res.json({
    status: 'success',
    payments: [
      {
        transactionId: 'txn_mock_123456',
        amount: 500,
        currency: 'INR',
        date: new Date().toISOString(),
        type: 'payment',
        status: 'completed'
      },
      {
        transactionId: 'txn_mock_654321',
        amount: 300,
        currency: 'INR',
        date: new Date(Date.now() - 86400000).toISOString(),
        type: 'payout',
        status: 'completed'
      }
    ]
  });
};

exports.payout = async (req, res) => {
  res.json({
    status: 'success',
    message: 'Payout processed successfully',
    transactionId: 'txn_mock_654321',
    amount: req.body.amount || 300,
    currency: req.body.currency || 'INR'
  });
}; 