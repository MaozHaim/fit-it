function ProductImage({ imageUrl, name }) {
  return (
    <div className="detail-image-wrap">
      {imageUrl
        ? <img src={imageUrl} alt={name} />
        : <div className="detail-image-placeholder" />
      }
    </div>
  );
}

export default ProductImage;
