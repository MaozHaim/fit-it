import ProductCard from '../ProductCard';

function ProductGrid({ loading, products, displayed, hasMore, sentinelRef, tag }) {
  if (loading) {
    return (
      <div className="products-spinner-wrap">
        <div className="products-spinner" />
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="products-empty">No products match your filters.</p>;
  }

  return (
    <>
      <div className="products-grid">
        {displayed.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            imageUrl={p.image_url}
            product={p}
            showSalePrice={tag === 'sale'}
          />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </>
  );
}

export default ProductGrid;
