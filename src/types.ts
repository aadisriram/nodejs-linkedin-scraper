/**
 * Public LinkedIn profile types. Every section after the core identity fields
 * is optional because guest/public HTML varies by profile.
 */

export interface DateRange {
  start?: string;
  end?: string;
  current?: boolean;
  raw?: string;
}

export interface Position {
  title?: string;
  companyName?: string;
  companyUrl?: string;
  locality?: string;
  description?: string;
  dates?: DateRange;
}

export interface Education {
  school?: string;
  schoolUrl?: string;
  degree?: string;
  fieldOfStudy?: string;
  dates?: DateRange;
  description?: string;
}

export interface Project {
  name?: string;
  description?: string;
  url?: string;
  dates?: DateRange;
}

export interface Honor {
  title?: string;
  issuer?: string;
  description?: string;
  dates?: DateRange;
}

export interface Language {
  name?: string;
  proficiency?: string;
}

export interface Volunteering {
  role?: string;
  organization?: string;
  organizationUrl?: string;
  description?: string;
  dates?: DateRange;
}

export interface Publication {
  title?: string;
  publisher?: string;
  description?: string;
  url?: string;
  dates?: DateRange;
}

export interface Recommendation {
  text?: string;
  recommenderName?: string;
  recommenderTitle?: string;
}

export interface LinkedInProfile {
  publicProfileUrl: string;
  name?: string;
  headline?: string;
  location?: string;
  pictureUrl?: string;
  summary?: string;
  positions: Position[];
  educations: Education[];
  skills: string[];
  projects: Project[];
  honors: Honor[];
  languages: Language[];
  volunteering: Volunteering[];
  publications: Publication[];
  recommendations: Recommendation[];
  websites: string[];
  /** data-section attribute values found on the public page */
  sectionsPresent: string[];
}

export interface ScrapeOptions {
  /** Request timeout in milliseconds (default 20000) */
  timeoutMs?: number;
  /** Explicit proxy URL, e.g. http://user:pass@host:port */
  proxyUrl?: string;
  /** Override default browser-like User-Agent */
  userAgent?: string;
  /** Override Accept-Language (default en-US,en;q=0.9) */
  acceptLanguage?: string;
  /** Custom fetch implementation (for tests) */
  fetchImpl?: typeof fetch;
}

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export const DEFAULT_ACCEPT_LANGUAGE = "en-US,en;q=0.9";
export const DEFAULT_TIMEOUT_MS = 20_000;
