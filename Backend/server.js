import { connectDB } from "./db/db.js";
import { app } from "./src/app.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5001;
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
