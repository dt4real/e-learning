import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel, { ICourse } from "../models/course.model";
import sendMail from "../utils/sendMail";
import { redis } from "../utils/redis";
import NotificationModel from "../models/notification.model";


// create order
export const createOrder = CatchAsyncError(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { courseId, payment_info } = req.body as IOrder;

			const user = await userModel.findById(req.user?._id);

			const courseExistInUser = user?.courses.some(
				(course: any) => course._id.toString() === courseId
			);

			if (courseExistInUser) {
				return next(
					new ErrorHandler("You have already purchased this course", 400)
				);
			}

			const course: ICourse | null = await CourseModel.findById(courseId);

			if (!course) {
				return next(new ErrorHandler("Course not found", 404));
			}

			const data: any = {
				courseId: course._id,
				userId: user?._id,
				payment_info,
			};

			const mailData = {
				order: {
					_id: course._id.toString().slice(0, 6),
					name: course.name,
					price: course.price,
					date: new Date().toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
				},
			};

			try {
				if (user) {
					await sendMail({
						email: user.email,
						subject: "Order Confirmation",
						template: "order-confirmation.ejs",
						data: mailData,
					});
				}
			} catch (error: any) {
				return next(new ErrorHandler(error.message, 500));
			}

			user?.courses.push(course?._id);

			await redis.set(req.user?._id, JSON.stringify(user));

			await user?.save();

			await NotificationModel.create({
				user: user?._id,
				title: "New Order",
				message: `You have a new order from ${course?.name}`,
			});

			course.purchased = course.purchased + 1;

			await course.save();

			const order = await OrderModel.create(data);

			res.status(201).json({
				succcess: true,
				order,
			})
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// get All orders --- only for admin
export const getAllOrders = CatchAsyncError(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const orders = await OrderModel.find().sort({ createdAt: -1 });

			res.status(201).json({
				success: true,
				orders,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);
