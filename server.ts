import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Initialize data storage paths
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SPIDERS_FILE = path.join(DATA_DIR, "spiders.json");
const URLS_FILE = path.join(DATA_DIR, "urls.json");
const FOLDERS_FILE = path.join(DATA_DIR, "folders.json");
const METRICS_FILE = path.join(DATA_DIR, "metrics.json");

// Helpers to read/write JSON files safely with default fallbacks
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return defaultValue;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
  }
}

// Default Seed Data
const DEFAULT_FOLDERS = [
  { id: "f-all", name: "All Scraped URLs", color: "text-slate-400" },
  { id: "f-1", name: "Premium 1080p Clips", color: "text-indigo-400", description: "All High definition results filtered from premium streams" },
  { id: "f-2", name: "Amateur Series", color: "text-emerald-400", description: "Clipped amateur categories" },
  { id: "f-3", name: "Verified Channels", color: "text-amber-400", description: "Official creator channel outputs" }
];

const DEFAULT_SPIDERS = [
  {
    config: {
      id: "spider-1",
      name: "XHamster Primary Parser",
      targetUrls: ["https://xhamster.com/channels/verified-amateurs", "https://xhamster.com/videos/newest"],
      depth: 3,
      maxUrls: 150,
      rateLimitMs: 1200,
      bypassAntiScraping: true,
      userAgentType: "desktop",
      filters: {
        includeKeywords: ["beach", "amateur", "couple", "vacation"],
        excludeKeywords: ["advertisement", "clickbait", "game", "casino"],
        minDurationPct: 10, // representing duration constraints in minutes
        maxDurationPct: 60,
        uploadDateWithin: "month",
        actors: ["Eva", "John", "Mark"]
      },
      folderId: "f-2",
      schedulePattern: "daily"
    },
    status: {
      id: "spider-1",
      state: "idle",
      pagesProcessed: 42,
      urlsFound: 118,
      urlsSaved: 34,
      currentAction: "Ready for manual trigger",
      crawlRate: 0,
      dataProcessedKB: 1240,
      errorCount: 0,
      logs: [
        "[SYSTEM] Spider configured and validated.",
        "[INFO] Auto-exclusion cache refreshed."
      ]
    }
  },
  {
    config: {
      id: "spider-2",
      name: "EPorner HD Scanner",
      targetUrls: ["https://eporner.com/hd-videos", "https://eporner.com/top-rated"],
      depth: 2,
      maxUrls: 200,
      rateLimitMs: 1500,
      bypassAntiScraping: true,
      userAgentType: "random",
      filters: {
        includeKeywords: ["1080p", "clean", "vlog"],
        excludeKeywords: ["spam", "ad", "commercial"],
        minDurationPct: 5,
        maxDurationPct: 40,
        uploadDateWithin: "week",
        actors: []
      },
      folderId: "f-1",
      schedulePattern: "manual"
    },
    status: {
      id: "spider-2",
      state: "running",
      pagesProcessed: 15,
      urlsFound: 67,
      urlsSaved: 18,
      startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      currentAction: "Extracting stream URLs from eporner.com/video/983152...",
      crawlRate: 1.4,
      dataProcessedKB: 680,
      errorCount: 1,
      lastErrorReason: "Gateway timeout on pagination endpoint",
      logs: [
        "[SYSTEM] EPorner scan thread initialized.",
        "[INFO] Capturing target page URL: eporner.com/hd-videos/2",
        "[ANTI-BOT] Rotating user-agent to: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebkit",
        "[SUCCESS] Segment parsed. Found 12 video streams on detail page.",
        "[WARNING] Gateway timeout on pagination endpoint. Retrying with random User-Agent in 1500ms..."
      ]
    }
  },
  {
    config: {
      id: "spider-3",
      name: "XNXX Premium Tracker",
      targetUrls: ["https://xnxx.com/tags/lifestyle", "https://xnxx.com/best-of"],
      depth: 1,
      maxUrls: 80,
      rateLimitMs: 2500,
      bypassAntiScraping: false,
      userAgentType: "bot",
      filters: {
        includeKeywords: ["verified", "vlogger", "couple"],
        excludeKeywords: ["short", "trailer"],
        minDurationPct: 15,
        uploadDateWithin: "month",
        actors: []
      },
      folderId: "f-3",
      schedulePattern: "1h"
    },
    status: {
      id: "spider-3",
      state: "paused",
      pagesProcessed: 8,
      urlsFound: 24,
      urlsSaved: 7,
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      currentAction: "Crawl paused by user command",
      crawlRate: 0,
      dataProcessedKB: 310,
      errorCount: 0,
      logs: [
        "[SYSTEM] Initialized secure request queue.",
        "[INFO] Depth 1 starting node: xnxx.com/tags/lifestyle",
        "[SUCCESS] Saved: xnxx.com/video-vlogger-pair-410",
        "[ACTION] Crawler suspended per client command."
      ]
    }
  }
];

