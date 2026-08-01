function ReturnsPage() {
  return (
    <div className="info-page">
      <h1>Returns Policy</h1>
      <p className="info-intro">Not happy with your order? No problem — we make returns simple.</p>

      <div className="info-section">
        <h2>Our Policy</h2>
        <p className="info-text">You have <strong>30 days</strong> from the date of delivery to return any item for a full refund or exchange. Items must be:</p>
        <ul className="info-list">
          <li>Unworn and unwashed</li>
          <li>In original condition with all tags attached</li>
          <li>In the original packaging where possible</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>How to Return</h2>
        <ol className="info-list info-list-ordered">
          <li>Email us at <a href="mailto:returns@fit-it.com">returns@fit-it.com</a> with your order number and the items you wish to return.</li>
          <li>We will send you a prepaid return label within 24 hours.</li>
          <li>Pack your items securely and drop them off at any post office or collection point.</li>
          <li>Once we receive and inspect your return, we will process your refund within 5 business days.</li>
        </ol>
      </div>

      <div className="info-section">
        <h2>Refunds</h2>
        <p className="info-text">Refunds are issued to the original payment method. Please allow 5–10 business days for the refund to appear in your account, depending on your bank.</p>
      </div>

      <div className="info-section">
        <h2>Exchanges</h2>
        <p className="info-text">We currently do not process direct exchanges. To get a different size or colour, return your item for a refund and place a new order.</p>
      </div>

      <div className="info-section">
        <h2>Non-Returnable Items</h2>
        <ul className="info-list">
          <li>Sale items marked as final sale</li>
          <li>Underwear and swimwear (for hygiene reasons)</li>
          <li>Gift cards</li>
        </ul>
      </div>
    </div>
  );
}

export default ReturnsPage;
