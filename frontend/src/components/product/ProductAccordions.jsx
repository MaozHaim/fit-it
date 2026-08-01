import Accordion from './Accordion';

function ProductAccordions({ description }) {
  return (
    <>
      <Accordion label="Product Description">
        <p className="detail-text">{description}</p>
      </Accordion>

      <Accordion label="Delivery & Returns">
        <p className="detail-text">Free standard delivery on orders over $50. Express delivery available at checkout.</p>
        <p className="detail-text">Free returns within 30 days of delivery. Items must be unworn and in original condition.</p>
      </Accordion>
    </>
  );
}

export default ProductAccordions;
