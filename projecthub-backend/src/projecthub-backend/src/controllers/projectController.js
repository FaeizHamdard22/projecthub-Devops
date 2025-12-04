import Project from "../models/Project.js";
import Task from "../models/Task.js";

// ایجاد پروژه جدید
export const createProject = async (req, res) => {
  try {
    const { name, description, color, endDate, tags } = req.body;
    const owner = req.userId;

    const project = await Project.create({
      name,
      description,
      owner,
      color,
      endDate,
      tags
    });

    res.status(201).json({
      message: "پروژه با موفقیت ایجاد شد",
      project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطا در ایجاد پروژه" });
  }
};

// دریافت تمام پروژه‌های کاربر
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.userId;
    
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { team: userId }
      ]
    })
    .populate("owner", "name email")
    .populate("team", "name email")
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطا در دریافت پروژه‌ها" });
  }
};

// دریافت پروژه خاص
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { team: userId }
      ]
    })
    .populate("owner", "name email")
    .populate("team", "name email");

    if (!project) {
      return res.status(404).json({ error: "پروژه یافت نشد" });
    }

    // تعداد تسک‌های هر وضعیت
    const taskStats = await Task.aggregate([
      {
        $match: { project: project._id }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      project,
      stats: taskStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطا در دریافت پروژه" });
  }
};

// آپدیت پروژه
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    // فقط مالک می‌تواند پروژه را آپدیت کند
    const project = await Project.findOneAndUpdate(
      { _id: projectId, owner: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: "پروژه یافت نشد یا دسترسی ندارید" });
    }

    res.json({
      message: "پروژه با موفقیت آپدیت شد",
      project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطا در آپدیت پروژه" });
  }
};

// حذف پروژه
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // فقط مالک می‌تواند پروژه را حذف کند
    const project = await Project.findOneAndDelete({
      _id: projectId,
      owner: userId
    });

    if (!project) {
      return res.status(404).json({ error: "پروژه یافت نشد یا دسترسی ندارید" });
    }

    // حذف تمام تسک‌های مربوطه
    await Task.deleteMany({ project: projectId });

    res.json({
      message: "پروژه و تسک‌های مربوطه حذف شدند"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطا در حذف پروژه" });
  }
};

// اضافه کردن عضو به تیم پروژه
export const addTeamMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId: memberId } = req.body;
    const ownerId = req.userId;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, owner: ownerId },
      { $addToSet: { team: memberId } },
      { new: true }
    ).populate("team", "name email");

    if (!project) {
      return res.status(404).json({ error: "پروژه یافت نشد یا دسترسی ندارید" });
    }

    res.json({
      message: "عضو به تیم اضافه شد",
      project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطا در اضافه کردن عضو" });
  }
};

// حذف عضو از تیم پروژه
export const removeTeamMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const ownerId = req.userId;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, owner: ownerId },
      { $pull: { team: memberId } },
      { new: true }
    ).populate("team", "name email");

    if (!project) {
      return res.status(404).json({ error: "پروژه یافت نشد یا دسترسی ندارید" });
    }

    res.json({
      message: "عضو از تیم حذف شد",
      project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطا در حذف عضو" });
  }
};