const DEFAULT_URLS = [
  {
    id: "url-1",
    spiderId: "spider-1",
    spiderName: "XHamster Primary Parser",
    url: "https://xhamster.com/videos/amateur-island-getaway-94281",
    title: "Amateur Couple Island Getaway & Sailing Vlog",
    category: "f-2",
    durationSec: 1420,
    resolution: "1080p",
    uploadDate: "2026-05-12T14:22:00Z",
    pornstars: ["Eva", "John"],
    thumbnails: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"],
    channelName: "Eva & John Vlogs",
    fileSizeMB: 480.5,
    extractedAt: "2026-05-20T12:04:10Z"
  },
  {
    id: "url-2",
    spiderId: "spider-2",
    spiderName: "EPorner HD Scanner",
    url: "https://eporner.com/video-hd-summerblog-983152",
    title: "High Definition Summer Adventure Creator Diary",
    category: "f-1",
    durationSec: 2450,
    resolution: "1080p",
    uploadDate: "2026-05-19T09:12:00Z",
    pornstars: ["Mark"],
    thumbnails: ["https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800"],
    channelName: "Extreme Adventure",
    fileSizeMB: 840.2,
    extractedAt: "2026-05-20T18:41:20Z"
  },
  {
    id: "url-3",
    spiderId: "spider-1",
    spiderName: "XHamster Primary Parser",
    url: "https://xhamster.com/videos/beachside-couple-relaxation-110",
    title: "Beachside Couple Relaxation and Sunset Walks",
    category: "f-2",
    durationSec: 940,
    resolution: "720p",
    uploadDate: "2026-05-18T17:34:00Z",
    pornstars: ["Eva", "John"],
    thumbnails: ["https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"],
    channelName: "Eva & John Vlogs",
    fileSizeMB: 280.1,
    extractedAt: "2026-05-20T12:35:15Z"
  },
  {
    id: "url-4",
    spiderId: "spider-3",
    spiderName: "XNXX Premium Tracker",
    url: "https://xnxx.com/video-vlogger-pair-410",
    title: "Verified Creator Lifestyle Vlog: Paris Holiday Tour",
    category: "f-3",
    durationSec: 1820,
    resolution: "1080p",
    uploadDate: "2026-05-15T11:05:00Z",
    pornstars: [],
    thumbnails: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"],
    channelName: "Holiday Couple Official",
    fileSizeMB: 610.4,
    extractedAt: "2026-05-20T18:19:40Z"
  }
];

// Initialize Data Store
let spiders = readJsonFile(SPIDERS_FILE, DEFAULT_SPIDERS);
let urls = readJsonFile(URLS_FILE, DEFAULT_URLS);
let folders = readJsonFile(FOLDERS_FILE, DEFAULT_FOLDERS);

// Persistent Metrics Generator Helper
let metricPoints = readJsonFile(METRICS_FILE, [
  { timeLabel: "18:20", crawlRate: 0.8, urlsFiltered: 62, errors: 0, memoryUsage: 42.4 },
  { timeLabel: "18:25", crawlRate: 1.1, urlsFiltered: 74, errors: 1, memoryUsage: 43.1 },
  { timeLabel: "18:30", crawlRate: 1.5, urlsFiltered: 91, errors: 0, memoryUsage: 44.2 },
  { timeLabel: "18:35", crawlRate: 1.2, urlsFiltered: 104, errors: 0, memoryUsage: 44.8 },
  { timeLabel: "18:40", crawlRate: 1.6, urlsFiltered: 121, errors: 2, memoryUsage: 45.6 },
  { timeLabel: "18:45", crawlRate: 1.4, urlsFiltered: 135, errors: 1, memoryUsage: 46.1 }
]);

