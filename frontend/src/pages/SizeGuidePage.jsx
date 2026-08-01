const MEN = [
  { size: 'S',   chest: '34–36"', waist: '28–30"', hips: '34–36"' },
  { size: 'M',   chest: '37–39"', waist: '31–33"', hips: '37–39"' },
  { size: 'L',   chest: '40–42"', waist: '34–36"', hips: '40–42"' },
  { size: 'XL',  chest: '43–45"', waist: '37–39"', hips: '43–45"' },
  { size: 'XXL', chest: '46–48"', waist: '40–43"', hips: '46–48"' },
];

function SizeGuidePage() {
  return (
    <div className="info-page">
      <h1>Size Guide</h1>
      <p className="info-intro">All measurements are in inches. When between sizes, we recommend sizing up.</p>

      <div className="info-section">
        <div className="info-table-wrap">
          <table className="info-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Waist</th>
                <th>Hips</th>
              </tr>
            </thead>
            <tbody>
              {MEN.map(row => (
                <tr key={row.size}>
                  <td><strong>{row.size}</strong></td>
                  <td>{row.chest}</td>
                  <td>{row.waist}</td>
                  <td>{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-section">
        <h2>How to Measure</h2>
        <ul className="info-list">
          <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape parallel to the ground.</li>
          <li><strong>Waist:</strong> Measure around your natural waistline, the narrowest part of your torso.</li>
          <li><strong>Hips:</strong> Measure around the fullest part of your hips and seat, about 8" below your natural waistline.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Still not sure?</h2>
        <p className="info-text">Email us at <a href="mailto:support@fit-it.com">support@fit-it.com</a> and our team will help you find the perfect fit.</p>
      </div>
    </div>
  );
}

export default SizeGuidePage;
