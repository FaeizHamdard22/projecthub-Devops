import Task from "../models/Task.js";
import Project from "../models/Project.js";

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const {
      title,
      description,
      assignedTo,
      status = "todo",
      priority = "medium",
      dueDate,
      labels = [],
      estimatedHours
    } = req.body;

    // Check if user has access to this project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { team: userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found or no access" });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || [],
      createdBy: userId,
      status,
      priority,
      dueDate,
      labels,
      estimatedHours
    });

    // Populate user info
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask
    });

  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
};

// Get all tasks for a project
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Verify project access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { team: userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found or no access" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);

  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project._id,
      $or: [
        { owner: userId },
        { team: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({ error: "No access to this task" });
    }

    res.json(task);

  } catch (err) {
    console.error("Get task error:", err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: userId },
        { team: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({ error: "No access to update this task" });
    }

    // If marking as done, set completedAt
    if (updateData.status === "done" && task.status !== "done") {
      updateData.completedAt = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json({
      message: "Task updated successfully",
      task: updatedTask
    });

  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if user is project owner or task creator
    const project = await Project.findOne({
      _id: task.project,
      owner: userId
    });

    if (!project && task.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({ message: "Task deleted successfully" });

  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

// Get task statistics for a project
export const getTaskStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Verify project access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { team: userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found or no access" });
    }

    const stats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalHours: { $sum: "$estimatedHours" }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
      total: 0,
      totalHours: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      formattedStats.totalHours += stat.totalHours || 0;
    });

    res.json(formattedStats);

  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ error: "Failed to fetch task statistics" });
  }
};

// Add comment to task
export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check project access
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: userId },
        { team: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({ error: "No access to this task" });
    }

    task.comments.push({
      user: userId,
      text: text.trim()
    });

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("comments.user", "name email")
      .populate("assignedTo", "name email");

    res.json({
      message: "Comment added successfully",
      task: updatedTask
    });

  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};