// Keep latest 15 points
function pushMetricPoint(point: any) {
  metricPoints.push(point);
  if (metricPoints.length > 20) {
    metricPoints.shift();
  }
  writeJsonFile(METRICS_FILE, metricPoints);
}

// Global state trackers
let hasActiveCrawlers = false;
let globalLogs: string[] = [];
let pendingNotifications: Array<{ type: "success" | "error" | "info"; title: string; body: string; time: string }> = [];

// Video Pool for Simulated Crawling results (themed high-quality safe photography/beach adventure keywords)
const PHOTO_WORDS_POOL = [
  "Beach", "Sunset", "Tropical", "Lagoon", "Sailing", "Island", "Vlog", "Couple", "Relaxing", "Luxury", "Sunny", "Volcano", "Surf", "Adventure"
];
const CREATOR_POOL = ["Eva & John Vlogs", "Coastal Diary", "Ocean Wanderers", "Horizon Chasers", "Paradise Bound"];
const ACTOR_POOL = ["Eva", "John", "Mark", "Sally", "Chris", "Dave"];
const DOMAIN_SAMPLES = ["xhamster.com", "eporner.com", "xnxx.com"];

// Perform real-time simulation tick for running spiders
setInterval(() => {
  let changed = false;
  let runningCount = 0;
  
  spiders = spiders.map((spider: any) => {
    if (spider.status.state === "running") {
      runningCount++;
      const rateLimitMs = spider.config.rateLimitMs || 1000;
      // Increment stats slightly
      const tickCycle = Math.random();
      
      const prevFound = spider.status.urlsFound;
      const prevSaved = spider.status.urlsSaved;
      
      let additionPages = tickCycle > 0.4 ? 1 : 0;
      let additionUrls = additionPages > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
      let additionSaved = 0;
      
      let currentAction = spider.status.currentAction;
      let errorOccurred = false;
      let errorReason = spider.status.lastErrorReason;
      let errorCount = spider.status.errorCount;
      
      const siteDomain = spider.config.targetUrls[0] 
        ? new URL(spider.config.targetUrls[0]).hostname 
        : DOMAIN_SAMPLES[Math.floor(Math.random() * DOMAIN_SAMPLES.length)];

      if (additionPages > 0) {
        currentAction = `Parsing page index ${Math.floor(Math.random() * 10) + 1} on ${siteDomain}...`;
        spider.status.logs.push(`[INFO] Connected to remote domain: ${siteDomain}`);
        
        if (spider.config.bypassAntiScraping) {
          spider.status.logs.push(`[ANTI-BOT] Injecting randomized header cookie & TLS fingerprints...`);
        }
        
        // Anti-scraping penalty simulation if bypass is off on xhamster/eporner
        if (!spider.config.bypassAntiScraping && Math.random() < 0.15) {
          errorOccurred = true;
          errorCount++;
          errorReason = "Blocked by Cloudflare bot-check challenge (CAPTCHA)";
          spider.status.logs.push(`[CRITICAL] 403 Forbidden on ${siteDomain} detailed path. Cloudflare JS Challenge failed.`);
          pendingNotifications.push({
            type: "error",
            title: spider.config.name,
            body: `Anti-scraping protection triggered: ${errorReason}. Consider activating "Bypass Protection".`,
            time: new Date().toLocaleTimeString()
          });
        }
      }

      // If we found URLs, decide how many pass criteria filters
      if (additionUrls > 0 && !errorOccurred) {
        for (let i = 0; i < additionUrls; i++) {
          // Generate simulated video info
          const duration = Math.floor(Math.random() * 2500) + 200; // secs (approx 3m to 45m)
          const durationMins = duration / 60;
          
          const creator = CREATOR_POOL[Math.floor(Math.random() * CREATOR_POOL.length)];
          const chosenActors = [
            ACTOR_POOL[Math.floor(Math.random() * ACTOR_POOL.length)],
            ACTOR_POOL[Math.floor(Math.random() * ACTOR_POOL.length)]
          ].filter((v, idx, self) => self.indexOf(v) === idx);
          
          // Generate realistic name
          const mainKeyword = spider.config.filters.includeKeywords[
            Math.floor(Math.random() * spider.config.filters.includeKeywords.length)
          ] || PHOTO_WORDS_POOL[Math.floor(Math.random() * PHOTO_WORDS_POOL.length)];
          
          const title = `${chosenActors.join(" & ")}: Private Vacation ${mainKeyword} - ${PHOTO_WORDS_POOL[Math.floor(Math.random() * PHOTO_WORDS_POOL.length)]} Episode ${Math.floor(Math.random() * 8) + 1}`;
          
          // Verify against exclusion filters
          const hasExcluded = spider.config.filters.excludeKeywords.some((word: string) => 
            title.toLowerCase().includes(word.toLowerCase())
          );
          
          // Verify actor filters if present
          const actorMatches = spider.config.filters.actors.length === 0 || 
            spider.config.filters.actors.some((act: string) => chosenActors.includes(act));
            
          // Verify duration filters
          const durationMinutesFlag = (!spider.config.filters.minDurationPct || durationMins >= spider.config.filters.minDurationPct) &&
            (!spider.config.filters.maxDurationPct || durationMins <= spider.config.filters.maxDurationPct);
            
          if (!hasExcluded && actorMatches && durationMinutesFlag) {
            additionSaved++;
            
            // Add Scraped URL to DB
            const randFormat = Math.random();
            const resolution = randFormat > 0.6 ? "1080p" : (randFormat > 0.25 ? "720p" : "480p");
            const newScrapedId = `url-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            const tempUrlObj = {
              id: newScrapedId,
              spiderId: spider.config.id,
              spiderName: spider.config.name,
              url: `https://${siteDomain}/videos/${mainKeyword.toLowerCase()}-clip-${Math.floor(Math.random() * 100000)}`,
              title: title,
              category: spider.config.folderId || "f-all",
              durationSec: duration,
              resolution: resolution as any,
              uploadDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
              pornstars: chosenActors,
              thumbnails: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"],
              channelName: creator,
              fileSizeMB: Math.round(duration * 0.35 * 10) / 10,
              extractedAt: new Date().toISOString()
            };
            
            urls.unshift(tempUrlObj);
            spider.status.logs.push(`[SAVED] Yielded: ${tempUrlObj.title} - Duration: ${Math.floor(duration/60)}m - Res: ${resolution}`);
          } else {
            // Log rejection
            if (hasExcluded) {
              spider.status.logs.push(`[FILTERED] Discarded: "${title}" - hit banned keyword filter.`);
            } else if (!actorMatches) {
              spider.status.logs.push(`[FILTERED] Discarded: "${title}" - does not match explicit actors list.`);
            } else {
              spider.status.logs.push(`[FILTERED] Discarded: "${title}" - duration criteria mismatch.`);
            }
          }
        }
      }

      const pagesProcessed = spider.status.pagesProcessed + additionPages;
      const urlsFound = spider.status.urlsFound + additionUrls;
      const urlsSaved = spider.status.urlsSaved + additionSaved;
      
      // Update data size
      const dataProcessedKB = spider.status.dataProcessedKB + (additionPages * (Math.floor(Math.random() * 12) + 5)) + (additionSaved * 2);

      // Enforce Max URLs constraint inside config
      let finalState = spider.status.state;
      if (urlsSaved >= spider.config.maxUrls) {
        finalState = "completed";
        currentAction = `Finished. Maximum harvest limit of ${spider.config.maxUrls} reached.`;
        spider.status.logs.push(`[SYSTEM] Target harvest threshold reached (${spider.config.maxUrls} urls saved). Wrapping run.`);
        pendingNotifications.push({
          type: "success",
          title: spider.config.name,
          body: `Crawl cycle complete! Saved ${urlsSaved} video URLs successfully.`,
          time: new Date().toLocaleTimeString()
        });
      }

      changed = true;
      return {
        ...spider,
        status: {
          ...spider.status,
          state: finalState,
          pagesProcessed,
          urlsFound,
          urlsSaved,
          currentAction,
          errorCount,
          lastErrorReason: errorReason,
          crawlRate: parseFloat((Math.random() * 1.5 + 0.5).toFixed(1)),
          dataProcessedKB,
          logs: spider.status.logs.slice(-100) // Keep last 100 logs
        }
      };
    }
    return spider;
  });

  if (changed) {
    writeJsonFile(SPIDERS_FILE, spiders);
    writeJsonFile(URLS_FILE, urls);
  }

  // Update real-time system metrics periodically
  const crawlRateSum = spiders
    .filter((s: any) => s.status.state === "running")
    .reduce((a: number, b: any) => a + b.status.crawlRate, 0);

  const errorsSum = spiders.reduce((a: number, b: any) => a + b.status.errorCount, 0);

  hasActiveCrawlers = (runningCount > 0);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const memoryBase = 44.5 + (runningCount * 1.5) + parseFloat((Math.random() * 0.8).toFixed(2));

  pushMetricPoint({
    timeLabel: currentTime,
    crawlRate: parseFloat(crawlRateSum.toFixed(1)),
    urlsFiltered: urls.length,
    errors: errorsSum,
    memoryUsage: parseFloat(memoryBase.toFixed(1))
  });

}, 4000);

