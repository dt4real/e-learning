import { Router } from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controllers/notifcation.controller";

const notificationRoute = Router();

notificationRoute.get(
	"/get-all-notifications",
	isAutheticated,
	authorizeRoles("admin"),
	getNotifications
);

notificationRoute.put("/update-notification/:id", isAutheticated, authorizeRoles("admin"), updateNotification);

export default notificationRoute;