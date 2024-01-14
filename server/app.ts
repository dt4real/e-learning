require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import notificationRoute from "./routes/notification.route";
import orderRouter from "./routes/order.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
export const app = express();

// body parser
app.use(express.json({limit: "50mb"}));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(cors({
	origin: process.env.ORIGIN
}));

// api routes
app.use("/api/v1/", userRouter, courseRouter, notificationRoute, orderRouter, analyticsRouter, layoutRouter);

// testing api
app.get("/test", (req:Request, res:Response, next:NextFunction) => {
	res.status(200).json({
		success: true,
		message: "API is working"
	});
});

// unknown route
app.all("*", (req:Request, res:Response, next:NextFunction) => {
	const err = new Error(`Route ${req.originalUrl} not found.`) as any;
	err.statusCode = 404;
	next(err);
});

// middleware calls
app.use(ErrorMiddleware);