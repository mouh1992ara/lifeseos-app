/**
 * Aggregates the signed-in user's SEO reports into daily buckets for the
 * dashboard analytics.
 *
 * Everything here is a pure function of real `seo_reports` rows: no smoothing,
 * no invented values. A bucket with no audit on that day keeps `null` rather
 * than 0, so the chart draws a gap instead of pretending the score collapsed.
 */

export type ReportRow = {
  id: string;
  url: string;
  score: number;
  grade: string | null;
  status: string | null;
  created_at: string;
};

export type Bucket = {
  /** ISO yyyy-mm-dd (UTC). */
  t: string;
  /** Pre-localised axis label. */
  label: string;
  audits: number;
  avg: number | null;
  best: number | null;
  /** Score per host for this day, `null` when that site was not audited. */
  sites: Record<string, number | null>;
};

/** Short, stable label for a URL: its host, without a leading `www.`. */
export function hostOf(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(
      /^www\./,
      "",
    );
  } catch {
    return url;
  }
}

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

/** The sites with the most audits, in descending order. */
export function topSites(reports: ReportRow[], limit = 3) {
  const counts = new Map<string, number>();
  for (const report of reports) {
    const host = hostOf(report.url);
    counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([host]) => host);
}

/**
 * Daily buckets across the whole history, with gaps preserved and days without
 * audits omitted (an absent day is not a zero).
 */
export function bucketReports(
  reports: ReportRow[],
  sites: string[],
  locale: string,
): Bucket[] {
  if (!reports.length) return [];

  const byDay = new Map<string, ReportRow[]>();
  for (const report of reports) {
    const key = dayKey(report.created_at);
    const list = byDay.get(key);
    if (list) list.push(report);
    else byDay.set(key, [report]);
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, rows]) => {
      const scores = rows.map((r) => Number(r.score ?? 0));
      const sitesMap: Record<string, number | null> = {};

      for (const site of sites) {
        const siteScores = rows
          .filter((r) => hostOf(r.url) === site)
          .map((r) => Number(r.score ?? 0));
        sitesMap[site] = siteScores.length
          ? Math.round(siteScores.reduce((a, b) => a + b, 0) / siteScores.length)
          : null;
      }

      return {
        t: day,
        label: formatter.format(new Date(`${day}T00:00:00Z`)),
        audits: rows.length,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        best: Math.max(...scores),
        sites: sitesMap,
      };
    });
}

/**
 * Deterministic sample buckets.
 *
 * Only used when the account has fewer than two audits — the dashboard then
 * says, in the UI and in the footnote, that it is showing sample data. It is a
 * fixed array, not random, so what you see is reproducible.
 */
export function sampleBuckets(locale: string): { buckets: Bucket[]; sites: string[] } {
  const sites = ["acme-store.com", "northwind.dev"];
  const series = {
    avg: [58, 61, 59, 64, 66, 63, 68, 71, 69, 73, 76, 74, 78, 81],
    a: [52, 55, 57, 60, 61, 58, 63, 66, 65, 69, 72, 70, 75, 79],
    b: [64, 66, 62, 68, 71, 68, 73, 76, 73, 77, 80, 78, 81, 84],
  };

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const now = Date.now();
  const buckets = series.avg.map((avg, i) => {
    const day = new Date(now - (series.avg.length - 1 - i) * 864e5)
      .toISOString()
      .slice(0, 10);
    return {
      t: day,
      label: formatter.format(new Date(`${day}T00:00:00Z`)),
      audits: 1 + (i % 3),
      avg,
      best: Math.max(avg, series.b[i]),
      sites: { [sites[0]]: series.a[i], [sites[1]]: series.b[i] },
    };
  });

  return { buckets, sites };
}

export type SiteRow = { id: string; url: string; score: number; created_at: string };

export type SiteGroup = {
  url: string;
  audits: number;
  average: number;
  best: number;
  latest: SiteRow;
};

/**
 * Groups reports per website for the dashboard "projects" cards. Pure function of
 * the same rows the history table renders, so the two can never disagree.
 */
export function groupBySite(rows: readonly SiteRow[], limit = 6): SiteGroup[] {
  const map = new Map<string, { url: string; audits: number; total: number; best: number; latest: SiteRow }>();

  for (const row of rows) {
    const score = Number(row.score ?? 0);
    const current = map.get(row.url);

    if (!current) {
      map.set(row.url, { url: row.url, audits: 1, total: score, best: score, latest: row });
      continue;
    }

    current.audits += 1;
    current.total += score;
    current.best = Math.max(current.best, score);
    if (new Date(row.created_at) > new Date(current.latest.created_at)) {
      current.latest = row;
    }
  }

  return Array.from(map.values())
    .map((site) => ({
      url: site.url,
      audits: site.audits,
      average: Math.round(site.total / site.audits),
      best: site.best,
      latest: site.latest,
    }))
    .sort((a, b) => b.audits - a.audits || b.average - a.average)
    .slice(0, limit);
}
