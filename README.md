# KGL Shades

Personal e-commerce project.

## Backend setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and set the MongoDB connection string:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   ```

   Use a local connection string instead if MongoDB is running locally:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/kgl-shades
   ```

3. Start the backend:

   ```bash
   npm run dev
   ```

`MONGODB_URI` is required. The server exits with a clear configuration error when it
is missing instead of passing an undefined value to Mongoose.
