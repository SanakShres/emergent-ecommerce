import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import CartDrawer from "./CartDrawer";

export default function Header() {
	const { user, logout } = useAuth();
	const { itemCount } = useCart();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);

	return (
		<header
			className="sticky top-0 z-50 glassmorphism border-b border-white/20"
			data-testid="main-header"
		>
			<div className="container mx-auto px-4 md:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<Link
						to="/"
						className="text-2xl font-bold tracking-tight"
						data-testid="logo-link"
					>
						LUMINA
					</Link>

					{/* Desktop Navigation */}
					<nav
						className="hidden md:flex items-center gap-8"
						data-testid="desktop-nav"
					>
						<Link
							to="/products"
							className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
							data-testid="products-nav-link"
						>
							Products
						</Link>
						<Link
							to="/products?category=Fashion"
							className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
							data-testid="fashion-nav-link"
						>
							Fashion
						</Link>
						<Link
							to="/products?category=Electronics"
							className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
							data-testid="electronics-nav-link"
						>
							Electronics
						</Link>
						<Link
							to="/products?category=Home & Living"
							className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
							data-testid="home-nav-link"
						>
							Home
						</Link>
					</nav>

					{/* Right Actions */}
					<div className="flex items-center gap-4">
						<Link
							to="/products"
							className="hover:text-primary transition-colors"
							data-testid="search-icon-link"
						>
							<Search className="w-5 h-5" />
						</Link>

						<Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
							<SheetTrigger asChild>
								<button
									className="relative hover:text-primary transition-colors"
									onClick={() => setIsCartOpen(true)}
									data-testid="cart-button"
								>
									<ShoppingCart className="w-5 h-5" />
									{itemCount > 0 && (
										<span
											className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center"
											data-testid="cart-count-badge"
										>
											{itemCount}
										</span>
									)}
								</button>
							</SheetTrigger>
							<SheetContent>
								<CartDrawer
									closeDrawer={() => setIsCartOpen(false)}
								/>
							</SheetContent>
						</Sheet>

						{user ? (
							<div className="hidden md:flex items-center gap-4">
								<Link
									to={user.is_admin ? "/admin" : "/account"}
									className="hover:text-primary transition-colors"
									data-testid="account-link"
								>
									<User className="w-5 h-5" />
								</Link>
								<button
									onClick={logout}
									className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
									data-testid="logout-button"
								>
									Logout
								</button>
							</div>
						) : (
							<Link
								to="/login"
								className="hidden md:block text-sm uppercase tracking-wider hover:text-primary transition-colors"
								data-testid="login-link"
							>
								Login
							</Link>
						)}

						{/* Mobile Menu Button */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden hover:text-primary transition-colors"
							data-testid="mobile-menu-button"
						>
							{mobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div
						className="md:hidden py-4 border-t border-border"
						data-testid="mobile-menu"
					>
						<nav className="flex flex-col gap-4">
							<Link
								to="/products"
								className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
								onClick={() => setMobileMenuOpen(false)}
								data-testid="mobile-products-link"
							>
								Products
							</Link>
							<Link
								to="/products?category=Fashion"
								className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
								onClick={() => setMobileMenuOpen(false)}
								data-testid="mobile-fashion-link"
							>
								Fashion
							</Link>
							<Link
								to="/products?category=Electronics"
								className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
								onClick={() => setMobileMenuOpen(false)}
								data-testid="mobile-electronics-link"
							>
								Electronics
							</Link>
							<Link
								to="/products?category=Home & Living"
								className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
								onClick={() => setMobileMenuOpen(false)}
								data-testid="mobile-home-link"
							>
								Home
							</Link>
							{user ? (
								<>
									<Link
										to={
											user.is_admin
												? "/admin"
												: "/account"
										}
										className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
										onClick={() => setMobileMenuOpen(false)}
										data-testid="mobile-account-link"
									>
										Account
									</Link>
									<button
										onClick={() => {
											logout();
											setMobileMenuOpen(false);
										}}
										className="text-left text-sm uppercase tracking-wider hover:text-primary transition-colors"
										data-testid="mobile-logout-button"
									>
										Logout
									</button>
								</>
							) : (
								<Link
									to="/login"
									className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
									onClick={() => setMobileMenuOpen(false)}
									data-testid="mobile-login-link"
								>
									Login
								</Link>
							)}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
