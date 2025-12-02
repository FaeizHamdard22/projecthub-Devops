import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  addComment
} from "../controllers/taskController.js";

const router = Router();

router.use(verifyToken);

// Project tasks
router.post("/projects/:projectId/tasks", createTask);
router.get("/projects/:projectId/tasks", getProjectTasks);
router.get("/projects/:projectId/tasks/stats", getTaskStats);

// Single task operations
router.get("/tasks/:taskId", getTaskById);
router.put("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);

// Comments
router.post("/tasks/:taskId/comments", addComment);

export default router;
