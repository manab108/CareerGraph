import React, { useState, useEffect, useRef } from 'react';
import {
  fetchSkills,
  fetchRecommendations,
  fetchRoleDetails,
  fetchRoleGaps,
  fetchRoleResources,
  fetchCareerPath,
  checkHealth
} from './services/api';
import {
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Database,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Layers,
  Plus,
  Search,
  AlertTriangle,
  X
} from 'lucide-react';

function App() {
  // State
  const [dbConnected, setDbConnected] = useState(false);
  const [users, setUsers] = useState([
    { id: "user-1", name: "John Doe (Java Backend)" },
    { id: "user-2", name: "Jane Smith (React Frontend)" },
    { id: "user-3", name: "Bob Johnson (DevOps)" },
    { id: "user-4", name: "Alice Williams (Data Science)" },
    { id: "user-5", name: "Charlie Brown (Fullstack Jr)" },
    { id: "user-6", name: "Diana Prince (Senior Developer)" },
    { id: "user-7", name: "Evan Wright (Entry Developer)" },
    { id: "user-8", name: "Fiona Gallagher (UI Engineer)" },
    { id: "user-9", name: "George Costanza (Cloud)" },
    { id: "user-10", name: "Hannah Abbott (QA Automation)" }
  ]);
  const [selectedUserId, setSelectedUserId] = useState("user-1");
  const [userName, setUserName] = useState("John Doe");
  const [allSkills, setAllSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Skill selection dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Modal / Detail state
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalGaps, setModalGaps] = useState({ matched: [], missing: [] });
  const [modalResources, setModalResources] = useState([]);
  const [modalPath, setModalPath] = useState(null);

  // Initialize
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        // Verify database health
        const health = await checkHealth();
        setDbConnected(health.status === 'OK');

        // Fetch skills catalog
        const skillsData = await fetchSkills();
        setAllSkills(skillsData);

        // Fetch initial user recommendations
        await loadUserData(selectedUserId);
      } catch (err) {
        setError(err.message || "Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Fetch recommendations and compute active user skills when user changes
  const loadUserData = async (userId) => {
    try {
      const recsData = await fetchRecommendations(userId);
      setRecommendations(recsData.recommendations);
      setUserName(recsData.userName);

      
      const gaps = await fetchRoleGaps("role-backend-junior", userId);
      const owned = [...gaps.matched];
      
      const res = await fetch(`/api/users/${userId}/skills`);
      if (res.ok) {
        const ownedSkills = await res.json();
        setUserSkills(ownedSkills);
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      loadUserData(selectedUserId);
    }
  }, [selectedUserId]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAddDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add skill handler
  const handleAddSkill = async (skill) => {
    try {
      setShowAddDropdown(false);
      setSearchQuery("");
      // Add relationship via API
      await fetch(`/api/users/${selectedUserId}/skills/${skill.id}`, { method: 'POST' });
      // Reload recommendations and user skills
      await loadUserData(selectedUserId);
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  // Remove skill handler
  const handleRemoveSkill = async (skillId) => {
    try {
      // Remove relationship via API
      await fetch(`/api/users/${selectedUserId}/skills/${skillId}`, { method: 'DELETE' });
      // Reload recommendations and user skills
      await loadUserData(selectedUserId);
    } catch (err) {
      console.error("Failed to remove skill:", err);
    }
  };

  // Open Role Exploration details
  const handleExploreRole = async (role) => {
    setSelectedRole(role);
    setModalLoading(true);
    try {
      // Fetch details, gaps, resources, and career path concurrently
      const [gaps, resources, pathData] = await Promise.all([
        fetchRoleGaps(role.id, selectedUserId),
        fetchRoleResources(role.id),
        fetchCareerPath(selectedUserId, role.id)
      ]);

      setModalGaps(gaps);
      setModalResources(resources);
      setModalPath(pathData.path);
    } catch (err) {
      console.error("Failed to load role explore details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // Filter skills for adding dropdown
  const unownedSkills = allSkills.filter(
    s => !userSkills.some(us => us.id === s.id)
  );

  const filteredDropdownSkills = unownedSkills.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="app-container">
        <header>
          <div className="logo-container">
            <div className="logo-icon">CG</div>
            <div className="logo-text">CareerGraph</div>
          </div>
        </header>
        <div className="loading-view">
          <div className="spinner"></div>
          <p>Analyzing CognoDB instance & caching career paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <header>
          <div className="logo-container">
            <div className="logo-icon">CG</div>
            <div className="logo-text">CareerGraph</div>
          </div>
        </header>
        <div className="error-view">
          <AlertTriangle size={48} color="var(--error)" />
          <h2>Connection Unreachable</h2>
          <p>{error}</p>
          <p className="status-badge status-badge-error">CognoDB: Offline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header>
        <div className="logo-container">
          <div className="logo-icon">CG</div>
          <div className="logo-text">CareerGraph</div>
        </div>

        <div className="header-actions">
          {dbConnected ? (
            <div className="status-badge">
              <Database size={14} />
              <span>CognoDB Online</span>
            </div>
          ) : (
            <div className="status-badge status-badge-error">
              <Database size={14} />
              <span>CognoDB Offline</span>
            </div>
          )}

          <select
            className="user-selector"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main dashboard content */}
      <main>
        {/* Hero title */}
        <div className="hero">
          <h1>Discover your next career path</h1>
          <p>Select your skills, explore matching career roles, analyze skill gaps, and discover guided learning pathways powered by CognoDB graph traversals.</p>
        </div>

        {/* Skill Selector Card */}
        <div className="skill-selector-container glass">
          <div className="section-title">
            <GraduationCap size={20} color="var(--primary)" />
            <span>Your Skills ({userSkills.length})</span>
          </div>

          {/* User Skills list */}
          <div className="selected-skills-area">
            {userSkills.length === 0 ? (
              <div className="empty-badge-text">
                No skills selected. Click "+ Add Skill" to start modeling your path.
              </div>
            ) : (
              userSkills.map(skill => (
                <div key={skill.id} className="badge badge-selected" onClick={() => handleRemoveSkill(skill.id)}>
                  <span>{skill.name}</span>
                  <X size={12} style={{ marginLeft: '4px' }} />
                </div>
              ))
            )}
          </div>

          {/* Add Skill Button and Dropdown wrapper */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }} ref={dropdownRef}>
            <button
              className="card-button"
              style={{ maxWidth: '200px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', boxShadow: 'none' }}
              onClick={() => setShowAddDropdown(!showAddDropdown)}
            >
              <Plus size={16} />
              <span>Add Skill</span>
            </button>

            {showAddDropdown && (
              <div className="glass" style={{
                position: 'relative',
                marginTop: '10px',
                width: '320px',
                maxHeight: '350px',
                zIndex: 50,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                overflow: 'hidden'
              }}>
                <div className="search-bar">
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredDropdownSkills.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-dark)', textAlign: 'center', padding: '12px 0' }}>
                      No skills match search query
                    </div>
                  ) : (
                    // Group by category
                    Object.entries(
                      filteredDropdownSkills.reduce((acc, s) => {
                        acc[s.category] = acc[s.category] || [];
                        acc[s.category].push(s);
                        return acc;
                      }, {})
                    ).map(([category, skills]) => (
                      <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="category-header" style={{ fontSize: '11px', marginTop: '6px' }}>{category}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {skills.map(s => (
                            <button
                              key={s.id}
                              className="badge badge-catalog"
                              style={{ border: 'none', cursor: 'pointer' }}
                              onClick={() => handleAddSkill(s)}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Roles Section */}
        <div className="dashboard-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="section-title">
              <Compass size={20} color="var(--primary)" />
              <span>Recommended Roles for {userName}</span>
            </div>

            <div className="roles-grid">
              {recommendations.map(role => {
                // Calculate circle dashoffset
                const radius = 22;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (role.matchPercent / 100) * circumference;

                return (
                  <div key={role.id} className="role-card glass glass-interactive">
                    <div className="role-card-header">
                      <h3 className="role-title">{role.title}</h3>
                      <span className="role-level-badge">{role.level}</span>
                    </div>

                    <div className="match-container">
                      <div className="match-circle-wrapper">
                        <svg className="match-circle-svg">
                          <defs>
                            <linearGradient id="glowing-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="var(--primary)" />
                              <stop offset="100%" stopColor="var(--secondary)" />
                            </linearGradient>
                          </defs>
                          <circle className="match-circle-bg" cx="25" cy="25" r={radius} />
                          <circle
                            className="match-circle-bar"
                            cx="25"
                            cy="25"
                            r={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                          />
                        </svg>
                        <div className="match-percent-text">{role.matchPercent}%</div>
                      </div>
                      <div className="match-details">
                        <span className="match-label">Skill Compatibility</span>
                        <span className="match-count">{role.matched} / {role.total} Skills matched</span>
                      </div>
                    </div>

                    <button className="card-button" onClick={() => handleExploreRole(role)}>
                      <span>Explore Path</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Role details Modal */}
      {selectedRole && (
        <div className="modal-overlay" onClick={() => setSelectedRole(null)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-area">
                <h2>{selectedRole.title}</h2>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Level: {selectedRole.level} | Offered by: {selectedRole.companies && selectedRole.companies.length > 0 ? selectedRole.companies.join(", ") : "Various companies"}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedRole(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            {modalLoading ? (
              <div className="loading-view" style={{ flex: 1 }}>
                <div className="spinner"></div>
                <p>Traversing graph paths and fetching learning resources...</p>
              </div>
            ) : (
              <div className="modal-body">
                {/* Gaps analysis boxes */}
                <div className="gaps-panel">
                  <div className="gap-box">
                    <div className="gap-box-header" style={{ color: 'var(--success)' }}>
                      <Check size={18} />
                      <span>Skills You Have ({modalGaps.matched.length})</span>
                    </div>
                    <div className="gap-skills-list">
                      {modalGaps.matched.length === 0 ? (
                        <div style={{ color: 'var(--text-dark)', fontSize: '13px' }}>None of the required skills are in your profile.</div>
                      ) : (
                        modalGaps.matched.map(s => (
                          <div key={s.id} className="badge-gap-owned">
                            <span>{s.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="gap-box">
                    <div className="gap-box-header" style={{ color: 'var(--error)' }}>
                      <AlertTriangle size={18} />
                      <span>Skills You Need ({modalGaps.missing.length})</span>
                    </div>
                    <div className="gap-skills-list">
                      {modalGaps.missing.length === 0 ? (
                        <div style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '500' }}>Congratulations! You have all the skills required for this role.</div>
                      ) : (
                        modalGaps.missing.map(s => (
                          <div key={s.id} className="badge-gap-missing">
                            <span>{s.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Career Path Diagram */}
                {modalPath && modalPath.skills && modalPath.skills.length > 0 && (
                  <div className="career-path-section">
                    <div className="section-title">
                      <Layers size={18} color="var(--primary)" />
                      <span>Career Path & Skills Integration Traversal</span>
                    </div>

                    <div className="path-canvas">
                      {modalPath.skills.map((skill, index) => (
                        <React.Fragment key={skill.id}>
                          <div className={`path-node ${skill.isOwned ? 'path-node-owned' : 'path-node-missing'}`}>
                            <div className="path-node-name">{skill.name}</div>
                            <div className="path-node-status">
                              {skill.isOwned ? 'Owned Skill' : 'Gap (Missing Skill)'}
                            </div>
                          </div>
                          <div className="path-connector">
                            <div className="path-connector-arrow"></div>
                          </div>
                        </React.Fragment>
                      ))}

                      <div className="path-node path-node-role">
                        <div className="path-node-name">{selectedRole.title}</div>
                        <div className="path-node-status">Target Role</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended resources */}
                {modalResources && modalResources.length > 0 && (
                  <div className="resources-section">
                    <div className="section-title">
                      <BookOpen size={18} color="var(--primary)" />
                      <span>Recommended Learning Resources for Your Gaps</span>
                    </div>

                    <div className="resources-grid">
                      {modalResources
                        .filter(res => modalGaps.missing.some(ms => ms.id === res.skillId))
                        .map(res => (
                          <div key={res.id} className="resource-card">
                            <div className="resource-info">
                              <span className="resource-skill-tag">{res.skillName}</span>
                              <h4 className="resource-title">{res.title}</h4>
                            </div>
                            <div className="resource-meta">
                              <span className="resource-type">{res.type}</span>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-link"
                              >
                                <span>Get Started</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        ))}
                      {modalResources.filter(res => modalGaps.missing.some(ms => ms.id === res.skillId)).length === 0 && (
                        <div style={{ color: 'var(--text-dark)', fontSize: '13px', width: '100%', textAlign: 'center' }}>
                          No missing skills require resources. You are fully qualified!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
