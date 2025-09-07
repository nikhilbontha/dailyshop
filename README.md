# Full-stack E-commerce Project (modified)

This project has backend (Node.js + Express) and a frontend (React + Vite scaffold) added.

## What I changed
- Removed `node_modules` (don't commit it).
- Hardened `app.js` with `helmet`, `cors`, rate limiting, a simple env check, and a global error handler.
- Added `frontend/` (Vite + React) with simple pages: Home, Product, Cart, Checkout, Login.
- Created `.env.example` earlier (if not present).

## Run locally (backend + frontend)
1. Fill environment variables:
   - Copy `.env.example` to `.env` and fill values (MONGO_URI, PORT, RAZORPAY keys etc.)

2. Install backend deps and run:
```bash
cd <project_root>
npm install
npm run dev   # or npm start
```

3. In a separate terminal, run the frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend dev server will proxy API calls to the backend if you configure it (or use absolute URLs).

## Notes
- I didn't install packages in this environment (no node_modules included). Run `npm install` locally.
- Payment flow requires backend endpoints (`/api/payment/order`) to exist and return order details.

