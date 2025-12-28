import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Heart, Share2, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        product_id: product.id,
        quantity,
        variation: selectedVariation,
        price: selectedVariation ? product.base_price + selectedVariation.price_adjustment : product.base_price
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      await axios.post(`${API}/wishlist/${product.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" data-testid="loading">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center" data-testid="not-found">Product not found</div>;
  }

  const currentPrice = selectedVariation ? product.base_price + selectedVariation.price_adjustment : product.base_price;

  return (
    <div className="min-h-screen" data-testid="product-detail-page">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4" data-testid="product-images">
            <div className="aspect-square bg-secondary overflow-hidden">
              <img
                src={product.images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="main-product-image"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-secondary overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}
                    data-testid={`thumbnail-${index}`}
                  >
                    <img src={image.url} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6" data-testid="product-info">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2" data-testid="product-category">{product.category}</p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" data-testid="product-name">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center" data-testid="product-rating">
                  <Star className="w-5 h-5 fill-current text-primary" />
                  <span className="ml-1 font-semibold">{product.rating}</span>
                </div>
                <span className="text-muted-foreground" data-testid="review-count">({product.review_count} reviews)</span>
              </div>
              <p className="text-3xl font-bold" data-testid="product-price">${currentPrice.toFixed(2)}</p>
            </div>

            <div className="border-t border-b border-border py-6" data-testid="product-description">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
              <div data-testid="product-variations">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Options</h3>
                <div className="space-y-2">
                  {product.variations.map((variation, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariation(variation)}
                      className={`w-full p-4 border-2 text-left transition-colors ${
                        selectedVariation?.value === variation.value ? 'border-primary' : 'border-border hover:border-foreground'
                      }`}
                      data-testid={`variation-${index}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{variation.name}: {variation.value}</span>
                        {variation.price_adjustment !== 0 && (
                          <span className="text-sm text-muted-foreground">+${variation.price_adjustment.toFixed(2)}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Stock: {variation.stock}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div data-testid="quantity-selector">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
                  data-testid="decrease-quantity"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-semibold w-12 text-center" data-testid="quantity-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
                  data-testid="increase-quantity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4" data-testid="product-actions">
              <button onClick={handleAddToCart} className="flex-1 btn-primary" data-testid="add-to-cart-button">
                Add to Cart
              </button>
              <button onClick={handleAddToWishlist} className="w-12 h-12 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors" data-testid="add-to-wishlist-button">
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors" data-testid="share-button">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Stock Info */}
            <p className="text-sm text-muted-foreground" data-testid="stock-info">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24" data-testid="reviews-section">
          <h2 className="text-3xl font-semibold tracking-tight mb-8">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground" data-testid="no-reviews">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6" data-testid={`review-${review.id}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current text-primary' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="font-medium" data-testid={`review-author-${review.id}`}>{review.user_name}</span>
                  </div>
                  <p className="text-muted-foreground" data-testid={`review-comment-${review.id}`}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
