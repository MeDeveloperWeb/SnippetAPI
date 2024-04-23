import express from "express";
import passport from "passport";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config/dbConnection.js";
import usePassport from "./config/passportConfig.js";
import errorHandler from "./middleware/errorHandler.js";
import userRouter from "./routes/userRoutes.js";
import snippetRouter from "./routes/snippetRoutes.js";
import cors from "cors";

configDotenv();

// Connect to the database
connectDb();

const corsOptions = {
	origin: process.env.UI_URL,
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	credentials: true,
};

const app = express();

const port = process.env.PORT || 5000;

app.use(cors(corsOptions));

// For getting json data in req.body
app.use(express.json());
// For working with frontend cookies
app.use(cookieParser());

// Initializing Passport
app.use(passport.initialize());

// Using Passport library
usePassport();

app.use("/api/users", userRouter);
app.use("/api/snippet", snippetRouter);

app.use(errorHandler);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
