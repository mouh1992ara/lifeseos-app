import { NextResponse } from "next/server";
import { isIP } from "node:net";
import { analyzeRatelimit } from "@/lib/ratelimit";

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 10000;

function isPrivateIPv4(ip: string) {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string) {
  const normalized = ip.toLowerCase();

  if (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    const mappedIPv4 = normalized.replace("::ffff:", "");

    if (isIP(mappedIPv4) === 4) {
      return isPrivateIPv4(mappedIPv4);
    }
  }

  return false;
}

function isBlockedIPAddress(ip: string) {
  const version = isIP(ip);

  if (version === 4) {
    return isPrivateIPv4(ip);
  }

  if (version === 6) {
    return isPrivateIPv6(ip);
  }

  return false;
}

function validateTargetUrl(rawUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("Please enter a valid website URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("URLs containing credentials are not allowed.");
  }

  const hostname = parsedUrl.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "");

  if (
    hostname === "localhost" ||
    hostname === "localhost.localdomain" ||
    hostname === "metadata.google.internal" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("This website address is not allowed.");
  }

  if (isIP(hostname) && isBlockedIPAddress(hostname)) {
    throw new Error(
      "Private or internal network addresses are not allowed."
    );
  }

  return parsedUrl;
}

async function safeFetch(initialUrl: string) {
  let currentUrl = validateTargetUrl(initialUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "LifeSeos SEO Analyzer",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.get("location")
    ) {
      if (redirectCount >= MAX_REDIRECTS) {
        throw new Error("Too many redirects.");
      }

      const redirectUrl = new URL(
        response.headers.get("location")!,
        currentUrl
      ).toString();

      currentUrl = validateTargetUrl(redirectUrl);
      continue;
    }

    const contentType = response.headers.get("content-type") || "";

    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      throw new Error("The URL does not appear to be an HTML webpage.");
    }

    const contentLength = Number(
      response.headers.get("content-length") || "0"
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_RESPONSE_BYTES
    ) {
      throw new Error("The webpage is too large to analyze.");
    }

    const buffer = await response.arrayBuffer();

    if (buffer.byteLength > MAX_RESPONSE_BYTES) {
      throw new Error("The webpage is too large to analyze.");
    }

    const html = new TextDecoder().decode(buffer);

    return {
      response,
      html,
      finalUrl: currentUrl.toString(),
    };
  }

  throw new Error("Too many redirects.");
}
export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    const { success } = await analyzeRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many SEO analysis requests. Please wait a moment and try again.",
        },
        {
          status: 429,
        }
      );
    }

    const body = await request.json();

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    if (!url) {
      return NextResponse.json(
        {
          error: "URL is required",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedUrl =
      /^https?:\/\//i.test(url)
        ? url
        : `https://${url}`;

    const {
      response,
      html,
      finalUrl,
    } = await safeFetch(normalizedUrl);

    const titleMatch = html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );

    const title =
      titleMatch?.[1]
        ?.replace(/\s+/g, " ")
        .trim() || "No title found";

    const descriptionMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
      );

    const description =
      descriptionMatch?.[1]?.trim() ||
      "No description found";

    const h1Match = html.match(
      /<h1[^>]*>([\s\S]*?)<\/h1>/i
    );

    const h1 =
      h1Match?.[1]
        ?.replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim() || "No H1 found";

    const images =
      html.match(/<img\b[^>]*>/gi) || [];

    const missingAlt = images.filter(
      (img) =>
        !/\salt\s*=\s*["'][^"']*["']/i.test(img)
    );

    const canonicalMatch =
      html.match(
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
      ) ||
      html.match(
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i
      );

    const canonical =
      canonicalMatch?.[1] || "Not found";

    const robotsMatch =
      html.match(
        /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i
      );

    const robots =
      robotsMatch?.[1] || "Not found";

    const ogTitleMatch =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
      );

    const ogDescriptionMatch =
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i
      );

    const ogTitle =
      ogTitleMatch?.[1] || "Not found";

    const ogDescription =
      ogDescriptionMatch?.[1] || "Not found";

    let score = 100;

    const passed: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (title !== "No title found") {
      passed.push("Page title detected");
    } else {
      score -= 15;
      errors.push("Missing page title");
    }

    if (description !== "No description found") {
      passed.push("Meta description detected");
    } else {
      score -= 15;
      errors.push("Missing meta description");
    }

    if (h1 !== "No H1 found") {
      passed.push("H1 heading detected");
    } else {
      score -= 15;
      errors.push("Missing H1 heading");
    }

    if (canonical !== "Not found") {
      passed.push("Canonical URL detected");
    } else {
      score -= 10;
      warnings.push("Missing canonical URL");
    }

    if (
      images.length > 0 &&
      missingAlt.length === 0
    ) {
      passed.push("Images ALT attributes detected");
    } else if (images.length > 0) {
      score -= 10;
      warnings.push("Some images missing ALT attributes");
    }

    if (ogTitle !== "Not found") {
      passed.push("Social OG title detected");
    } else {
      score -= 5;
      warnings.push("Missing social metadata");
    }

    score = Math.max(score, 0);

    let grade = "F";

    if (score >= 90) grade = "A";
    else if (score >= 75) grade = "B";
    else if (score >= 60) grade = "C";
    else if (score >= 40) grade = "D";

    const recommendations = [
      ...errors,
      ...warnings,
    ];

    return NextResponse.json({
      url: finalUrl,
      score,
      grade,
      status:
        score >= 80
          ? "Excellent"
          : score >= 60
            ? "Good"
            : "Needs Improvement",
      title,
      description,
      h1,
      images: {
        total: images.length,
        missingAlt: missingAlt.length,
      },
      canonical,
      robots,
      social: {
        ogTitle,
        ogDescription,
      },
      passed,
      errors,
      warnings,
      recommendations,
    });
  } catch (error) {
    console.error("SEO analyzer error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to analyze website";

    const safeMessages = [
      "Please enter a valid website URL.",
      "Only HTTP and HTTPS URLs are allowed.",
      "URLs containing credentials are not allowed.",
      "This website address is not allowed.",
      "Private or internal network addresses are not allowed.",
      "Too many redirects.",
      "The URL does not appear to be an HTML webpage.",
      "The webpage is too large to analyze.",
    ];

    return NextResponse.json(
      {
        error: safeMessages.includes(message)
          ? message
          : "Unable to analyze website",
      },
      {
        status: 400,
      }
    );
  }
}
