const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/:employeeId", getNotifications);
router.patch("/:id/read", markNotificationAsRead);
router.patch("/:employeeId/read-all", markAllNotificationsAsRead);
router.get("/:employeeId/unread-count", getUnreadNotificationCount);
router.delete("/:id", deleteNotification);

module.exports = router;
