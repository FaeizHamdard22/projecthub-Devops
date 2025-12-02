import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  MoreVertical,
  User,
  Clock,
  Flag,
  MessageSquare,
  Paperclip,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

function TaskList() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], review: [], done: [] });
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    estimatedHours: ""
  });
  const navigate = useNavigate();

  const statusConfig = {
    todo: { title: "To Do", icon: <Circle size={16} />, color: "#6b7280" },
    in_progress: { title: "In Progress", icon: <Clock size={16} />, color: "#f59e0b" },
    review: { title: "Review", icon: <AlertCircle size={16} />, color: "#8b5cf6" },
    done: { title: "Done", icon: <CheckCircle size={16} />, color: "#10b981" }
  };

  const priorityConfig = {
    low: { label: "Low", color: "#10b981" },
    medium: { label: "Medium", color: "#f59e0b" },
    high: { label: "High", color: "#ef4444" },
    urgent: { label: "Urgent", color: "#dc2626" }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch project
      const projectRes = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData.project);
      }

      // Fetch tasks
      const tasksRes = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        organizeTasksByStatus(tasksData);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const organizeTasksByStatus = (tasks) => {
    const organized = { todo: [], in_progress: [], review: [], done: [] };
    tasks.forEach(task => {
      if (organized[task.status]) {
        organized[task.status].push(task);
      }
    });
    setTasks(organized);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newTask)
      });

      if (res.ok) {
        const data = await res.json();
        // Add new task to the appropriate column
        setTasks(prev => ({
          ...prev,
          [newTask.status]: [data.task, ...prev[newTask.status]]
        }));
        setShowCreateModal(false);
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          estimatedHours: ""
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Update local state
        const allTasks = Object.values(tasks).flat();
        const task = allTasks.find(t => t._id === taskId);
        
        if (task) {
          // Remove from old column
          const oldStatus = task.status;
          setTasks(prev => ({
            ...prev,
            [oldStatus]: prev[oldStatus].filter(t => t._id !== taskId),
            [newStatus]: [{ ...task, status: newStatus }, ...prev[newStatus]]
          }));
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={styles.title}>{project?.name || "Tasks"}</h1>
            <p style={styles.subtitle}>Kanban Board</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div style={styles.kanbanBoard}>
        {Object.entries(statusConfig).map(([status, config]) => (
          <div
            key={status}
            style={styles.kanbanColumn}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
          >
            <div style={styles.columnHeader}>
              <div style={styles.columnTitle}>
                <span style={{ color: config.color, marginRight: "8px" }}>
                  {config.icon}
                </span>
                <span>{config.title}</span>
              </div>
              <span style={styles.columnCount}>{tasks[status]?.length || 0}</span>
            </div>

            <div style={styles.columnContent}>
              {tasks[status]?.map(task => (
                <div
                  key={task._id}
                  style={styles.taskCard}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                >
                  <div style={styles.taskHeader}>
                    <h4 style={styles.taskTitle}>{task.title}</h4>
                    <button style={styles.taskMenu}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <p style={styles.taskDescription}>
                    {task.description || "No description"}
                  </p>

                  <div style={styles.taskMeta}>
                    <div style={{
                      ...styles.priorityBadge,
                      background: priorityConfig[task.priority]?.color + "20",
                      color: priorityConfig[task.priority]?.color
                    }}>
                      <Flag size={12} />
                      <span>{priorityConfig[task.priority]?.label}</span>
                    </div>
                    
                    {task.estimatedHours && (
                      <div style={styles.timeEstimate}>
                        <Clock size={12} />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.taskFooter}>
                    <div style={styles.assignees}>
                      {task.assignedTo?.slice(0, 2).map(user => (
                        <div key={user._id} style={styles.assigneeAvatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {task.assignedTo?.length > 2 && (
                        <div style={styles.moreAssignees}>
                          +{task.assignedTo.length - 2}
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.taskActions}>
                      {task.comments?.length > 0 && (
                        <div style={styles.commentCount}>
                          <MessageSquare size={12} />
                          <span>{task.comments.length}</span>
                        </div>
                      )}
                      {task.attachments?.length > 0 && (
                        <div style={styles.attachmentCount}>
                          <Paperclip size={12} />
                          <span>{task.attachments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks[status]?.length === 0 && (
                <div style={styles.emptyColumn}>
                  <p style={styles.emptyText}>No tasks here</p>
                  <p style={styles.emptyHint}>Drag tasks here or create new ones</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>Create New Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div style={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description"
                  rows="3"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    style={styles.select}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    style={styles.select}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label>Estimated Hours (optional)</label>
                <input
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                  placeholder="e.g., 4"
                  min="0"
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "24px"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    color: "#111827"
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "4px"
  },
  createButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  kanbanBoard: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    height: "calc(100vh - 180px)"
  },
  kanbanColumn: {
    background: "white",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  columnHeader: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  columnTitle: {
    display: "flex",
    alignItems: "center",
    fontWeight: "600",
    fontSize: "14px",
    color: "#111827"
  },
  columnCount: {
    background: "#e5e7eb",
    borderRadius: "12px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "500"
  },
  columnContent: {
    padding: "20px",
    flex: 1,
    overflowY: "auto"
  },
  taskCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px"
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
    color: "#111827",
    flex: 1
  },
  taskMenu: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "#6b7280"
  },
  taskDescription: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 12px 0",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  taskMeta: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px"
  },
  priorityBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "500"
  },
  timeEstimate: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    background: "#f3f4f6",
    borderRadius: "12px",
    fontSize: "11px",
    color: "#6b7280"
  },
  taskFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  assignees: {
    display: "flex"
  },
  assigneeAvatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
    marginLeft: "-4px",
    border: "2px solid white"
  },
  moreAssignees: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#e5e7eb",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
    marginLeft: "-4px",
    border: "2px solid white"
  },
  taskActions: {
    display: "flex",
    gap: "8px"
  },
  commentCount: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#6b7280"
  },
  attachmentCount: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#6b7280"
  },
  emptyColumn: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#9ca3af",
    fontSize: "14px"
  },
  emptyText: {
    margin: "0 0 8px 0",
    fontWeight: "500"
  },
  emptyHint: {
    margin: 0,
    fontSize: "12px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "white",
    borderRadius: "12px",
    padding: "32px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    fontSize: "14px",
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
    minHeight: "80px"
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    background: "white",
    cursor: "pointer"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px"
  },
  cancelButton: {
    padding: "10px 20px",
    border: "1px solid #d1d5db",
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  submitButton: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  }
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default TaskList;