// Set up server
const app = express();
app.use(express.json());

// Load UI helper scripts first

// CORS setup equivalent for internal container mapping
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// GET notifications List
app.get("/api/notifications", (req, res) => {
  res.json(pendingNotifications);
});

// Check off notification list
app.post("/api/notifications/clear", (req, res) => {
  pendingNotifications = [];
  res.status(200).json({ success: true });
});

// GET folders
app.get("/api/folders", (req, res) => {
  res.json(folders);
});

// POST folder
app.post("/api/folders", (req, res) => {
  const { name, color, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Folder name is required." });
  }
  const folderId = `f-${Date.now()}`;
  const newFolder = { id: folderId, name, color: color || "text-slate-400", description };
  folders.push(newFolder);
  writeJsonFile(FOLDERS_FILE, folders);
  res.status(201).json(newFolder);
});

// DELETE folder
app.delete("/api/folders/:id", (req, res) => {
  const folderId = req.params.id;
  if (["f-all", "f-1", "f-2", "f-3"].includes(folderId)) {
    return res.status(400).json({ error: "Cannot delete protected system folders." });
  }
  folders = folders.filter((f: any) => f.id !== folderId);
  writeJsonFile(FOLDERS_FILE, folders);
  res.json({ success: true });
});

// GET all Spiders (Configs + Statuses)
app.get("/api/spiders", (req, res) => {
  res.json(spiders);
});

