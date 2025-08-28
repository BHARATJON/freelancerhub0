import React from 'react';

const Payment = () => {
  // TODO: Implement payment processing for companies and payout view for freelancers
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Payments & Payouts</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Process Payment (Company)</h2>
        <p>Payment processing form and logic will go here.</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Payouts (Freelancer)</h2>
        <p>Payout and transaction history will be shown here.</p>
      </div>
    </div>
  );
};

export default Payment; 