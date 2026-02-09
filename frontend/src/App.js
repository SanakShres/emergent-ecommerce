import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
	return (
		<AuthProvider>
			<CartProvider>
				<BrowserRouter>
					<ScrollToTop />
					<div className="App">
						<Header />
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/products" element={<Products />} />
							<Route
								path="/products/:id"
								element={<ProductDetail />}
							/>
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/checkout" element={<Checkout />} />
							<Route
								path="/order-success"
								element={<OrderSuccess />}
							/>
							<Route path="/account" element={<Account />} />
							<Route path="/admin" element={<AdminDashboard />} />
							<Route
								path="*"
								element={
									<div className="min-h-screen flex items-center justify-center">
										<h1 className="text-4xl font-bold">
											404 - Page Not Found
										</h1>
									</div>
								}
							/>
						</Routes>
						<Footer />
						<Toaster position="bottom-right" />
					</div>
				</BrowserRouter>
			</CartProvider>
		</AuthProvider>
	);
}

export default App;