// POST Create Custom Spider
app.post("/api/spiders", (req, res) => {
  const { name, targetUrls, depth, maxUrls, rateLimitMs, bypassAntiScraping, userAgentType, filters, folderId, schedulePattern } = req.body;
  
  if (!name || !targetUrls || !Array.isArray(targetUrls) || targetUrls.length === 0) {
    return res.status(400).json({ error: "Spider name and at least one target link is required." });
  }

  const newSpiderId = `spider-${Date.now()}`;
  const newSpider = {
    config: {
      id: newSpiderId,
      name,
      targetUrls,
      depth: parseInt(depth) || 1,
      maxUrls: parseInt(maxUrls) || 100,
      rateLimitMs: parseInt(rateLimitMs) || 1500,
      bypassAntiScraping: !!bypassAntiScraping,
      userAgentType: userAgentType || "desktop",
      filters: {
        includeKeywords: filters?.includeKeywords || [],
        excludeKeywords: filters?.excludeKeywords || [],
        minDurationPct: filters?.minDurationPct ? parseFloat(filters.minDurationPct) : undefined,
        maxDurationPct: filters?.maxDurationPct ? parseFloat(filters.maxDurationPct) : undefined,
        uploadDateWithin: filters?.uploadDateWithin || "any",
        actors: filters?.actors || []
      },
      folderId: folderId || undefined,
      schedulePattern: schedulePattern || "manual"
    },
    status: {
      id: newSpiderId,
      state: "idle",
      pagesProcessed: 0,
      urlsFound: 0,
      urlsSaved: 0,
      currentAction: "Created and waiting to execute.",
      crawlRate: 0,
      dataProcessedKB: 0,
      errorCount: 0,
      logs: [
        `[SYSTEM] Spider configured manually. Target source count: ${targetUrls.length}`,
        `[INFO] Target domains: ${targetUrls.map(tu => {
          try { return new URL(tu).hostname; } catch(e) { return tu; }
        }).join(", ")}`
      ]
    }
  };

  spiders.push(newSpider);
  writeJsonFile(SPIDERS_FILE, spiders);
  res.status(201).json(newSpider);
});

