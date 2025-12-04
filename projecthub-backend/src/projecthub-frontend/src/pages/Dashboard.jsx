import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("📊 Fetching dashboard data...");

      // 1. Fetch user profile
      const userRes = await fetch("http://localhost:5000/api/users/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!userRes.ok) throw new Error("Failed to fetch profile");
      const userData = await userRes.json();
      setUser(userData);

      // 2. Fetch projects
      const projectsRes = await fetch("http://localhost:5000/api/projects", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        
        // Calculate stats
        const active = projectsData.filter(p => p.status === "active").length;
        const completed = projectsData.filter(p => p.status === "completed").length;
        setStats({
          total: projectsData.length,
          active,
          completed
        });
      }

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <LayoutDashboard size={28} style={styles.logo} />
          <div>
            <h1 style={styles.title}>ProjectHub Dashboard</h1>
            <p style={styles.subtitle}>Manage your projects and teams</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p style={styles.userName}>{user?.name || "User"}</p>
              <p style={styles.userEmail}>{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={styles.logoutButton}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: "#3b82f6"}}>
            <FolderKanban size={24} />
          </div>
          <div>
            <h3 style={styles.statNumber}>{stats.total}</h3>
            <p style={styles.statLabel}>Total Projects</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: "#10b981"}}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={styles.statNumber}>{stats.active}</h3>
            <p style={styles.statLabel}>Active</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: "#8b5cf6"}}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 style={styles.statNumber}>{stats.completed}</h3>
            <p style={styles.statLabel}>Completed</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: "#f59e0b"}}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={styles.statNumber}>0</h3>
            <p style={styles.statLabel}>Team Members</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Column - Quick Actions */}
        <div style={styles.leftColumn}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
            <div style={styles.actionButtons}>
              <button 
                onClick={() => navigate("/projects")}
                style={styles.actionButton}
              >
                <FolderKanban size={20} />
                <span>View All Projects</span>
              </button>
              
              <button 
                onClick={() => navigate("/projects?new=true")}
                style={styles.actionButton}
              >
                <PlusCircle size={20} />
                <span>Create New Project</span>
              </button>
              
              <button 
                onClick={() => alert("Coming soon!")}
                style={styles.actionButton}
              >
                <Users size={20} />
                <span>Invite Team Members</span>
              </button>
              
              <button 
                onClick={() => alert("Coming soon!")}
                style={styles.actionButton}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent Activity</h3>
            <div style={styles.activityList}>
              <div style={styles.activityItem}>
                <AlertCircle size={16} style={{ color: "#3b82f6" }} />
                <span>Welcome to ProjectHub! Start by creating your first project.</span>
              </div>
              {projects.length > 0 && (
                <div style={styles.activityItem}>
                  <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                  <span>You have {projects.length} project(s) in your account.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Projects */}
        <div style={styles.rightColumn}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Recent Projects</h3>
              <button 
                onClick={() => navigate("/projects")}
                style={styles.viewAllButton}
              >
                View All →
              </button>
            </div>
            
            {projects.length === 0 ? (
              <div style={styles.emptyState}>
                <FolderKanban size={48} style={{ color: "#9ca3af", marginBottom: "16px" }} />
                <h4>No projects yet</h4>
                <p style={styles.emptyText}>Create your first project to get started</p>
                <button 
                  onClick={() => navigate("/projects")}
                  style={styles.primaryButton}
                >
                  <PlusCircle size={20} />
                  Create Project
                </button>
              </div>
            ) : (
              <div style={styles.projectsList}>
                {projects.slice(0, 4).map(project => (
                  <div 
                    key={project._id}
                    style={styles.projectCard}
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div 
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: project.color || "#3b82f6"
                        }}
                      />
                      <div>
                        <h4 style={styles.projectName}>{project.name}</h4>
                        <p style={styles.projectDescription}>
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div style={styles.projectMeta}>
                      <span style={{
                        ...styles.statusBadge,
                        background: project.status === 'active' ? '#d1fae5' : 
                                   project.status === 'completed' ? '#dbeafe' : '#f3f4f6',
                        color: project.status === 'active' ? '#065f46' : 
                              project.status === 'completed' ? '#1e40af' : '#6b7280'
                      }}>
                        {project.status}
                      </span>
                      <span style={styles.date}>
                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          ProjectHub v1.0 • {new Date().getFullYear()} • 
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              console.log("Token:", localStorage.getItem("token"));
              console.log("User:", user);
              console.log("Projects:", projects);
            }}
            style={styles.debugLink}
          >
            Debug Info
          </a>
        </p>
      </div>
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
    height: "100vh",
    color: "#6b7280"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  logo: {
    color: "#3b82f6"
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    margin: 0
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "4px"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "16px"
  },
  userName: {
    fontWeight: "600",
    margin: 0,
    fontSize: "14px",
    color: "#111827"
  },
  userEmail: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280"
  },
  logoutButton: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    color: "#6b7280",
    transition: "background 0.2s"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "32px"
  },
  statCard: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.2s"
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white"
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    color: "#111827"
  },
  statLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px"
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "32px",
    marginBottom: "32px"
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  section: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#111827"
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "14px",
    color: "#374151",
    transition: "background 0.2s"
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  activityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: "1.5"
  },
  viewAllButton: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    padding: "0"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px"
  },
  emptyText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "8px 0 24px 0"
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    margin: "0 auto"
  },
  projectsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  projectCard: {
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  projectName: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 4px 0",
    color: "#111827"
  },
  projectDescription: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.4"
  },
  projectMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px"
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500"
  },
  date: {
    fontSize: "12px",
    color: "#6b7280"
  },
  footer: {
    textAlign: "center",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: "14px"
  },
  footerText: {
    margin: 0
  },
  debugLink: {
    color: "#3b82f6",
    marginLeft: "8px",
    cursor: "pointer",
    textDecoration: "none"
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

export default Dashboard;
