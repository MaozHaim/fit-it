function DeliveryPage() {
  return (
    <div className="info-page">
      <h1>Delivery Info</h1>
      <p className="info-intro">We work hard to get your order to you as quickly as possible.</p>

      <div className="info-section">
        <h2>Domestic Shipping</h2>
        <div className="info-table-wrap">
          <table className="info-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Estimated Time</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Standard Delivery</td>
                <td>3–5 business days</td>
                <td>Free on orders over $50, otherwise $4.99</td>
              </tr>
              <tr>
                <td>Express Delivery</td>
                <td>1–2 business days</td>
                <td>$12.99</td>
              </tr>
              <tr>
                <td>Next-Day Delivery</td>
                <td>Next business day (order before 12pm)</td>
                <td>$19.99</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-section">
        <h2>International Shipping</h2>
        <div className="info-table-wrap">
          <table className="info-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Estimated Time</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Europe</td>
                <td>5–8 business days</td>
                <td>$9.99</td>
              </tr>
              <tr>
                <td>North America</td>
                <td>7–12 business days</td>
                <td>$14.99</td>
              </tr>
              <tr>
                <td>Rest of World</td>
                <td>10–18 business days</td>
                <td>$19.99</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="info-note">International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.</p>
      </div>

      <div className="info-section">
        <h2>Order Processing</h2>
        <p className="info-text">Orders placed before 12pm (local time) on a business day are processed the same day. Orders placed after 12pm or on weekends will be processed the next business day.</p>
      </div>
    </div>
  );
}

export default DeliveryPage;
