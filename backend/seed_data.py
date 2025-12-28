import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing data
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.categories.delete_many({})
    
    print("Creating admin user...")
    admin_user = {
        "id": "admin-001",
        "email": "admin@lumina.com",
        "password": pwd_context.hash("admin123"),
        "first_name": "Admin",
        "last_name": "User",
        "is_admin": True,
        "created_at": "2025-01-01T00:00:00+00:00"
    }
    await db.users.insert_one(admin_user)
    
    print("Creating test user...")
    test_user = {
        "id": "user-001",
        "email": "user@test.com",
        "password": pwd_context.hash("user123"),
        "first_name": "Test",
        "last_name": "User",
        "is_admin": False,
        "created_at": "2025-01-01T00:00:00+00:00"
    }
    await db.users.insert_one(test_user)
    
    print("Creating categories...")
    categories = [
        {"id": "cat-1", "name": "Fashion", "slug": "fashion", "image_url": "https://images.unsplash.com/photo-1762505464762-538a199c3155?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "Modern apparel and accessories"},
        {"id": "cat-2", "name": "Electronics", "slug": "electronics", "image_url": "https://images.pexels.com/photos/6373146/pexels-photo-6373146.jpeg", "description": "Latest tech and gadgets"},
        {"id": "cat-3", "name": "Home & Living", "slug": "home-living", "image_url": "https://images.pexels.com/photos/462235/pexels-photo-462235.jpeg", "description": "Furniture and home decor"},
    ]
    await db.categories.insert_many(categories)
    
    print("Creating products...")
    products = [
        {
            "id": "prod-1",
            "name": "Minimalist Watch",
            "description": "Swiss-inspired minimalist timepiece with clean lines and premium materials. Features a 40mm case, scratch-resistant sapphire crystal, and Japanese quartz movement.",
            "base_price": 299.00,
            "category": "Fashion",
            "brand": "Lumina",
            "images": [
                {"url": "https://images.pexels.com/photos/21424634/pexels-photo-21424634.jpeg", "alt": "Minimalist Watch"},
                {"url": "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg", "alt": "Watch Detail"}
            ],
            "variations": [
                {"name": "Strap", "value": "Black Leather", "price_adjustment": 0.0, "stock": 15},
                {"name": "Strap", "value": "Stainless Steel", "price_adjustment": 50.0, "stock": 10},
            ],
            "stock": 25,
            "rating": 4.8,
            "review_count": 42,
            "featured": True,
            "created_at": "2025-01-01T00:00:00+00:00"
        },
        {
            "id": "prod-2",
            "name": "Modern Accent Chair",
            "description": "Contemporary lounge chair with sleek silhouette. Crafted with solid wood frame and premium upholstery. Perfect for modern living spaces.",
            "base_price": 599.00,
            "category": "Home & Living",
            "brand": "Lumina Home",
            "images": [
                {"url": "https://images.pexels.com/photos/8534460/pexels-photo-8534460.jpeg", "alt": "Modern Chair"},
                {"url": "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg", "alt": "Chair Angle"}
            ],
            "variations": [
                {"name": "Color", "value": "Charcoal", "price_adjustment": 0.0, "stock": 8},
                {"name": "Color", "value": "Ivory", "price_adjustment": 0.0, "stock": 12},
            ],
            "stock": 20,
            "rating": 4.6,
            "review_count": 28,
            "featured": True,
            "created_at": "2025-01-01T00:00:00+00:00"
        },
        {
            "id": "prod-3",
            "name": "Studio Desk Lamp",
            "description": "Industrial-inspired task lamp with adjustable arm and dimming control. Perfect for workspace or reading corner. LED bulb included.",
            "base_price": 149.00,
            "category": "Home & Living",
            "brand": "Lumina Lighting",
            "images": [
                {"url": "https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg", "alt": "Desk Lamp"},
                {"url": "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg", "alt": "Lamp Detail"}
            ],
            "variations": [],
            "stock": 35,
            "rating": 4.9,
            "review_count": 67,
            "featured": True,
            "created_at": "2025-01-01T00:00:00+00:00"
        },
        {
            "id": "prod-4",
            "name": "Wireless Earbuds Pro",
            "description": "Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear audio. Includes charging case.",
            "base_price": 249.00,
            "category": "Electronics",
            "brand": "TechFlow",
            "images": [
                {"url": "https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg", "alt": "Wireless Earbuds"},
                {"url": "https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg", "alt": "Earbuds Case"}
            ],
            "variations": [
                {"name": "Color", "value": "Black", "price_adjustment": 0.0, "stock": 20},
                {"name": "Color", "value": "White", "price_adjustment": 0.0, "stock": 18},
            ],
            "stock": 38,
            "rating": 4.7,
            "review_count": 156,
            "featured": True,
            "created_at": "2025-01-01T00:00:00+00:00"
        },
        {
            "id": "prod-5",
            "name": "Leather Crossbody Bag",
            "description": "Handcrafted Italian leather crossbody bag with adjustable strap. Features multiple compartments and magnetic closure.",
            "base_price": 189.00,
            "category": "Fashion",
            "brand": "Lumina Leather",
            "images": [
                {"url": "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg", "alt": "Leather Bag"},
                {"url": "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg", "alt": "Bag Detail"}
            ],
            "variations": [
                {"name": "Color", "value": "Tan", "price_adjustment": 0.0, "stock": 12},
                {"name": "Color", "value": "Black", "price_adjustment": 0.0, "stock": 15},
            ],
            "stock": 27,
            "rating": 4.5,
            "review_count": 34,
            "featured": False,
            "created_at": "2025-01-01T00:00:00+00:00"
        },
        {
            "id": "prod-6",
            "name": "Smart Watch Series 5",
            "description": "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Water resistant up to 50m.",
            "base_price": 399.00,
            "category": "Electronics",
            "brand": "TechFlow",
            "images": [
                {"url": "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg", "alt": "Smart Watch"},
                {"url": "https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg", "alt": "Watch Features"}
            ],
            "variations": [
                {"name": "Size", "value": "42mm", "price_adjustment": 0.0, "stock": 10},
                {"name": "Size", "value": "46mm", "price_adjustment": 50.0, "stock": 8},
            ],
            "stock": 18,
            "rating": 4.4,
            "review_count": 89,
            "featured": False,
            "created_at": "2025-01-01T00:00:00+00:00"
        },
        {
            "id": "prod-7",
            "name": "Ceramic Coffee Mug Set",
            "description": "Set of 4 handcrafted ceramic mugs with modern geometric design. Microwave and dishwasher safe. 12oz capacity each.",
            "base_price": 79.00,
            "category": "Home & Living",
            "brand": "Lumina Home",
            "images": [
                {"url": "https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg", "alt": "Coffee Mug Set"},
                {"url": "https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg", "alt": "Mug Detail"}
            ],
            "variations": [],
            "stock": 45,
            "rating": 4.8,
            "review_count": 23,
            "featured": False,
            "created_at": "2025-01-01T00:00:00+00:00"
        },
        {
            "id": "prod-8",
            "name": "Merino Wool Scarf",
            "description": "Luxuriously soft merino wool scarf. Lightweight yet warm. Perfect for any season. Hand-washable.",
            "base_price": 89.00,
            "category": "Fashion",
            "brand": "Lumina",
            "images": [
                {"url": "https://images.pexels.com/photos/2220315/pexels-photo-2220315.jpeg", "alt": "Wool Scarf"},
                {"url": "https://images.pexels.com/photos/2220315/pexels-photo-2220315.jpeg", "alt": "Scarf Texture"}
            ],
            "variations": [
                {"name": "Color", "value": "Navy", "price_adjustment": 0.0, "stock": 20},
                {"name": "Color", "value": "Grey", "price_adjustment": 0.0, "stock": 18},
                {"name": "Color", "value": "Burgundy", "price_adjustment": 0.0, "stock": 15},
            ],
            "stock": 53,
            "rating": 4.6,
            "review_count": 41,
            "featured": True,
            "created_at": "2025-01-01T00:00:00+00:00"
        }
    ]
    await db.products.insert_many(products)
    
    print("Database seeded successfully!")
    print("Admin credentials: admin@lumina.com / admin123")
    print("User credentials: user@test.com / user123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
