from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
# from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
class StripeCheckout:
    pass

class CheckoutSessionResponse:
    pass

class CheckoutStatusResponse:
    pass

class CheckoutSessionRequest:
    pass

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

# Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

security = HTTPBearer()

# Create the main app
# app = FastAPI()
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code (if any)
    print("Starting up...")
    # If your DB client needs async startup, do it here
    # e.g., await client.connect()
    
    yield  # <-- FastAPI runs your app here

    # Shutdown code
    print("Shutting down...")
    client.close()  # safely closes the DB client

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    first_name: str
    last_name: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Address(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool = False

class ProductVariation(BaseModel):
    name: str  # e.g., "Size", "Color"
    value: str  # e.g., "Large", "Red"
    price_adjustment: float = 0.0
    stock: int = 0

class ProductImage(BaseModel):
    url: str
    alt: str = ""

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    base_price: float
    category: str
    brand: str = ""
    images: List[ProductImage] = []
    variations: List[ProductVariation] = []
    stock: int = 0
    rating: float = 0.0
    review_count: int = 0
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    base_price: float
    category: str
    brand: str = ""
    images: List[ProductImage] = []
    variations: List[ProductVariation] = []
    stock: int = 0
    featured: bool = False

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    image_url: str = ""
    description: str = ""

class CartItem(BaseModel):
    product_id: str
    quantity: int
    variation: Optional[ProductVariation] = None
    price: float

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    variation: Optional[ProductVariation] = None

class ShippingInfo(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    phone: str = ""

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"ORD-{uuid.uuid4().hex[:8].upper()}")
    user_id: Optional[str] = None
    items: List[OrderItem]
    shipping_info: ShippingInfo
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    status: str = "pending"  # pending, processing, shipped, delivered, cancelled
    payment_status: str = "pending"  # pending, paid, failed
    payment_session_id: Optional[str] = None
    shipping_method: str = "standard"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_info: ShippingInfo
    shipping_method: str = "standard"

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_ids: List[str] = []

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str  # percentage or fixed
    discount_value: float
    min_order_value: float = 0.0
    expiry_date: Optional[datetime] = None
    is_active: bool = True

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    session_id: str
    amount: float
    currency: str
    payment_status: str  # pending, paid, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump()
    user_dict["password"] = hash_password(user_data.password)
    user_obj = User(**{k: v for k, v in user_dict.items() if k != "password"})
    user_doc = user_obj.model_dump()
    user_doc["password"] = user_dict["password"]
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"user_id": user_obj.id, "email": user_obj.email})
    
    return {"token": token, "user": user_obj}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"user_id": user["id"], "email": user["email"]})
    user_response = User(**{k: v for k, v in user.items() if k != "password"})
    
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**{k: v for k, v in current_user.items() if k != "password"})

# ============ PRODUCT ROUTES ============

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = "created_at",
    limit: int = 50,
    skip: int = 0
):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None:
        query["base_price"] = {"$gte": min_price}
    if max_price is not None:
        if "base_price" in query:
            query["base_price"]["$lte"] = max_price
        else:
            query["base_price"] = {"$lte": max_price}
    
    sort_order = -1 if sort in ["created_at", "rating"] else 1
    products = await db.products.find(query, {"_id": 0}).sort(sort, sort_order).skip(skip).limit(limit).to_list(limit)
    
    for product in products:
        if isinstance(product.get("created_at"), str):
            product["created_at"] = datetime.fromisoformat(product["created_at"])
    
    return products

@api_router.get("/products/featured")
async def get_featured_products():
    products = await db.products.find({"featured": True}, {"_id": 0}).limit(8).to_list(8)
    for product in products:
        if isinstance(product.get("created_at"), str):
            product["created_at"] = datetime.fromisoformat(product["created_at"])
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get("created_at"), str):
        product["created_at"] = datetime.fromisoformat(product["created_at"])
    return product

