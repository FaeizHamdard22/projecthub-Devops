import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
} from "../controllers/projectController.js";

const router = Router();

// همه routeها نیاز به احراز هویت دارند
router.use(verifyToken);

// پروژه‌ها
router.post("/", createProject);
router.get("/", getUserProjects);
router.get("/:projectId", getProjectById);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

// مدیریت تیم
router.post("/:projectId/team", addTeamMember);
router.delete("/:projectId/team/:memberId", removeTeamMember);

export default router;
