# LifeOS — MongoDB Integration

This adds a full Node/Express + Mongoose backend (`server/`) backed by **MongoDB Atlas**, and rewires every page in `client/` to use it instead of `localStorage`/mock state.

## 1. Create your MongoDB Atlas cluster

1. Sign up / log in at https://www.mongodb.com/cloud/atlas
2. Create a free (M0) cluster.
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for development access from anywhere — tighten this before going to production).
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add your database name (`lifeos`) right before the `?`:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lifeos?retryWrites=true&w=majority
   ```

## 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lifeos?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
PORT=5000
```

Generate a `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Install and run:
```bash
npm install
npm run dev      # requires nodemon, or: npm start
```

You should see:
```
MongoDB connected: <cluster host>
Server running on port 5000
```

## 3. Run the client

In a separate terminal:
```bash
cd client
npm install
npm run dev
```

The client is already pointed at `http://localhost:5000/api` in `src/services/api.js`.

## What changed

- **`server/`** — new Express API:
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` — JWT-based auth, passwords hashed with bcrypt
  - `GET/POST /api/finance`, `/api/finance/transactions` — balance + transactions
  - `GET/PATCH /api/health` — water, workout, calories, heart rate, hydration reminder
  - `GET/POST/PATCH /api/travel` — trips
  - `GET/POST/PATCH /api/study` — pomodoro tasks + streak
  - `GET/POST/PATCH /api/shopping` — wishlist items + budget cap
  - `GET/POST /api/calendar` — events
  - `GET/PATCH /api/email` — inbox
  - Every route (except register/login) requires `Authorization: Bearer <token>` and only reads/writes data belonging to the logged-in user.
  - On registration, each user gets seeded defaults (starting balance, health doc, streak, budget cap, welcome email).

- **`client/src/services/api.js`** — now attaches the JWT from `localStorage` to every request, and redirects to `/login` on a 401.
- **`client/src/pages/Login.jsx` & `Register.jsx`** — call the real API and store the returned token instead of faking auth.
- **`client/src/pages/{Finance,Health,Travel,Study,Shopping,Calendar,Email,Dashboard}.jsx`** — all fetch from and write to the API instead of local component state / `localStorage`.
- **`client/src/components/Navbar.jsx`** — logout now also clears the stored token.

## Notes

- MongoDB Atlas was chosen, so there's no local Mongo install step — just the connection string above.
- Passwords are hashed with bcrypt before being stored; plaintext passwords are never saved.
- If you'd rather run MongoDB locally instead, just swap `MONGO_URI` in `.env` for `mongodb://localhost:27017/lifeos` — no other code changes needed.
