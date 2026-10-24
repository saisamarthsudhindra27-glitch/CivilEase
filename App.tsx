import { useMemo, useState } from "react";

type Status = "Reported" | "In Progress" | "Resolved";

type Issue = {
  id: number;
  title: string;
  category: string;
  location: string;
  status: Status;
  votes: number;
  description: string;
  date: string;
};

const initialIssues: Issue[] = [
  {
    id: 1042,
    title: "Potholes causing traffic congestion",
    category: "Roads",
    location: "Indiranagar, Bengaluru",
    status: "In Progress",
    votes: 128,
    description:
      "Several potholes have appeared near the main junction, making commuting difficult.",
    date: "Today"
  },
  {
    id: 1041,
    title: "Streetlights not working",
    category: "Electricity",
    location: "Koramangala, Bengaluru",
    status: "Reported",
    votes: 86,
    description:
      "Multiple streetlights are not working, leaving the road dark at night.",
    date: "Yesterday"
  },
  {
    id: 1040,
    title: "Garbage collection delayed",
    category: "Waste",
    location: "HSR Layout, Bengaluru",
    status: "Resolved",
    votes: 64,
    description:
      "Waste collection was delayed near the residential complex.",
    date: "2 days ago"
  },
  {
    id: 1039,
    title: "Water leakage on main road",
    category: "Water",
    location: "Whitefield, Bengaluru",
    status: "In Progress",
    votes: 103,
    description:
      "Water is leaking from a roadside pipe and collecting on the road.",
    date: "3 days ago"
  },
  {
    id: 1038,
    title: "Damaged footpath near bus stop",
    category: "Footpaths",
    location: "Jayanagar, Bengaluru",
    status: "Reported",
    votes: 47,
    description:
      "The damaged footpath makes walking difficult for elderly residents.",
    date: "4 days ago"
  }
];

const categories = [
  "Roads",
  "Water",
  "Waste",
  "Electricity",
  "Footpaths",
  "Drainage",
  "Other"
];

