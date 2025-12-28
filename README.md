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