@api_router.post("/products", dependencies=[Depends(get_current_admin)])
async def create_product(product: ProductCreate):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.put("/products/{product_id}", dependencies=[Depends(get_current_admin)])
async def update_product(product_id: str, product: ProductCreate):
    doc = product.model_dump()
    result = await db.products.update_one({"id": product_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

@api_router.delete("/products/{product_id}", dependencies=[Depends(get_current_admin)])
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============ CATEGORY ROUTES ============

@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.post("/categories", dependencies=[Depends(get_current_admin)])
async def create_category(category: Category):
    doc = category.model_dump()
    await db.categories.insert_one(doc)
    return category

# ============ CART ROUTES ============

@api_router.get("/cart")
async def get_cart(session_id: Optional[str] = None, current_user: Optional[dict] = Depends(get_current_user)):
    query = {}
    if current_user:
        query["user_id"] = current_user["id"]
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    cart = await db.carts.find_one(query, {"_id": 0})
    if not cart:
        # Create new cart
        cart_obj = Cart(user_id=current_user["id"] if current_user else None, session_id=session_id)
        doc = cart_obj.model_dump()
        doc["updated_at"] = doc["updated_at"].isoformat()
        await db.carts.insert_one(doc)
        return cart_obj
    
    if isinstance(cart.get("updated_at"), str):
        cart["updated_at"] = datetime.fromisoformat(cart["updated_at"])
    return cart

@api_router.post("/cart/items")
async def add_to_cart(item: CartItem, session_id: Optional[str] = None, current_user: Optional[dict] = Depends(get_current_user)):
    query = {}
    if current_user:
        query["user_id"] = current_user["id"]
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    cart = await db.carts.find_one(query, {"_id": 0})
    if not cart:
        cart_obj = Cart(user_id=current_user["id"] if current_user else None, session_id=session_id, items=[item.model_dump()])
        doc = cart_obj.model_dump()
        doc["updated_at"] = doc["updated_at"].isoformat()
        await db.carts.insert_one(doc)
        return cart_obj
    
    # Check if item already exists
    items = cart["items"]
    found = False
    for existing_item in items:
        if existing_item["product_id"] == item.product_id and existing_item.get("variation") == item.variation:
            existing_item["quantity"] += item.quantity
            found = True
            break
    
    if not found:
        items.append(item.model_dump())
    
    await db.carts.update_one(query, {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}})
    cart["items"] = items
    return cart

@api_router.put("/cart/items/{product_id}")
async def update_cart_item(product_id: str, quantity: int, session_id: Optional[str] = None, current_user: Optional[dict] = Depends(get_current_user)):
    query = {}
    if current_user:
        query["user_id"] = current_user["id"]
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    cart = await db.carts.find_one(query, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart["items"]
    for item in items:
        if item["product_id"] == product_id:
            item["quantity"] = quantity
            break
    
    await db.carts.update_one(query, {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Cart updated"}

@api_router.delete("/cart/items/{product_id}")
async def remove_from_cart(product_id: str, session_id: Optional[str] = None, current_user: Optional[dict] = Depends(get_current_user)):
    query = {}
    if current_user:
        query["user_id"] = current_user["id"]
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    cart = await db.carts.find_one(query, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart["items"] if item["product_id"] != product_id]
    await db.carts.update_one(query, {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Item removed"}

@api_router.delete("/cart")
async def clear_cart(session_id: Optional[str] = None, current_user: Optional[dict] = Depends(get_current_user)):
    query = {}
    if current_user:
        query["user_id"] = current_user["id"]
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID or authentication required")
    
    await db.carts.update_one(query, {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Cart cleared"}

# ============ ORDER ROUTES ============

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: Optional[dict] = Depends(get_current_user)):
    # Calculate totals
    subtotal = sum(item.price * item.quantity for item in order_data.items)
    tax = subtotal * 0.1  # 10% tax
    shipping_cost = 0.0 if order_data.shipping_method == "pickup" else (10.0 if order_data.shipping_method == "standard" else 25.0)
    total = subtotal + tax + shipping_cost
    
    # Create order items
    order_items = []
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        order_items.append(OrderItem(
            product_id=item.product_id,
            product_name=product["name"],
            quantity=item.quantity,
            price=item.price,
            variation=item.variation
        ))
    
    order_obj = Order(
        user_id=current_user["id"] if current_user else None,
        items=order_items,
        shipping_info=order_data.shipping_info,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        shipping_method=order_data.shipping_method
    )
    
    doc = order_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.orders.insert_one(doc)
    
    return order_obj

@api_router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for order in orders:
        if isinstance(order.get("created_at"), str):
            order["created_at"] = datetime.fromisoformat(order["created_at"])
        if isinstance(order.get("updated_at"), str):
            order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    if isinstance(order.get("created_at"), str):
        order["created_at"] = datetime.fromisoformat(order["created_at"])
    if isinstance(order.get("updated_at"), str):
        order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    return order

@api_router.get("/admin/orders", dependencies=[Depends(get_current_admin)])
async def get_all_orders(status: Optional[str] = None, limit: int = 100, skip: int = 0):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for order in orders:
        if isinstance(order.get("created_at"), str):
            order["created_at"] = datetime.fromisoformat(order["created_at"])
        if isinstance(order.get("updated_at"), str):
            order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    return orders

@api_router.put("/admin/orders/{order_id}/status", dependencies=[Depends(get_current_admin)])
async def update_order_status(order_id: str, status: str):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

# ============ REVIEW ROUTES ============

@api_router.get("/products/{product_id}/reviews")
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for review in reviews:
        if isinstance(review.get("created_at"), str):
            review["created_at"] = datetime.fromisoformat(review["created_at"])
    return reviews

@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    # Check if user already reviewed this product
    existing = await db.reviews.find_one({"product_id": review_data.product_id, "user_id": current_user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    review_obj = Review(
        product_id=review_data.product_id,
        user_id=current_user["id"],
        user_name=f"{current_user['first_name']} {current_user['last_name']}",
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    doc = review_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.reviews.insert_one(doc)
    
    # Update product rating
    reviews = await db.reviews.find({"product_id": review_data.product_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.products.update_one(
        {"id": review_data.product_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(reviews)}}
    )
    
    return review_obj

# ============ WISHLIST ROUTES ============

@api_router.get("/wishlist")
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not wishlist:
        wishlist_obj = Wishlist(user_id=current_user["id"])
        await db.wishlists.insert_one(wishlist_obj.model_dump())
        return wishlist_obj
    return wishlist

@api_router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not wishlist:
        wishlist_obj = Wishlist(user_id=current_user["id"], product_ids=[product_id])
        await db.wishlists.insert_one(wishlist_obj.model_dump())
        return {"message": "Added to wishlist"}
    
    product_ids = wishlist.get("product_ids", [])
    if product_id not in product_ids:
        product_ids.append(product_id)
        await db.wishlists.update_one({"user_id": current_user["id"]}, {"$set": {"product_ids": product_ids}})
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if wishlist:
        product_ids = [pid for pid in wishlist.get("product_ids", []) if pid != product_id]
        await db.wishlists.update_one({"user_id": current_user["id"]}, {"$set": {"product_ids": product_ids}})
    return {"message": "Removed from wishlist"}

# ============ PAYMENT ROUTES ============

@api_router.post("/payments/create-checkout")
async def create_checkout_session(request: Request, order_id: str):
    # Get order
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get host URL from request
    host_url = str(request.base_url).rstrip("/")
    
    # Create Stripe checkout session
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host_url}/api/webhook/stripe")
    
    checkout_request = CheckoutSessionRequest(
        amount=order["total"],
        currency="usd",
        success_url=f"{host_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{host_url}/checkout",
        metadata={"order_id": order_id}
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction
    transaction = PaymentTransaction(
        order_id=order_id,
        session_id=session.session_id,
        amount=order["total"],
        currency="usd",
        payment_status="pending"
    )
    doc = transaction.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.payment_transactions.insert_one(doc)
    
    # Update order with session ID
    await db.orders.update_one({"id": order_id}, {"$set": {"payment_session_id": session.session_id}})
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and order if paid
    if status.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if transaction and transaction["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.orders.update_one(
                {"payment_session_id": session_id},
                {"$set": {"payment_status": "paid", "status": "processing", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
    
    return status

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        
        if event.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
            if transaction and transaction["payment_status"] != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                await db.orders.update_one(
                    {"payment_session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "status": "processing", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============ ADMIN ROUTES ============

@api_router.get("/admin/analytics", dependencies=[Depends(get_current_admin)])
async def get_analytics():
    # Get total orders
    total_orders = await db.orders.count_documents({})
    
    # Get total revenue
    orders = await db.orders.find({"payment_status": "paid"}, {"_id": 0, "total": 1}).to_list(10000)
    total_revenue = sum(order["total"] for order in orders)
    
    # Get total products
    total_products = await db.products.count_documents({})
    
    # Get total users
    total_users = await db.users.count_documents({})
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    for order in recent_orders:
        if isinstance(order.get("created_at"), str):
            order["created_at"] = datetime.fromisoformat(order["created_at"])
        if isinstance(order.get("updated_at"), str):
            order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_products": total_products,
        "total_users": total_users,
        "recent_orders": recent_orders
    }

@api_router.get("/admin/users", dependencies=[Depends(get_current_admin)])
async def get_all_users():
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get("created_at"), str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
    return users

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(api_router)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)  # no reload

# @app.on_event("shutdown")
# async def shutdown_db_client():
#     client.close()