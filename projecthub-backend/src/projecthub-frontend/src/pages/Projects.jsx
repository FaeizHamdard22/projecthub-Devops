import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Calendar, Clock, MoreVertical, Trash2, Edit, Archive } from "lucide-react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", color: "#3b82f6" });
  const navigate = useNavigate();

  // دریافت پروژه‌ها از API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      console.log("🔑 Token from localStorage:", token ? token.substring(0, 20) + "..." : "MISSING");
      
      if (!token) {
        console.log("❌ No token, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("🌐 Fetching from: http://192.168.56.10:5000/api/projects");
      
      const res = await fetch("http://192.168.56.10:5000/api/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log("📊 Response status:", res.status, "ok:", res.ok);
      
      if (res.status === 401) {
        console.log("🔒 Token invalid, clearing storage");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`خطا در دریافت پروژه‌ها (کد: ${res.status})`);
      }

      const data = await res.json();
      console.log("✅ Projects received:", data.length, "items");
      setProjects(data);
      
    } catch (err) {
      console.error("🔥 Fetch error:", err);
      setError(err.message || "خطا در ارتباط با سرور");
      
      // تست مستقیم API
      testDirectAPI();
    } finally {
      setLoading(false);
    }
  };

  // تست مستقیم API از مرورگر
  const testDirectAPI = async () => {
    const token = localStorage.getItem("token");
    console.log("🧪 Testing API directly...");
    
    try {
      // تست با fetch ساده
      const testRes = await fetch("http://localhost:5000/api/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log("🧪 Localhost test status:", testRes.status);
      
      // تست دیگر آدرس
      const testRes2 = await fetch("http://192.168.56.10:5000/api/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log("🧪 IP test status:", testRes2.status);
      
    } catch (testErr) {
      console.error("🧪 Direct test error:", testErr);
    }
  };

  useEffect(() => {
    console.log("🚀 Projects component mounted");
    fetchProjects();
  }, [navigate]);

  // ایجاد پروژه جدید
  const handleCreateProject = async (e) => {
    e.preventDefault();
    console.log("📝 Creating project:", newProject);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://192.168.56.10:5000/api/projects", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProject)
      });

      console.log("📤 Create response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Create error:", errorData);
        throw new Error(errorData.error || "خطا در ایجاد پروژه");
      }

      const data = await res.json();
      console.log("✅ Project created:", data);
      
      setProjects([data.project, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: "", description: "", color: "#3b82f6" });
      setError("");
      
    } catch (err) {
      console.error("🔥 Create project error:", err);
      setError(err.message);
    }
  };

  // حذف پروژه
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    
    console.log("🗑️ Deleting project:", projectId);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://192.168.56.10:5000/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("خطا در حذف پروژه");
      }

      setProjects(projects.filter(p => p._id !== projectId));
      console.log("✅ Project deleted");
      
    } catch (err) {
      console.error("❌ Delete error:", err);
      setError(err.message);
    }
  };

  // رفرش دستی
  const handleRefresh = () => {
    console.log("🔄 Manual refresh");
    fetchProjects();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
          در حال بارگذاری پروژه‌ها...
          <button 
            onClick={handleRefresh}
            style={{ 
              marginTop: "20px", 
              padding: "8px 16px", 
              background: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* هدر */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>پروژه‌های من</h1>
          <p style={styles.subtitle}>{projects.length} پروژه</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={handleRefresh}
            style={styles.refreshButton}
            title="رفرش"
          >
            🔄
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={styles.createButton}
          >
            <Plus size={20} />
            <span>پروژه جدید</span>
          </button>
        </div>
      </div>

      {/* دیباگ اطلاعات */}
      <div style={styles.debugInfo}>
        <button 
          onClick={() => {
            const token = localStorage.getItem("token");
            console.log("🔍 Debug Info:");
            console.log("- Token:", token);
            console.log("- Projects count:", projects.length);
            console.log("- API URL:", "http://192.168.56.10:5000/api/projects");
          }}
          style={styles.debugButton}
        >
          🔍 دیباگ
        </button>
        <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "10px" }}>
          Token: {localStorage.getItem("token") ? "✓" : "✗"} | 
          Projects: {projects.length}
        </span>
      </div>

      {/* پیغام خطا */}
      {error && (
        <div style={styles.error}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {error}</span>
            <button 
              onClick={() => setError("")}
              style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* لیست پروژه‌ها */}
      <div style={styles.grid}>
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📁</div>
            <h3>هنوز پروژه‌ای ندارید</h3>
            <p>اولین پروژه خود را ایجاد کنید و مدیریت آن را شروع کنید</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setShowCreateModal(true)}
                style={styles.emptyButton}
              >
                ایجاد پروژه جدید
              </button>
              <button
                onClick={handleRefresh}
                style={{ ...styles.emptyButton, background: "#6b7280" }}
              >
                بروزرسانی
              </button>
            </div>
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project._id}
              style={{...styles.projectCard, borderLeft: `5px solid ${project.color}`}}
              onClick={() => {
                console.log("➡️ Navigating to project:", project._id);
                navigate(`/projects/${project._id}`);
              }}
            >
              <div style={styles.projectHeader}>
                <h3 style={styles.projectName}>{project.name}</h3>
                <div style={styles.projectActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project._id);
                    }}
                    style={styles.actionButton}
                    title="حذف پروژه"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p style={styles.projectDescription}>
                {project.description || "بدون توضیحات"}
              </p>

              <div style={styles.projectMeta}>
                <div style={styles.metaItem}>
                  <Users size={14} />
                  <span>{project.team?.length + 1 || 1} نفر</span>
                </div>
                <div style={styles.metaItem}>
                  <Calendar size={14} />
                  <span>
                    {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div style={{
                  ...styles.statusBadge,
                  background: project.status === 'active' ? '#d1fae5' :
                             project.status === 'completed' ? '#dbeafe' : '#f3f4f6',
                  color: project.status === 'active' ? '#065f46' :
                        project.status === 'completed' ? '#1e40af' : '#6b7280'
                }}>
                  {project.status === 'active' ? 'فعال' :
                   project.status === 'completed' ? 'تکمیل شده' : 'آرشیو'}
                </div>
              </div>
              
              <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "10px" }}>
                ID: {project._id.substring(0, 8)}...
              </div>
            </div>
          ))
        )}
      </div>

      {/* مودال ایجاد پروژه */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={styles.modalTitle}>ایجاد پروژه جدید</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div style={styles.formGroup}>
                <label style={styles.label}>نام پروژه *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  style={styles.input}
                  placeholder="مثلاً: توسعه وبسایت شرکت"
                  required
                  autoFocus
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>توضیحات</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  style={styles.textarea}
                  placeholder="توضیحات مختصر درباره پروژه..."
                  rows="3"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>رنگ پروژه</label>
                <div style={styles.colorPicker}>
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        console.log("🎨 Color selected:", color);
                        setNewProject({...newProject, color});
                      }}
                      style={{
                        ...styles.colorOption,
                        background: color,
                        border: newProject.color === color ? '3px solid #333' : '1px solid #d1d5db',
                        transform: newProject.color === color ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={!newProject.name.trim()}
                >
                  {loading ? "در حال ایجاد..." : "ایجاد پروژه"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// استایل‌ها
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    minHeight: "80vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0
  },
  subtitle: {
    color: "#6b7280",
    marginTop: "5px",
    fontSize: "14px"
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
    fontWeight: "500",
    transition: "background 0.2s"
  },
  refreshButton: {
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px"
  },
  debugInfo: {
    background: "#f9fafb",
    padding: "10px 15px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb"
  },
  debugButton: {
    background: "#6b7280",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px"
  },
  projectCard: {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #e5e7eb"
  },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px"
  },
  projectName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937"
  },
  projectDescription: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "15px",
    lineHeight: "1.5",
    minHeight: "40px"
  },
  projectMeta: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "12px",
    color: "#6b7280",
    flexWrap: "wrap"
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px"
  },
  statusBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500"
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 20px",
    background: "#f9fafb",
    borderRadius: "10px",
    border: "2px dashed #d1d5db"
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "20px"
  },
  emptyButton: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
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
    borderRadius: "10px",
    padding: "30px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  modalTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    color: "#1f2937"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border 0.2s"
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit"
  },
  colorPicker: {
    display: "flex",
    gap: "10px",
    justifyContent: "center"
  },
  colorOption: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.2s"
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "30px"
  },
  cancelButton: {
    padding: "10px 20px",
    border: "1px solid #d1d5db",
    background: "white",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#374151",
    transition: "background 0.2s"
  },
  submitButton: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px 15px",
    borderRadius: "6px",
    marginBottom: "20px",
    border: "1px solid #fecaca"
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6b7280",
    fontSize: "16px"
  },
  projectActions: {
    display: "flex",
    gap: "5px"
  },
  actionButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    color: "#6b7280",
    borderRadius: "4px",
    transition: "background 0.2s"
  }
};

export default Projects;
