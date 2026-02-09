import { SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { useCart } from "../contexts/CartContext";
import { Minus, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartDrawer({ closeDrawer }) {
	const { cart, updateQuantity, removeItem, cartTotal, itemCount } =
		useCart();

	if (itemCount === 0) {
		return (
			<div
				className="flex flex-col items-center justify-center h-full"
				data-testid="empty-cart"
			>
				<SheetHeader>
					<SheetTitle>Your Cart</SheetTitle>
					<SheetDescription>Your cart is empty</SheetDescription>
				</SheetHeader>
				<Link
					to="/products"
					className="mt-8 btn-primary inline-block"
					data-testid="continue-shopping-button"
					onClick={closeDrawer} // <-- CLOSE DRAWER
				>
					Continue Shopping
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full" data-testid="cart-drawer">
			<SheetHeader>
				<SheetTitle>Your Cart ({itemCount} items)</SheetTitle>
				<SheetDescription data-testid="cart-subtitle">
					Review your items
				</SheetDescription>
			</SheetHeader>

			<div
				className="flex-1 overflow-y-auto py-6"
				data-testid="cart-items-list"
			>
				<div className="space-y-6">
					{cart.items.map((item, index) => (
						<div
							key={`${item.product_id}-${index}`}
							className="flex gap-4 border-b border-border pb-4"
							data-testid={`cart-item-${index}`}
						>
							<div className="flex-1">
								<h4
									className="font-medium"
									data-testid={`cart-item-name-${index}`}
								>
									Product #{item.product_id.slice(0, 8)}
								</h4>
								<p
									className="text-sm text-muted-foreground mt-1"
									data-testid={`cart-item-price-${index}`}
								>
									${item.price.toFixed(2)}
								</p>

								<div className="flex items-center gap-2 mt-3">
									<button
										onClick={() =>
											updateQuantity(
												item.product_id,
												Math.max(1, item.quantity - 1),
											)
										}
										className="w-8 h-8 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
										data-testid={`cart-item-decrease-${index}`}
									>
										<Minus className="w-4 h-4" />
									</button>
									<span
										className="w-8 text-center"
										data-testid={`cart-item-quantity-${index}`}
									>
										{item.quantity}
									</span>
									<button
										onClick={() =>
											updateQuantity(
												item.product_id,
												item.quantity + 1,
											)
										}
										className="w-8 h-8 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
										data-testid={`cart-item-increase-${index}`}
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>
							</div>

							<button
								onClick={() => removeItem(item.product_id)}
								className="text-muted-foreground hover:text-foreground transition-colors"
								data-testid={`cart-item-remove-${index}`}
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					))}
				</div>
			</div>

			<div
				className="border-t border-border pt-6 space-y-4"
				data-testid="cart-footer"
			>
				<div className="flex justify-between items-center text-lg font-semibold">
					<span data-testid="cart-total-label">Total</span>
					<span data-testid="cart-total-amount">
						${cartTotal.toFixed(2)}
					</span>
				</div>

				<Link
					to="/checkout"
					className="block w-full btn-primary text-center"
					data-testid="checkout-button"
					onClick={closeDrawer} // <-- CLOSE DRAWER
				>
					Checkout
				</Link>

				<Link
					to="/products"
					className="block w-full text-center text-sm uppercase tracking-wider hover:text-primary transition-colors"
					data-testid="continue-shopping-link"
					onClick={closeDrawer} // <-- CLOSE DRAWER
				>
					Continue Shopping
				</Link>
			</div>
		</div>
	);
}
