# Here are your Instructions

# Emergent App

This project is a full-stack e-commerce application with a **React frontend** and a **Python backend**.

This guide will help you set up and run the project locally.

---

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Project Structure](#project-structure)
-   [Frontend Setup](#frontend-setup)
-   [Backend Setup](#backend-setup)
-   [Common Issues](#common-issues)
-   [Running the Project](#running-the-project)

---

## Prerequisites

Make sure you have the following installed:

-   **Node.js** (v18+ recommended)
-   **npm** (comes with Node.js)
-   **Python** (v3.9+)
-   **pip** (Python package manager)
-   (Optional) **Yarn** — only if you prefer it over npm

---

## Project Structure

---

## Frontend Setup (React)

1. Open terminal and navigate to the frontend folder:

````bash
cd frontend

2. Install dependencies

```bash
npm install

Note: There may be a peer dependency issue with date-fns and react-day-picker. If you encounter an error like:
Could not resolve dependency: peer date-fns@"^2.28.0 || ^3.0.0" from react-day-picker@8.10.1
run:

```bash
npm install date-fns@^3
npm install

3. Start the development server:

```bash
npm start


````

---

## Backend Setup (Python)

1. Navigate to the backend folder:

````bash
cd backend

2. Create a Python virtual environment:

```bash
python3 -m venv venv

3. Activate the virtual environment:

macOS / Linux:

```bash
source venv/bin/activate

Windows (PowerShell):

```powershell
venv\Scripts\Activate.ps1

4. Install dependencies:

```bash
pip install -r requirements.txt

Note: If you see an error like:
Could not find a version that satisfies the requirement emergentintegrations==0.1.0
This package is not on PyPI. You can safely comment out or remove this line in requirements.txt:
# emergentintegrations==0.1.0 // comment
Then re-run:

```bash
pip install -r requirements.txt

5. Run the backend server:

```bash
python3 server.py

````

---

# Common Issues

Node/npm errors: Use npm install --legacy-peer-deps if dependencies fail due to peer conflicts.

Backend Python package missing: Make sure your virtual environment is activated.

Port conflicts: Ensure frontend (3000) and backend (5000) ports are free.

# Emergent App - MongoDB Setup and Database Seeding

This project demonstrates how to set up a local MongoDB database on macOS, connect via Python using `motor` (async MongoDB driver), seed the database with initial data, and verify the data using both terminal and GUI tools.

---

## Project Structure

backend/
├── seed_data.py
├── test_mongo.py
├── venv/
├── .env

-   `seed_data.py` → Script to seed the database with users and products.
-   `test_mongo.py` → Script to test the MongoDB connection.
-   `.env` → Environment variables (MongoDB URL, DB name, JWT secret, etc.).
-   `venv/` → Python virtual environment (isolated dependencies).

# Environment Setup (macOS)

## Ensure MongoDB is installed

1. Check installation:

```bash
brew list | grep mongo
If MongoDB is not installed:

bash
brew tap mongodb/brew
brew install mongodb-community@7.0
Start MongoDB:

bash
brew services start mongodb-community@7.0
brew services list
MongoDB server should show started.
```

2. Create virtual environment:

python3 -m venv venv

Activate it:
source venv/bin/activate

pip install motor "passlib[bcrypt]" python-dotenv bcrypt

---

### 3️⃣ `TEST_CONNECTION.md` — Test MongoDB Connection

````markdown
# Test MongoDB Connection

Create `test_mongo.py`:

```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_connection():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    dbs = await client.list_database_names()
    print("Databases:", dbs)

if __name__ == "__main__":
    asyncio.run(test_connection())

Run the script:
python test_mongo.py


Expected output:

Databases: ['admin', 'config', 'local', 'test_database']

This confirms MongoDB is running and reachable.
```
````

### 4️⃣ `SEED_DATABASE.md` — Seed Database

Run Seed Database

python seed_data.py

---

### 5️⃣ `VIEW_DATABASE.md` — View Database

````markdown
# View Database

## Using Mongo Shell

```bash
mongosh
use test_database
show collections
db.users.find().pretty()
db.products.find().pretty()
```
````