function App() {
  const [issues, setIssues] = useState<Issue[]>(() => {
    try {
      const saved = localStorage.getItem("civilease-issues");

      if (saved) {
        return JSON.parse(saved) as Issue[];
      }
    } catch {
      // Use the initial issues if saved data cannot be read.
    }

    return initialIssues;
  });

  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showReport, setShowReport] = useState(false);
  const [selectedIssue, setSelectedIssue] =
    useState<Issue | null>(null);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] =
    useState("");
  const [reportCategory, setReportCategory] =
    useState("Roads");
  const [reportLocation, setReportLocation] =
    useState("Bengaluru");
  const [votes, setVotes] = useState<number[]>([]);

  function saveIssues(updatedIssues: Issue[]) {
    setIssues(updatedIssues);

    try {
      localStorage.setItem(
        "civilease-issues",
        JSON.stringify(updatedIssues)
      );
    } catch {
      setNotice("Your changes are visible for this session.");
    }
  }

  const resolvedCount = issues.filter(
    (issue) => issue.status === "Resolved"
  ).length;

  const activeCount = issues.filter(
    (issue) => issue.status === "In Progress"
  ).length;

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const query = search.toLowerCase();

      const matchesSearch =
        issue.title.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.category.toLowerCase().includes(query) ||
        String(issue.id).includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        issue.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        issue.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [issues, search, statusFilter, categoryFilter]);

  function navigate(page: string) {
    setActivePage(page);
    setMobileMenu(false);
    setSelectedIssue(null);
    setShowReport(false);
    setNotice("");
  }

  function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !reportTitle.trim() ||
      !reportDescription.trim() ||
      !reportLocation.trim()
    ) {
      setNotice("Please complete all the required fields.");
      return;
    }

    const newIssue: Issue = {
      id: Math.max(1000, ...issues.map((issue) => issue.id)) + 1,
      title: reportTitle.trim(),
      category: reportCategory,
      location: reportLocation.trim(),
      status: "Reported",
      votes: 1,
      description: reportDescription.trim(),
      date: "Just now"
    };

    saveIssues([newIssue, ...issues]);

    setReportTitle("");
    setReportDescription("");
    setReportCategory("Roads");
    setReportLocation("Bengaluru");
    setShowReport(false);
    setActivePage("Issues");
    setNotice("Your issue has been added successfully.");
  }

  function toggleVote(issue: Issue) {
    if (votes.includes(issue.id)) {
      setNotice("You have already supported this issue.");
      return;
    }

    const updatedIssues = issues.map((item) =>
      item.id === issue.id
        ? { ...item, votes: item.votes + 1 }
        : item
    );

    saveIssues(updatedIssues);
    setVotes((current) => [...current, issue.id]);
    setNotice("Your support has been recorded.");
  }

  function updateStatus(issue: Issue) {
    const nextStatus: Status =
      issue.status === "Reported"
        ? "In Progress"
        : issue.status === "In Progress"
          ? "Resolved"
          : "Reported";

    const updatedIssues = issues.map((item) =>
      item.id === issue.id
        ? { ...item, status: nextStatus }
        : item
    );

    saveIssues(updatedIssues);

    const updatedSelected = updatedIssues.find(
      (item) => item.id === issue.id
    );

    if (updatedSelected) {
      setSelectedIssue(updatedSelected);
    }

    setNotice(`Status changed to ${nextStatus}.`);
  }

  const navItems = [
    {
      heading: "WORKSPACE",
      items: [
        { name: "Overview", icon: "◫" },
        { name: "Issues", icon: "▤" },
        { name: "My Reports", icon: "▧" }
      ]
    },
    {
      heading: "COMMUNITY",
      items: [
        { name: "City Pulse", icon: "◉" },
        { name: "Impact", icon: "↗" }
      ]
    },
    {
      heading: "PREFERENCES",
      items: [
        { name: "Settings", icon: "⚙" }
      ]
    }
  ];

  const totalVotes = issues.reduce(
    (total, issue) => total + issue.votes,
    0
  );

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}
      >
        <div className="brand">
          <div className="brand-mark">C</div>

          <div>
            <div className="brand-name">civilease</div>
            <div className="brand-caption">
              CIVIC INTELLIGENCE
            </div>
          </div>

          <button
            className="close-sidebar"
            onClick={() => setMobileMenu(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <div className="city-selector">
          <div className="city-icon">⌖</div>

          <div className="city-copy">
            <span className="muted-label">YOUR CITY</span>
            <strong>Bengaluru, India</strong>
          </div>

          <span className="city-arrow">⌄</span>
        </div>

        {navItems.map((group) => (
          <div className="nav-group" key={group.heading}>
            <div className="nav-heading">{group.heading}</div>

            {group.items.map((item) => (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => navigate(item.name)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.name}</span>

                {item.name === "Issues" && (
                  <span className="nav-count">
                    {issues.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-spacer" />

        <div className="sidebar-impact">
          <div className="impact-top">
            <span className="live-indicator" />
            COMMUNITY POWERED
          </div>

          <h3>Small actions.</h3>
          <h3 className="accent-text">Real change.</h3>

          <p>
            Every report is a step toward a better city.
          </p>

          <div className="impact-progress">
            <span />
          </div>

          <div className="impact-footer">
            <span>COMMUNITY IMPACT</span>
            <strong>+{resolvedCount}</strong>
          </div>
        </div>

        <div className="profile">
          <div className="avatar">R</div>

          <div className="profile-copy">
            <strong>City Resident</strong>
            <span>Bengaluru, India</span>
          </div>

          <button
            className="profile-settings"
            onClick={() => navigate("Settings")}
            aria-label="Open settings"
          >
            ⋯
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="menu-button"
              onClick={() => setMobileMenu(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>

            <span className="breadcrumb-muted">Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="location-chip">
              <span>⌖</span>
              <span>Bengaluru, IN</span>
              <span className="location-dot" />
            </div>

            <button
              className="topbar-avatar"
              onClick={() => navigate("Settings")}
              aria-label="Profile settings"
            >
              R
            </button>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>

              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}

          {activePage === "Overview" && (
            <>
              <section className="hero-panel">
                <div className="hero-grid">
                  <div className="hero-copy">
                    <div className="eyebrow">
                      <span className="live-indicator" />
                      YOUR CITY. YOUR VOICE.
                    </div>

                    <h1>
                      Better cities
                      <br />
                      start <span>with you.</span>
                    </h1>

                    <p className="hero-description">
                      Report local issues, rally your community,
                      and turn everyday problems into real progress.
                    </p>

                    <div className="hero-actions">
                      <button
                        className="primary-button"
                        onClick={() => setShowReport(true)}
                      >
                        <span>＋</span>
                        Report an issue
                        <span>↗</span>
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() => navigate("Issues")}
                      >
                        Explore issues
                        <span>→</span>
                      </button>
                    </div>

                    <div className="social-proof">
                      <div className="mini-avatars">
                        <span>R</span>
                        <span>A</span>
                        <span>S</span>
                        <span>+</span>
                      </div>

                      <span>
                        <strong>{issues.length + 120}+</strong>{" "}
                        neighbours making a difference
                      </span>
                    </div>
                  </div>

                  <div className="city-visual">
                    <div className="visual-orbit orbit-one" />
                    <div className="visual-orbit orbit-two" />
                    <div className="visual-orbit orbit-three" />

                    <div className="visual-label label-top">
                      <span className="live-indicator" />
                      CIVIC ACTIVITY
                      <strong>+24.8%</strong>
                    </div>

                    <div className="city-art">
                      <div className="city-sun" />
                      <div className="city-building building-one" />
                      <div className="city-building building-two" />
                      <div className="city-building building-three" />
                      <div className="city-building building-four" />
                      <div className="city-building building-five" />
                      <div className="city-road" />
                      <div className="city-road-line" />
                    </div>

                    <div className="visual-label label-bottom">
                      <span className="visual-check">✓</span>
                      <div>
                        <strong>Real change.</strong>
                        <span>One report at a time.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hero-footer">
                  <span>01 / 03</span>

                  <div className="hero-progress">
                    <span />
                  </div>

                  <span>BUILT FOR COMMUNITIES</span>
                </div>
              </section>

              <section className="section-heading">
                <div>
                  <div className="section-kicker">YOUR IMPACT</div>
                  <h2>The bigger picture.</h2>
                  <p>
                    A little progress adds up to a better Bengaluru.
                  </p>
                </div>

                <button
                  className="text-button"
                  onClick={() => navigate("Impact")}
                >
                  View impact <span>↗</span>
                </button>
              </section>

              <section className="stats-grid">
                <StatCard
                  label="Total reports"
                  value={String(issues.length)}
                  detail="Community submissions"
                  symbol="▤"
                />

                <StatCard
                  label="In progress"
                  value={String(activeCount)}
                  detail="Awaiting action"
                  symbol="◷"
                />

                <StatCard
                  label="Resolved issues"
                  value={String(resolvedCount)}
                  detail="Marked as resolved"
                  symbol="✓"
                />

                <StatCard
                  label="Community support"
                  value={String(totalVotes)}
                  detail="Total issue confirmations"
                  symbol="↗"
                />
              </section>

              <section className="dashboard-grid">
                <div className="content-card">
                  <div className="card-heading">
                    <div>
                      <div className="card-kicker">
                        COMMUNITY FEED
                      </div>
                      <h3>Recent activity</h3>
                    </div>

                    <button
                      className="icon-button"
                      onClick={() => navigate("Issues")}
                      aria-label="View all issues"
                    >
                      ↗
                    </button>
                  </div>

                  <div className="issue-list">
                    {issues.slice(0, 3).map((issue) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        onClick={() => setSelectedIssue(issue)}
                      />
                    ))}
                  </div>

                  <button
                    className="card-footer-link"
                    onClick={() => navigate("Issues")}
                  >
                    View all community reports
                    <span>→</span>
                  </button>
                </div>

                <div className="content-card pulse-card">
                  <div className="card-heading">
                    <div>
                      <div className="card-kicker">
                        LOCAL MOMENTUM
                      </div>
                      <h3>City pulse</h3>
                    </div>

                    <span className="live-badge">
                      <span className="live-indicator" />
                      LIVE
                    </span>
                  </div>

                  <div className="pulse-score">
                    <strong>78</strong>
                    <span>/100</span>
                    <span className="pulse-change">↗ 8.2%</span>
                  </div>

                  <div className="pulse-chart">
                    {[32, 45, 38, 59, 48, 66, 51, 74, 61, 84, 67, 91, 76, 100, 82, 95].map(
                      (height, index) => (
                        <div
                          key={index}
                          className={`pulse-bar ${
                            index === 13 ? "pulse-bar-active" : ""
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>

                  <div className="chart-labels">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                  </div>

                  <div className="pulse-divider" />

                  <div className="pulse-footer">
                    <div className="pulse-footer-icon">↗</div>
                    <div>
                      <strong>Bengaluru is moving forward.</strong>
                      <p>Residents are taking action this week.</p>
                    </div>
                  </div>
                </div>
              </section>

              <footer className="page-footer">
                <span>© 2026 CivilEase</span>
                <span className="footer-status">
                  <span className="live-indicator" />
                  All systems operational
                </span>
                <span>Made for better cities, together.</span>
              </footer>
            </>
          )}

          {activePage === "Issues" && (
            <section className="page-section">
              <div className="page-title-row">
                <div>
                  <div className="section-kicker">
                    CIVIC INTELLIGENCE
                  </div>
                  <h1>Explore issues<span>.</span></h1>
                  <p>
                    Discover local problems and support your community.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowReport(true)}
                >
                  ＋ Report an issue
                </button>
              </div>

              <div className="filter-card">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search issues, locations, categories..."
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  aria-label="Filter by status"
                >
                  <option value="All">All statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="In Progress">In progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                  aria-label="Filter by category"
                >
                  <option value="All">All categories</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="results-heading">
                <strong>{filteredIssues.length} issues found</strong>
                <span>Bengaluru, Karnataka</span>
              </div>

              <div className="all-issues">
                {filteredIssues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    onClick={() => setSelectedIssue(issue)}
                  />
                ))}

                {filteredIssues.length === 0 && (
                  <div className="empty-state">
                    <span>⌕</span>
                    <h3>No matching issues</h3>
                    <p>
                      Try another search term or change your filters.
                    </p>

                    <button
                      className="secondary-button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("All");
                        setCategoryFilter("All");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "My Reports" && (
            <section className="page-section">
              <div className="section-kicker">YOUR ACTIVITY</div>
              <h1>My reports<span>.</span></h1>
              <p className="page-description">
                Review the reports available in this browser session.
              </p>

              <div className="content-card report-card">
                {issues.length === 0 ? (
                  <p>You have not submitted any reports yet.</p>
                ) : (
                  issues.map((issue) => (
                    <IssueRow
                      key={issue.id}
                      issue={issue}
                      onClick={() => setSelectedIssue(issue)}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {activePage === "City Pulse" && (
            <section className="page-section">
              <div className="section-kicker">COMMUNITY MOMENTUM</div>
              <h1>Your city in motion<span>.</span></h1>
              <p className="page-description">
                See the current distribution of community reports.
              </p>

              <div className="stats-grid">
                <StatCard
                  label="Reported"
                  value={String(
                    issues.filter(
                      (issue) => issue.status === "Reported"
                    ).length
                  )}
                  detail="Awaiting review"
                  symbol="◷"
                />

                <StatCard
                  label="In progress"
                  value={String(activeCount)}
                  detail="Being addressed"
                  symbol="↗"
                />

                <StatCard
                  label="Resolved"
                  value={String(resolvedCount)}
                  detail="Marked complete"
                  symbol="✓"
                />

                <StatCard
                  label="Community support"
                  value={String(totalVotes)}
                  detail="Issue confirmations"
                  symbol="◎"
                />
              </div>

              <div className="content-card pulse-detail">
                <div className="card-kicker">ISSUE DISTRIBUTION</div>
                <h3>Reports by category</h3>

                {categories.map((category) => {
                  const count = issues.filter(
                    (issue) => issue.category === category
                  ).length;

                  const percentage = issues.length
                    ? (count / issues.length) * 100
                    : 0;

                  return (
                    <div className="category-row" key={category}>
                      <div className="category-label">
                        <span>{category}</span>
                        <strong>{count}</strong>
                      </div>

                      <div className="category-track">
                        <span
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activePage === "Impact" && (
            <section className="page-section">
              <div className="section-kicker">MEASURABLE CHANGE</div>
              <h1>Every action counts<span>.</span></h1>
              <p className="page-description">
                A snapshot of the reports recorded in CivilEase.
              </p>

              <div className="stats-grid">
                <StatCard
                  label="Total reports"
                  value={String(issues.length)}
                  detail="Recorded reports"
                  symbol="▤"
                />

                <StatCard
                  label="Resolved"
                  value={String(resolvedCount)}
                  detail="Resolved status"
                  symbol="✓"
                />

                <StatCard
                  label="In progress"
                  value={String(activeCount)}
                  detail="Work in progress"
                  symbol="◷"
                />

                <StatCard
                  label="Community support"
                  value={String(totalVotes)}
                  detail="Total votes"
                  symbol="↗"
                />
              </div>

              <div className="content-card pulse-detail">
                <div className="card-kicker">OUR APPROACH</div>
                <h3>Better cities start with participation.</h3>
                <p>
                  CivilEase provides a place to record local concerns,
                  see their current status, and support issues raised
                  by other residents.
                </p>
              </div>
            </section>
          )}

          {activePage === "Settings" && (
            <section className="page-section">
              <div className="section-kicker">PREFERENCES</div>
              <h1>Settings<span>.</span></h1>
              <p className="page-description">
                Your local CivilEase workspace.
              </p>

              <div className="content-card settings-card">
                <div className="settings-row">
                  <div>
                    <strong>Workspace</strong>
                    <p>Your current civic dashboard.</p>
                  </div>
                  <span className="settings-value">CivilEase</span>
                </div>

                <div className="settings-row">
                  <div>
                    <strong>City</strong>
                    <p>Current demonstration location.</p>
                  </div>
                  <span className="settings-value">
                    Bengaluru, India
                  </span>
                </div>

                <div className="settings-row">
                  <div>
                    <strong>Storage</strong>
                    <p>
                      Reports are stored locally in this browser.
                    </p>
                  </div>
                  <span className="settings-value">Local</span>
                </div>

                <div className="settings-row">
                  <div>
                    <strong>Reset demonstration data</strong>
                    <p>
                      Restore the original example reports.
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => {
                      saveIssues(initialIssues);
                      setVotes([]);
                      setNotice("Example reports have been restored.");
                    }}
                  >
                    Reset data
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {showReport && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowReport(false);
            }
          }}
        >
          <section
            className="report-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
          >
            <div className="modal-header">
              <div>
                <div className="section-kicker">MAKE A DIFFERENCE</div>
                <h2 id="report-title">Report an issue<span>.</span></h2>
                <p>Tell your community what needs attention.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowReport(false)}
                aria-label="Close report form"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitReport}>
              <label htmlFor="issue-title">Issue title</label>
              <input
                id="issue-title"
                value={reportTitle}
                onChange={(event) =>
                  setReportTitle(event.target.value)
                }
                placeholder="e.g. Broken streetlight"
                maxLength={100}
                required
              />

              <label htmlFor="issue-category">Category</label>
              <select
                id="issue-category"
                value={reportCategory}
                onChange={(event) =>
                  setReportCategory(event.target.value)
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label htmlFor="issue-location">Location</label>
              <input
                id="issue-location"
                value={reportLocation}
                onChange={(event) =>
                  setReportLocation(event.target.value)
                }
                placeholder="Area, Bengaluru"
                maxLength={120}
                required
              />

              <label htmlFor="issue-description">Description</label>
              <textarea
                id="issue-description"
                value={reportDescription}
                onChange={(event) =>
                  setReportDescription(event.target.value)
                }
                placeholder="Describe the problem and how it affects residents..."
                rows={4}
                maxLength={1000}
                required
              />

              <div className="form-note">
                Reports in this demonstration are saved in your browser.
                They are not sent to a government department.
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowReport(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Submit report <span>→</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedIssue && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedIssue(null);
            }
          }}
        >
          <section
            className="report-modal detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <div className="modal-header">
              <div>
                <div className="section-kicker">
                  REPORT #{selectedIssue.id}
                </div>
                <h2 id="detail-title">
                  {selectedIssue.title}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedIssue(null)}
                aria-label="Close issue details"
              >
                ×
              </button>
            </div>

            <div className="detail-meta">
              <StatusBadge status={selectedIssue.status} />
              <span>{selectedIssue.category}</span>
              <span>{selectedIssue.date}</span>
            </div>

            <p className="detail-description">
              {selectedIssue.description}
            </p>

            <div className="detail-location">
              <span>⌖</span>
              {selectedIssue.location}
            </div>

            <div className="detail-votes">
              <div>
                <strong>{selectedIssue.votes}</strong>
                <span> people support this issue</span>
              </div>

              <button
                className="secondary-button"
                onClick={() => toggleVote(selectedIssue)}
              >
                {votes.includes(selectedIssue.id)
                  ? "Supported ✓"
                  : "Support issue ↑"}
              </button>
            </div>

            <div className="form-note">
              Status updates in this demonstration are local and do not
              represent official government action.
            </div>

            <button
              className="primary-button full-width"
              onClick={() => updateStatus(selectedIssue)}
            >
              Change demo status <span>→</span>
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  symbol
}: {
  label: string;
  value: string;
  detail: string;
  symbol: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-symbol">{symbol}</span>
      </div>

      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </article>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const className =
    status === "Resolved"
      ? "status-resolved"
      : status === "In Progress"
        ? "status-progress"
        : "status-reported";

  return (
    <span className={`status-badge ${className}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function IssueRow({
  issue,
  onClick
}: {
  issue: Issue;
  onClick: () => void;
}) {
  const categorySymbols: Record<string, string> = {
    Roads: "↗",
    Electricity: "ϟ",
    Waste: "♲",
    Water: "≈",
    Footpaths: "▤",
    Drainage: "≋",
    Other: "◎"
  };

  return (
    <button
      type="button"
      className="issue-row"
      onClick={onClick}
    >
      <div className="issue-category-icon">
        {categorySymbols[issue.category] ?? "◎"}
      </div>

      <div className="issue-main">
        <div className="issue-title">
          {issue.title}
        </div>

        <div className="issue-meta">
          <span>#{issue.id}</span>
          <span className="meta-dot">·</span>
          <span>{issue.location}</span>
        </div>
      </div>

      <div className="issue-right">
        <StatusBadge status={issue.status} />

        <div className="issue-votes">
          ↑ {issue.votes}
        </div>
      </div>
    </button>
  );
}

export default App;