import styles from './Architecture.module.css';

export default function Architecture() {
  return (
    <div className={styles.page}>
      <h2 className={styles.title}>How This System Works</h2>
      <p className={styles.subtitle}>A simple guide for anyone — no technical knowledge needed</p>

      {/* INTRO */}
      <p className={styles.analogy}>
              Think of it as the <strong>CCTV monitor wall</strong> — screens update live,
              and red alerts flash when something goes wrong.
       </p>
      <section className={styles.section}>
        <h3>What Is This?</h3>
        <p>
          This is a <strong>control panel</strong> for a storage cluster — a group of computers
          that work together to store massive amounts of files (think millions to billions of files
          across terabytes to petabytes of storage). BeeGFS is a parallel file system — it splits
          files into chunks and spreads them across multiple servers so they can be read and
          written faster. Companies use it to store genomics data, movie renders, AI training
          datasets, and scientific research files.
        </p>
        <p>
          An administrator uses this dashboard to make sure everything is running smoothly —
          like a security guard watching CCTV monitors to keep an eye on an entire building at once.
        </p>
      </section>

      {/* TWO PARTS */}
      <section className={styles.section}>
        <h3>The Two Parts</h3>
        <div className={styles.twoCol}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🖥️</div>
            <div className={styles.cardTitle}>The Server (Backend)</div>
            <p>Runs in the background on port 3001. It does three things:</p>
            <ul className={styles.bulletList}>
              <li>Stores all the data (nodes, events, jobs, config) in memory</li>
              <li>Simulates a live cluster — every 3 seconds it changes node statuses, creates events, and advances jobs</li>
              <li>Sends updates to the dashboard via two channels: REST API and WebSocket</li>
            </ul>
            <p className={styles.analogy}>
              Think of it as the <strong>CCTV control room</strong> — it watches every camera feed
              and sends alerts to the security monitors when something needs attention.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📊</div>
            <div className={styles.cardTitle}>The Dashboard (Frontend)</div>
            <p>What you're looking at right now on port 5173. It does three things:</p>
            <ul className={styles.bulletList}>
              <li>Loads initial data from the server when you open a page</li>
              <li>Listens for real-time updates via WebSocket — no page refresh needed</li>
              <li>Lets you take actions (create jobs, change settings, switch scale)</li>
            </ul>
            <p className={styles.analogy}>
              Think of it as the <strong>CCTV monitor wall</strong> — screens update live,
              and red alerts flash when something goes wrong, like a storage computer
              going offline or a disk running out of space.
            </p>
          </div>
        </div>
      </section>

      {/* HOW THEY COMMUNICATE */}
      <section className={styles.section}>
        <h3>How They Talk to Each Other</h3>
        <div className={styles.commGrid}>
          <div className={styles.commCard}>
            <div className={styles.commTitle}>REST API (Request → Response)</div>
            <p>Like sending a text message. The dashboard asks, the server answers.</p>
            <p><strong>Used for:</strong> Loading data when you first open a page, saving settings, creating jobs.</p>
            <div className={styles.endpointList}>
              <div className={styles.endpoint}><span className={styles.method}>GET</span> /api/cluster — Get cluster overview</div>
              <div className={styles.endpoint}><span className={styles.method}>GET</span> /api/nodes — Get storage nodes (paginated)</div>
              <div className={styles.endpoint}><span className={styles.method}>GET</span> /api/events — Get event log</div>
              <div className={styles.endpoint}><span className={styles.method}>GET</span> /api/config — Get configuration</div>
              <div className={styles.endpoint}><span className={styles.methodPost}>POST</span> /api/config — Save configuration</div>
              <div className={styles.endpoint}><span className={styles.methodPost}>POST</span> /api/jobs — Create a job</div>
              <div className={styles.endpoint}><span className={styles.methodDelete}>DEL</span> /api/jobs/:id — Cancel a job</div>
              <div className={styles.endpoint}><span className={styles.method}>GET</span> /api/scale — Get current cluster size</div>
              <div className={styles.endpoint}><span className={styles.methodPost}>POST</span> /api/scale — Change cluster size</div>
              <div className={styles.endpoint}><span className={styles.method}>GET</span> /api/docs — View API specification (OpenAPI)</div>
            </div>
          </div>
          <div className={styles.commCard}>
            <div className={styles.commTitle}>WebSocket (Server Pushes Updates)</div>
            <p>Like a phone call. The connection stays open and the server tells you the moment something changes.</p>
            <p><strong>Used for:</strong> Live updates — you never need to refresh the page.</p>
            <div className={styles.endpointList}>
              <div className={styles.endpoint}><span className={styles.wsEvent}>cluster:update</span> Full cluster summary (every 3s)</div>
              <div className={styles.endpoint}><span className={styles.wsEvent}>node:update</span> Individual node changed status</div>
              <div className={styles.endpoint}><span className={styles.wsEvent}>event:new</span> New event happened in the cluster</div>
              <div className={styles.endpoint}><span className={styles.wsEvent}>job:update</span> Job progress or status changed</div>
              <div className={styles.endpoint}><span className={styles.wsEvent}>alert:new</span> Important alert (node offline, disk full)</div>
            </div>
          </div>
        </div>
      </section>

      {/* DATA FLOW */}
      <section className={styles.section}>
        <h3>The Data Flow (Step by Step)</h3>
        <p>Every 3 seconds, the system automatically does this:</p>
        <div className={styles.flowSteps}>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>1</div>
            <div>
              <strong>Simulation Changes</strong>
              <p>The server simulates real activity — some computers change status (healthy → offline), disks fill up, or a background job makes progress. Think of it like things happening in a real data center.</p>
            </div>
          </div>
          <div className={styles.flowArrow}>↓</div>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>2</div>
            <div>
              <strong>Server Records It</strong>
              <p>The server saves what changed — which computer went down, which disk is getting full, which job moved forward.</p>
            </div>
          </div>
          <div className={styles.flowArrow}>↓</div>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>3</div>
            <div>
              <strong>Server Tells the Dashboard</strong>
              <p>The server instantly pushes the changes using WebSocket Broadcast to every open dashboard — like a group chat where the server sends a message and everyone connected sees it at the same time.</p>
            </div>
          </div>
          <div className={styles.flowArrow}>↓</div>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>4</div>
            <div>
              <strong>Dashboard Updates on Screen</strong>
              <p>The charts move, numbers change, status badges flip color, and new events appear — all without you clicking or refreshing anything.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PAGES IN DETAIL */}
      <section className={styles.section}>
        <h3>What Each Page Shows (In Detail)</h3>

        <div className={styles.pageDetail}>
          <div className={styles.pageDetailHeader}>
            <span className={styles.pageDetailIcon}>📈</span>
            <strong>Dashboard — Cluster Overview</strong>
          </div>
          <div className={styles.pageDetailBody}>
            <div className={styles.pageDetailWhat}>
              <div className={styles.subLabel}>What you see:</div>
              <ul className={styles.bulletList}>
                <li><strong>4 Summary Cards</strong> — Total Nodes, Active Nodes (with offline count), Storage Usage (TB used / TB total), Cluster Health (GREEN / YELLOW / RED)</li>
                <li><strong>Node Health Chart</strong> — A doughnut chart showing how many nodes are healthy (green), degraded (yellow), or offline (red)</li>
                <li><strong>Disk Usage Distribution</strong> — A bar chart showing how many nodes fall into each usage range (0-25%, 25-50%, etc.)</li>
                <li><strong>IO Throughput Chart</strong> — A line chart showing read and write speeds over the last 3 minutes</li>
              </ul>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>How it updates:</div>
              <p>Every 3 seconds, the server pushes a <code>cluster:update</code> event via WebSocket. All 4 cards and 3 charts update instantly — no page refresh needed.</p>
            </div>
          </div>
        </div>

        <div className={styles.pageDetail}>
          <div className={styles.pageDetailHeader}>
            <span className={styles.pageDetailIcon}>🖥️</span>
            <strong>Storage Nodes — Every Computer in the Cluster</strong>
          </div>
          <div className={styles.pageDetailBody}>
            <div className={styles.pageDetailWhat}>
              <div className={styles.subLabel}>What you see:</div>
              <ul className={styles.bulletList}>
                <li><strong>Scale Selector</strong> — Buttons to switch between 1K, 10K, 100K, 1M, and 1B nodes</li>
                <li><strong>Search Bar</strong> — Filter nodes by ID or hostname</li>
                <li><strong>View Toggle</strong> — Switch between Paginated view (pages of 25/50/100) and Virtual Scroll (smooth infinite scrolling)</li>
                <li><strong>Node Table</strong> — Columns: Node ID, Hostname, Status (colored badge), Disk Usage (progress bar), IO Throughput (MB/s), Last Heartbeat (e.g., "12s ago")</li>
              </ul>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>How it updates:</div>
              <p>Initial data loads via REST. Then WebSocket pushes <code>node:update</code> events for individual nodes — you can watch status badges flip from green to red in real-time.</p>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>What you can do:</div>
              <p>Search, sort any column (click header), change page size, switch between paginated and virtual scroll views, switch cluster scale from 1K to 1B nodes.</p>
            </div>
          </div>
        </div>

        <div className={styles.pageDetail}>
          <div className={styles.pageDetailHeader}>
            <span className={styles.pageDetailIcon}>📋</span>
            <strong>Events — Live Activity Feed</strong>
          </div>
          <div className={styles.pageDetailBody}>
            <div className={styles.pageDetailWhat}>
              <div className={styles.subLabel}>What you see:</div>
              <ul className={styles.bulletList}>
                <li><strong>Live Indicator</strong> — A pulsing green dot showing the feed is live</li>
                <li><strong>Severity Filters</strong> — Buttons to show All, Info (blue), Warning (yellow), or Error (red) events</li>
                <li><strong>Event List</strong> — Each event shows: timestamp, severity dot, and message (e.g., "Node storage-node-042 went offline")</li>
                <li><strong>New Event Glow</strong> — When a new event arrives, it glows blue briefly to catch your attention</li>
              </ul>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>How it updates:</div>
              <p>WebSocket pushes <code>event:new</code> events. New events slide in at the top with a highlight animation. The list caps at 200 events.</p>
            </div>
          </div>
        </div>

        <div className={styles.pageDetail}>
          <div className={styles.pageDetailHeader}>
            <span className={styles.pageDetailIcon}>⚙️</span>
            <strong>Jobs — Background Tasks</strong>
          </div>
          <div className={styles.pageDetailBody}>
            <div className={styles.pageDetailWhat}>
              <div className={styles.subLabel}>What you see:</div>
              <ul className={styles.bulletList}>
                <li><strong>Create Job Button</strong> — Start one of three tasks:
                  <ul className={styles.bulletList}>
                    <li><strong>Data Rebalance</strong> — Spreads files more evenly across computers, like reorganizing a warehouse so no shelf is overloaded</li>
                    <li><strong>Pool Expansion</strong> — Adds more storage space to the cluster, like adding more shelves to the warehouse</li>
                    <li><strong>Health Check</strong> — Scans all computers to find any problems, like a routine inspection</li>
                  </ul>
                </li>
                <li><strong>Job List</strong> — Each job shows a progress bar that fills up as the task runs (like a download progress bar) and its current status: waiting, running, completed, or failed</li>
              </ul>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>How it updates:</div>
              <p>Progress bars update automatically on your screen. When a job finishes or fails, a notification pops up in the corner.</p>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>What you can do:</div>
              <p>Start new tasks with the Create Job button. Stop a task if you started it by mistake (you'll be asked to confirm before cancelling).</p>
            </div>
          </div>
        </div>

        <div className={styles.pageDetail}>
          <div className={styles.pageDetailHeader}>
            <span className={styles.pageDetailIcon}>🔧</span>
            <strong>Settings — System Configuration</strong>
          </div>
          <div className={styles.pageDetailBody}>
            <div className={styles.pageDetailWhat}>
              <div className={styles.subLabel}>What you see:</div>
              <ul className={styles.bulletList}>
                <li><strong>Replication Factor</strong> — How many backup copies of each file to keep. Set to 3 means if one computer dies, two other copies still exist</li>
                <li><strong>Metadata Servers</strong> — Special computers that remember where every file is stored, like a librarian who knows which shelf every book is on. You can add or remove them</li>
                <li><strong>Maintenance Mode</strong> — A switch to pause the system so you can safely repair or upgrade computers without triggering false alarms</li>
                <li><strong>Storage Targets</strong> — The actual hard drives where files are saved. You can turn individual drives on or off</li>
              </ul>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>How it updates:</div>
              <p>This page does NOT update automatically. It loads your settings when you open the page, and only changes when you click Save. This prevents settings from jumping around while you're editing them.</p>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>Safety:</div>
              <p>Risky actions (like removing a server or turning off a drive) show a confirmation popup: "Are you sure?" You must click Confirm to proceed — this prevents accidental damage.</p>
            </div>
            <div className={styles.pageDetailHow}>
              <div className={styles.subLabel}>Note:</div>
              <p>Changes only take effect after clicking "Save Configuration." If you toggle something but don't save, it resets when you leave the page. In this prototype, settings are saved to the server but don't affect the simulation — there is no real cluster to configure. The purpose is to demonstrate the form workflow, confirmation dialogs, and safe operation patterns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section className={styles.section}>
        <h3>Safety Features</h3>
        <div className={styles.safetyGrid}>
          <div className={styles.safetyItem}>
            <strong>Confirmation Dialogs</strong>
            <p>Dangerous actions show a popup asking "Are you sure?" with a Cancel button. Prevents accidental data loss.</p>
          </div>
          <div className={styles.safetyItem}>
            <strong>Auto-Reconnect</strong>
            <p>If the server connection drops, the dashboard automatically tries to reconnect every 2 seconds and shows a red warning banner until it succeeds.</p>
          </div>
          <div className={styles.safetyItem}>
            <strong>Toast Alerts</strong>
            <p>When a node goes offline or a disk is nearly full, a notification pops up in the bottom-right corner. It auto-dismisses after 5 seconds or you can close it manually.</p>
          </div>
          <div className={styles.safetyItem}>
            <strong>Error Recovery</strong>
            <p>If the app crashes due to a bug, it shows a friendly error screen with a "Reload" button instead of going completely blank.</p>
          </div>
        </div>
      </section>

      {/* SCALE */}
      <section className={styles.section}>
        <h3>How It Handles Scale</h3>
        <p>This system is designed to handle clusters from 1,000 to 1,000,000,000 nodes. Here's how:</p>
        <div className={styles.flowSteps}>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>🔘</div>
            <div>
              <strong>Scale Selector (1K → 1B)</strong>
              <p>On the Nodes page, click a button to switch between 1K, 10K, 100K, 1M, or 1B nodes. The server regenerates data on the fly — no restart needed.</p>
            </div>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>📄</div>
            <div>
              <strong>Server-Side Pagination</strong>
              <p>The server only sends one page at a time (25 or 50 nodes). Even with 1 billion nodes, each request is fast because you only load what you can see.</p>
            </div>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>📜</div>
            <div>
              <strong>Virtual Scrolling</strong>
              <p>In Virtual Scroll mode, only the rows visible on your screen are actually rendered. As you scroll, old rows are removed and new ones are created. This keeps the browser fast no matter how many rows exist.</p>
            </div>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.stepNumber}>⚡</div>
            <div>
              <strong>On-The-Fly Generation</strong>
              <p>For 1M+ nodes, the server doesn't store them all in memory (that would need 200GB+ of RAM). Instead, it generates each page of nodes mathematically when requested — the same page always returns the same data.</p>
            </div>
          </div>
        </div>
        <div className={styles.scaleStats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>16,000+</div>
            <div className={styles.statLabel}>API requests per second</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>200+</div>
            <div className={styles.statLabel}>simultaneous dashboard users</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>1B</div>
            <div className={styles.statLabel}>max nodes supported</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>3ms</div>
            <div className={styles.statLabel}>average API response time</div>
          </div>
        </div>
      </section>
    </div>
  );
}