// UPDATE specific spider
app.put("/api/spiders/:id", (req, res) => {
  const spiderId = req.params.id;
  const spiderIdx = spiders.findIndex((s: any) => s.config.id === spiderId);
  if (spiderIdx === -1) {
    return res.status(404).json({ error: "Spider config not found." });
  }

  const { name, targetUrls, depth, maxUrls, rateLimitMs, bypassAntiScraping, userAgentType, filters, folderId, schedulePattern } = req.body;
  
  spiders[spiderIdx].config = {
    ...spiders[spiderIdx].config,
    name: name || spiders[spiderIdx].config.name,
    targetUrls: targetUrls || spiders[spiderIdx].config.targetUrls,
    depth: parseInt(depth) || spiders[spiderIdx].config.depth,
    maxUrls: parseInt(maxUrls) || spiders[spiderIdx].config.maxUrls,
    rateLimitMs: parseInt(rateLimitMs) || spiders[spiderIdx].config.rateLimitMs,
    bypassAntiScraping: bypassAntiScraping !== undefined ? !!bypassAntiScraping : spiders[spiderIdx].config.bypassAntiScraping,
    userAgentType: userAgentType || spiders[spiderIdx].config.userAgentType,
    filters: {
      includeKeywords: filters?.includeKeywords || spiders[spiderIdx].config.filters.includeKeywords,
      excludeKeywords: filters?.excludeKeywords || spiders[spiderIdx].config.filters.excludeKeywords,
      minDurationPct: filters?.minDurationPct !== undefined ? parseFloat(filters.minDurationPct) : spiders[spiderIdx].config.filters.minDurationPct,
      maxDurationPct: filters?.maxDurationPct !== undefined ? parseFloat(filters.maxDurationPct) : spiders[spiderIdx].config.filters.maxDurationPct,
      uploadDateWithin: filters?.uploadDateWithin || spiders[spiderIdx].config.filters.uploadDateWithin,
      actors: filters?.actors || spiders[spiderIdx].config.filters.actors
    },
    folderId: folderId || spiders[spiderIdx].config.folderId,
    schedulePattern: schedulePattern || spiders[spiderIdx].config.schedulePattern
  };

  spiders[spiderIdx].status.logs.push(`[SYSTEM] Configurations updated by administrator.`);
  writeJsonFile(SPIDERS_FILE, spiders);
  res.json(spiders[spiderIdx]);
});

// DELETE configuration spider
app.delete("/api/spiders/:id", (req, res) => {
  const spiderId = req.params.id;
  spiders = spiders.filter((s: any) => s.config.id !== spiderId);
  writeJsonFile(SPIDERS_FILE, spiders);
  res.json({ success: true });
});

// START specific spider
app.post("/api/spiders/:id/start", (req, res) => {
  const spiderId = req.params.id;
  const spider = spiders.find((s: any) => s.config.id === spiderId);
  if (!spider) {
    return res.status(404).json({ error: "Spider not found." });
  }

  spider.status.state = "running";
  spider.status.startTime = new Date().toISOString();
  spider.status.currentAction = `Spinning up crawler pool nodes for ${spider.config.name}...`;
  spider.status.logs.push(`[SYSTEM] Trigger starting sequence. Initializing proxy pool.`);
  
  pendingNotifications.push({
    type: "info",
    title: spider.config.name,
    body: `Crawler thread triggered. Scraping ${spider.config.targetUrls.length} parent nodes.`,
    time: new Date().toLocaleTimeString()
  });

  writeJsonFile(SPIDERS_FILE, spiders);
  res.json(spider);
});

// PAUSE running spider
app.post("/api/spiders/:id/pause", (req, res) => {
  const spiderId = req.params.id;
  const spider = spiders.find((s: any) => s.config.id === spiderId);
  if (!spider) {
    return res.status(404).json({ error: "Spider not found." });
  }

  spider.status.state = "paused";
  spider.status.crawlRate = 0;
  spider.status.currentAction = "Crawl suspended by administrator control.";
  spider.status.logs.push(`[ACTION] Suspended request queue dynamically. Releasing thread loops.`);
  
  writeJsonFile(SPIDERS_FILE, spiders);
  res.json(spider);
});

