import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Star } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
	const [featuredProducts, setFeaturedProducts] = useState([]);
	const [categories, setCategories] = useState([]);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [productsRes, categoriesRes] = await Promise.all([
				axios.get(`${API}/products/featured`),
				axios.get(`${API}/categories`),
			]);
			setFeaturedProducts(productsRes.data);
			setCategories(categoriesRes.data);
		} catch (error) {
			console.error("Failed to fetch data:", error);
		}
	};

	return (
		<div className="min-h-screen" data-testid="home-page">
			{/* Hero Section */}
			<section className="container mx-auto px-4 md:px-8 py-16 md:py-32">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
					<div
						className="md:col-span-8 relative min-h-[600px] bg-cover bg-center"
						style={{
							backgroundImage: `url(https://images.unsplash.com/photo-1762509547577-76aa7cf87c62?crop=entropy&cs=srgb&fm=jpg&q=85)`,
						}}
						data-testid="hero-image"
					>
						<div className="absolute inset-0 bg-black/20"></div>
					</div>

					<div
						className="md:col-span-4 flex flex-col justify-center"
						data-testid="hero-content"
					>
						<h1
							className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6"
							data-testid="hero-title"
						>
							Modern Living, Simplified
						</h1>
						<p
							className="text-lg text-muted-foreground mb-8"
							data-testid="hero-description"
						>
							Discover our curated collection of minimalist
							products designed for contemporary life.
						</p>
						<Link
							to="/products"
							className="btn-primary inline-block w-fit"
							data-testid="shop-now-button"
						>
							Shop Now
							<ArrowRight className="inline ml-2 w-4 h-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* Categories */}
			<section
				className="bg-secondary py-16 md:py-24"
				data-testid="categories-section"
			>
				<div className="container mx-auto px-4 md:px-8">
					<h2
						className="text-3xl md:text-5xl font-semibold tracking-tight mb-12"
						data-testid="categories-title"
					>
						Shop by Category
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{categories.map((category) => (
							<Link
								key={category.id}
								to={`/products?category=${category.name}`}
								className="group relative h-96 bg-cover bg-center overflow-hidden"
								style={{
									backgroundImage: `url(${category.image_url})`,
								}}
								data-testid={`category-card-${category.slug}`}
							>
								<div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-end p-8">
									<h3
										className="text-white text-2xl font-semibold"
										data-testid={`category-name-${category.slug}`}
									>
										{category.name}
									</h3>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products */}
			<section
				className="container mx-auto px-4 md:px-8 py-16 md:py-24"
				data-testid="featured-products-section"
			>
				<div className="flex justify-between items-end mb-12">
					<h2
						className="text-3xl md:text-5xl font-semibold tracking-tight"
						data-testid="featured-products-title"
					>
						Featured Products
					</h2>
					<Link
						to="/products"
						className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
						data-testid="view-all-link"
					>
						View All <ArrowRight className="inline w-4 h-4 ml-1" />
					</Link>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
					{featuredProducts.map((product) => (
						<Link
							key={product.id}
							to={`/products/${product.id}`}
							className="group"
							data-testid={`featured-product-${product.id}`}
						>
							<div className="relative aspect-square bg-secondary mb-4 overflow-hidden">
								<img
									src={product.images[0]?.url}
									alt={product.name}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									data-testid={`product-image-${product.id}`}
								/>
							</div>
							<div className="space-y-2">
								<p
									className="text-xs uppercase tracking-widest text-muted-foreground"
									data-testid={`product-category-${product.id}`}
								>
									{product.category}
								</p>
								<h3
									className="font-medium"
									data-testid={`product-name-${product.id}`}
								>
									{product.name}
								</h3>
								<div className="flex items-center gap-2">
									<div
										className="flex items-center"
										data-testid={`product-rating-${product.id}`}
									>
										<Star className="w-4 h-4 fill-current text-primary" />
										<span className="text-sm ml-1">
											{product.rating}
										</span>
									</div>
									<span
										className="text-sm text-muted-foreground"
										data-testid={`product-review-count-${product.id}`}
									>
										({product.review_count})
									</span>
								</div>
								<p
									className="text-lg font-semibold"
									data-testid={`product-price-${product.id}`}
								>
									${product.base_price.toFixed(2)}
								</p>
							</div>
						</Link>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section
				className="bg-primary text-white py-24"
				data-testid="cta-section"
			>
				<div className="container mx-auto px-4 md:px-8 text-center">
					<h2
						className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
						data-testid="cta-title"
					>
						Experience Lumina
					</h2>
					<p
						className="text-lg mb-8 max-w-2xl mx-auto"
						data-testid="cta-description"
					>
						Join thousands of customers who have embraced minimalist
						living with our carefully selected products.
					</p>
					<Link
						to="/products"
						className="inline-block bg-white text-primary px-8 py-6 text-xs font-medium uppercase tracking-widest hover:bg-white/90 transition-colors"
						data-testid="cta-button"
					>
						Explore Collection
					</Link>
				</div>
			</section>
		</div>
	);
}
