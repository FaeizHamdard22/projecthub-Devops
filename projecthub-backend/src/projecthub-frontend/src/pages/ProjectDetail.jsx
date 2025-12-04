import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  Plus,
  ListTodo,
  Clock,
  CheckCircle,
  Edit,
  MoreVertical,
  Filter,
  Search,
  Share2,
  Download,
  Eye,
  EyeOff,
  BarChart3
} from "lucide-react";

function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch project with stats
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Project not found");
      }

      const data = await res.json();
      setProject(data.project);
      setTaskStats(data.stats || []);

      // If we're on tasks tab, fetch tasks
      if (activeTab === "tasks") {
        fetchProjectTasks();
      }

    } catch (err) {
      console.error("Error fetching project:", err);
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const tasksData = await res.json();
        // Process tasks if needed
        console.log("Tasks loaded:", tasksData.length);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "tasks") {
      fetchProjectTasks();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const calculateCompletion = () => {
    if (!taskStats || taskStats.length === 0) return 0;
    const total = taskStats.reduce((sum, stat) => sum + stat.count, 0);
    const done = taskStats.find(stat => stat._id === "done")?.count || 0;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.errorContainer}>
        <h2>Project Not Found</h2>
        <button 
          onClick={() => navigate("/projects")}
          style={styles.backButton}
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button 
            onClick={() => navigate("/projects")}
            style={styles.backButton}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={styles.projectHeader}>
            <div style={styles.projectColorBar}></div>
            <div>
              <div style={styles.projectTitleRow}>
                <h1 style={styles.title}>{project.name}</h1>
                <div style={{
                  ...styles.statusBadge,
                  background: getStatusColor(project.status) + '20',
                  color: getStatusColor(project.status)
                }}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </div>
              </div>
              <p style={styles.description}>
                {project.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button 
            onClick={() => navigate(`/projects/${projectId}/tasks`)}
            style={styles.primaryAction}
          >
            <ListTodo size={18} />
            <span>View Tasks</span>
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={styles.iconButton}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{taskStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{calculateCompletion()}%</div>
          <div style={styles.statLabel}>Completion</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{project.team?.length + 1 || 1}</div>
          <div style={styles.statLabel}>Team Members</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>
            {formatDate(project.createdAt)}
          </div>
          <div style={styles.statLabel}>Created</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['overview', 'tasks', 'team', 'activity', 'files'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
            onClick={() => handleTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === 'overview' && (
          <div style={styles.overviewGrid}>
            {/* Left Column */}
            <div style={styles.leftColumn}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Project Details</h3>
                <div style={styles.detailList}>
                  <div style={styles.detailItem}>
                    <strong>Owner:</strong>
                    <span>{project.owner?.name || "Unknown"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Start Date:</strong>
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                  {project.endDate && (
                    <div style={styles.detailItem}>
                      <strong>End Date:</strong>
                      <span>{formatDate(project.endDate)}</span>
                    </div>
                  )}
                  <div style={styles.detailItem}>
                    <strong>Last Updated:</strong>
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Quick Actions</h3>
                <div style={styles.actionGrid}>
                  <button 
                    onClick={() => navigate(`/projects/${projectId}/tasks`)}
                    style={styles.actionCard}
                  >
                    <ListTodo size={24} />
                    <span>Manage Tasks</span>
                  </button>
                  <button 
                    onClick={() => {/* Add team member */}}
                    style={styles.actionCard}
                  >
                    <Users size={24} />
                    <span>Invite Team</span>
                  </button>
                  <button 
                    onClick={() => {/* Generate report */}}
                    style={styles.actionCard}
                  >
                    <BarChart3 size={24} />
                    <span>Reports</span>
                  </button>
                  <button 
                    onClick={() => {/* Share project */}}
                    style={styles.actionCard}
                  >
                    <Share2 size={24} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={styles.rightColumn}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Task Statistics</h3>
                  <button style={styles.iconButtonSmall}>
                    <Download size={16} />
                  </button>
                </div>
                
                {taskStats && taskStats.length > 0 ? (
                  <div style={styles.statsGrid}>
                    {taskStats.map(stat => (
                      <div key={stat._id} style={styles.statCard}>
                        <div style={styles.statCardHeader}>
                          <span style={styles.statCardTitle}>
                            {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}
                          </span>
                          <span style={styles.statCardValue}>{stat.count}</span>
                        </div>
                        <div style={styles.progressBar}>
                          <div 
                            style={{
                              ...styles.progressFill,
                              width: `${(stat.count / taskStats.reduce((sum, s) => sum + s.count, 0)) * 100}%`,
                              background: stat._id === 'done' ? '#10b981' : 
                                        stat._id === 'in_progress' ? '#f59e0b' : '#3b82f6'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <ListTodo size={32} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                    <p>No tasks created yet</p>
                    <button 
                      onClick={() => navigate(`/projects/${projectId}/tasks`)}
                      style={styles.createTaskButton}
                    >
                      <Plus size={16} />
                      Create First Task
                    </button>
                  </div>
                )}
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Recent Activity</h3>
                <div style={styles.activityList}>
                  <div style={styles.activityItem}>
                    <div style={styles.activityIcon}>
                      <Plus size={16} />
                    </div>
                    <div>
                      <p style={styles.activityText}>
                        Project created by {project.owner?.name}
                      </p>
                      <p style={styles.activityTime}>
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>
                  {project.team?.length > 0 && (
                    <div style={styles.activityItem}>
                      <div style={styles.activityIcon}>
                        <Users size={16} />
                      </div>
                      <div>
                        <p style={styles.activityText}>
                          {project.team.length} team member(s) added
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={styles.tasksTab}>
            <div style={styles.tasksHeader}>
              <h3>Project Tasks</h3>
              <button 
                onClick={() => navigate(`/projects/${projectId}/tasks`)}
                style={styles.viewAllButton}
              >
                Open Kanban Board →
              </button>
            </div>
            <p style={styles.tabHint}>
              Use the Kanban board to manage all tasks. Click the button above to open the full task management interface.
            </p>
          </div>
        )}

        {activeTab === 'team' && (
          <div style={styles.teamTab}>
            <div style={styles.sectionHeader}>
              <h3>Team Members</h3>
              <button style={styles.addButton}>
                <Plus size={16} />
                Add Member
              </button>
            </div>
            
            <div style={styles.teamList}>
              <div style={styles.teamMember}>
                <div style={styles.memberAvatar}>
                  {project.owner?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div style={styles.memberInfo}>
                  <strong>{project.owner?.name}</strong>
                  <span style={styles.memberRole}>Owner</span>
                  <span style={styles.memberEmail}>{project.owner?.email}</span>
                </div>
                <button style={styles.memberMenu}>
                  <MoreVertical size={16} />
                </button>
              </div>

              {project.team?.map(member => (
                <div key={member._id} style={styles.teamMember}>
                  <div style={styles.memberAvatar}>
                    {member.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={styles.memberInfo}>
                    <strong>{member.name}</strong>
                    <span style={styles.memberRole}>Member</span>
                    <span style={styles.memberEmail}>{member.email}</span>
                  </div>
                  <button style={styles.memberMenu}>
                    <MoreVertical size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
    padding: '24px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '14px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    flex: 1
  },
  backButton: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151'
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    flex: 1
  },
  projectColorBar: {
    width: '4px',
    height: '48px',
    background: '#3b82f6',
    borderRadius: '2px'
  },
  projectTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    color: '#111827'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  description: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  primaryAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  iconButton: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151'
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statItem: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '4px'
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '14px'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  tab: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  content: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '32px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  card: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '24px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 20px 0',
    color: '#111827'
  },
  detailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#374151'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  actionCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  iconButtonSmall: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  statCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px'
  },
  statCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  statCardTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  statCardValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827'
  },
  progressBar: {
    height: '4px',
    background: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  createTaskButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  activityItem: {
    display: 'flex',
    gap: '12px'
  },
  activityIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  activityText: {
    fontSize: '14px',
    color: '#374151',
    margin: '0 0 4px 0'
  },
  activityTime: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  tasksTab: {
    padding: '20px'
  },
  tasksHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  viewAllButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  tabHint: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  teamTab: {
    padding: '20px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  teamMember: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  memberInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  memberRole: {
    fontSize: '12px',
    color: '#6b7280',
    background: '#e5e7eb',
    padding: '2px 8px',
    borderRadius: '12px',
    alignSelf: 'flex-start'
  },
  memberEmail: {
    fontSize: '12px',
    color: '#6b7280'
  },
  memberMenu: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
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

export default ProjectDetail;