// RESUME paused spider
app.post("/api/spiders/:id/resume", (req, res) => {
  const spiderId = req.params.id;
  const spider = spiders.find((s: any) => s.config.id === spiderId);
  if (!spider) {
    return res.status(404).json({ error: "Spider not found." });
  }

  spider.status.state = "running";
  spider.status.currentAction = "Re-binding HTTP target streams. Resuming queue.";
  spider.status.logs.push(`[ACTION] Re-bound requests. Hydrating request channels.`);
  
  writeJsonFile(SPIDERS_FILE, spiders);
  res.json(spider);
});

// STOP spider, set to idle
app.post("/api/spiders/:id/stop", (req, res) => {
  const spiderId = req.params.id;
  const spider = spiders.find((s: any) => s.config.id === spiderId);
  if (!spider) {
    return res.status(404).json({ error: "Spider spider not found." });
  }

  spider.status.state = "idle";
  spider.status.crawlRate = 0;
  spider.status.endTime = new Date().toISOString();
  spider.status.currentAction = "Idle. Manual scan finished.";
  spider.status.logs.push(`[SYSTEM] Closed active connection pool. Stream harvest finalized.`);
  
  writeJsonFile(SPIDERS_FILE, spiders);
  res.json(spider);
});

// RESET failed spider
app.post("/api/spiders/:id/reset", (req, res) => {
  const spiderId = req.params.id;
  const spider = spiders.find((s: any) => s.config.id === spiderId);
  if (!spider) {
    return res.status(404).json({ error: "Spider not found." });
  }

  spider.status.state = "idle";
  spider.status.pagesProcessed = 0;
  spider.status.urlsFound = 0;
  spider.status.urlsSaved = 0;
  spider.status.errorCount = 0;
  spider.status.lastErrorReason = undefined;
  spider.status.currentAction = "Reset complete. Ready to crawl.";
  spider.status.logs.push(`[SYSTEM] Database stats cleared. Proxy stack recalibrated.`);
  
  writeJsonFile(SPIDERS_FILE, spiders);
  res.json(spider);
});

// GET saved/crawled video URL collection
app.get("/api/urls", (req, res) => {
  let filtered = [...urls];
  const { keyword, category, spiderId, resolution, minDuration, maxDuration } = req.query;

  if (keyword) {
    const kw = String(keyword).toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(kw) || 
      item.url.toLowerCase().includes(kw) ||
      item.pornstars.some(p => p.toLowerCase().includes(kw)) ||
      item.channelName.toLowerCase().includes(kw)
    );
  }

  if (category) {
    if (category !== "f-all") {
      filtered = filtered.filter(item => item.category === category);
    }
  }

  if (spiderId) {
    filtered = filtered.filter(item => item.spiderId === spiderId);
  }

  if (resolution) {
    filtered = filtered.filter(item => item.resolution === resolution);
  }

  if (minDuration) {
    // duration passed in minutes
    filtered = filtered.filter(item => (item.durationSec / 60) >= parseFloat(String(minDuration)));
  }

  if (maxDuration) {
    filtered = filtered.filter(item => (item.durationSec / 60) <= parseFloat(String(maxDuration)));
  }

  res.json(filtered);
});

// POST to update categorization of crawled links
app.post("/api/urls/categorize", (req, res) => {
  const { urlIds, categoryId } = req.body;
  if (!urlIds || !Array.isArray(urlIds) || !categoryId) {
    return res.status(400).json({ error: "Required fields: urlIds (array) and categoryId" });
  }

  urls = urls.map(item => {
    if (urlIds.includes(item.id)) {
      return { ...item, category: categoryId };
    }
    return item;
  });

  writeJsonFile(URLS_FILE, urls);
  res.json({ success: true, updatedCount: urlIds.length });
});

// DELETE single crawled URL entry
app.delete("/api/urls/:id", (req, res) => {
  const urlId = req.params.id;
  urls = urls.filter((u: any) => u.id !== urlId);
  writeJsonFile(URLS_FILE, urls);
  res.json({ success: true });
});

// GET Metrics array
app.get("/api/metrics", (req, res) => {
  res.json(metricPoints);
});

// Server Static files & Vite logic setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://0.0.0.0:3000");
  });
}

startServer();
