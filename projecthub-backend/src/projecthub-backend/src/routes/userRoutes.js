import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";

const router = Router();

// گرفتن اطلاعات کاربر جاری
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "کاربر یافت نشد" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "خطای سرور" });
  }
});

export default router;
