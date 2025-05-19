import express from "express";
const router = express.Router();

import others from "../controller/others.js";
import { deleteNotification } from "../controller/notification.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.get('/getCalendarData', others.getcalender);
router.delete("/notifications/chat/:chatId", authMiddleware.authenticateJWT, deleteNotification);

export default router;
