export interface SpiderConfig {
  id: string;
  name: string;
  targetUrls: string[];
  depth: number;
  maxUrls: number;
  rateLimitMs: number;
  bypassAntiScraping: boolean;
  userAgentType: 'desktop' | 'mobile' | 'bot' | 'random';
  filters: {
    includeKeywords: string[];
    excludeKeywords: string[];
    minDurationPct?: number; // Representing relative filters
    maxDurationPct?: number; 
    uploadDateWithin?: 'day' | 'week' | 'month' | 'any';
    actors: string[];
  };
  folderId?: string;
  schedulePattern?: string; // 'manual' | '1m' | '5m' | '1h' | 'daily'
}

export interface SpiderStatus {
  id: string;
  state: 'idle' | 'running' | 'paused' | 'failed' | 'completed';
  pagesProcessed: number;
  urlsFound: number;
  urlsSaved: number;
  startTime?: string;
  endTime?: string;
  currentAction: string;
  crawlRate: number; // pages per sec
  dataProcessedKB: number;
  errorCount: number;
  lastErrorReason?: string;
  logs: string[];
}

export interface ScrapedUrl {
  id: string;
  spiderId: string;
  spiderName: string;
  url: string;
  title: string;
  category: string; // Folder name/id
  durationSec: number;
  resolution: '1080p' | '720p' | '480p' | '360p' | 'Unknown';
  uploadDate: string;
  pornstars: string[];
  thumbnails: string[];
  channelName: string;
  fileSizeMB: number;
  extractedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface CrawlMetricPoint {
  timeLabel: string;
  crawlRate: number;
  urlsFiltered: number;
  errors: number;
  memoryUsage: number;
}
