/**
 * AI Bug Analysis Utilities
 *
 * Uses Cloudflare AI Gateway to route requests to Google Gemini
 * for multimodal analysis of bug reports (screenshots and videos).
 */

import type {
  BugReport,
  BugAIAnalysis,
  BugSolution,
  ScreenshotAnalysis,
  VideoAnalysis,
  AIAnalysisConfidence,
  DocReference,
} from "@shared/types";
import type { Env } from "./core-utils";
import { getRelevantDocsContext, searchDocs } from "./docs-context";

// System prompt for bug analysis (documentation-enhanced)
const BUG_ANALYSIS_SYSTEM_PROMPT = `You are an expert software debugging assistant for the Metabolic Reset Challenge platform.

You have access to the platform's internal documentation which provides details about the architecture, components, and common patterns. Use this documentation to provide accurate, context-aware analysis.

When analyzing bug reports:
1. Reference relevant documentation sections when applicable
2. Identify the most likely technical cause based on the platform architecture
3. Provide actionable solutions with step-by-step instructions
4. Cite which documentation articles are relevant to the issue
5. Include confidence level based on available information

Format your response as valid JSON with the following structure:
{
  "summary": "Brief summary of the bug",
  "suggestedCause": "Technical explanation of likely cause, referencing specific files/components from docs",
  "suggestedSolutions": [
    {
      "title": "Solution title",
      "description": "Detailed description referencing relevant code/components",
      "steps": ["Step 1", "Step 2", ...],
      "estimatedEffort": "quick|moderate|significant",
      "confidence": "low|medium|high"
    }
  ],
  "relatedDocs": [
    {
      "sectionId": "section-id from docs",
      "articleId": "article-id from docs",
      "relevance": "Why this doc is relevant to the bug"
    }
  ],
  "confidence": "low|medium|high"
}`;

const SCREENSHOT_ANALYSIS_PROMPT = `Analyze this screenshot from a bug report. Describe:
1. What UI elements are visible
2. Any error messages or unexpected states
3. What might be causing the reported issue

Format as JSON:
{
  "description": "What you see in the screenshot",
  "visibleErrors": ["error1", "error2"],
  "uiElements": ["element1", "element2"],
  "potentialIssues": ["issue1", "issue2"]
}`;

const VIDEO_ANALYSIS_PROMPT = `Analyze this screen recording from a bug report. Identify:
1. User actions and the sequence of events
2. Reproduction steps to recreate the bug
3. Key timestamps where issues occur

Format as JSON:
{
  "description": "Overall description of what happens",
  "reproductionSteps": ["Step 1", "Step 2", ...],
  "userActions": ["action1", "action2", ...],
  "timestamps": [{"seconds": 0, "description": "what happens"}],
  "errorMoments": [{"seconds": 0, "description": "error description"}]
}`;

interface AIGatewayConfig {
  accountId: string;
  gatewayId: string;
  geminiApiKey: string;
}

/**
 * Call Gemini API through Cloudflare AI Gateway (with direct API fallback)
 */
async function callGemini(
  config: AIGatewayConfig,
  prompt: string,
  systemPrompt: string,
  imageBase64?: string,
  videoUrl?: string
): Promise<string> {
  console.log('[AI Analysis] callGemini started', {
    hasImage: !!imageBase64,
    imageSize: imageBase64 ? `${(imageBase64.length / 1024).toFixed(1)}KB` : 'none',
    hasVideo: !!videoUrl,
    promptLength: prompt.length,
    systemPromptLength: systemPrompt.length
  });

  // Try AI Gateway first, then fall back to direct Gemini API
  const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${config.accountId}/${config.gatewayId}/google-ai-studio`;
  const directUrl = `https://generativelanguage.googleapis.com`;

  // Build the content parts
  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

  // Add text prompt
  parts.push({ text: `${systemPrompt}\n\n${prompt}` });

  // Add image if provided
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: "image/png",
        data: imageBase64
      }
    });
  }

  // For video analysis, we'd need to use Gemini's file API
  // For now, include video URL in the text prompt
  if (videoUrl) {
    parts.push({ text: `\n\nVideo URL for reference: ${videoUrl}` });
  }

  const requestBody = JSON.stringify({
    contents: [
      {
        parts
      }
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      maxOutputTokens: 4096  // Increased to prevent truncation
    }
  });

  console.log('[AI Analysis] Request body size:', `${(requestBody.length / 1024).toFixed(1)}KB`);

  // Use Gemini 3 Flash for best vision capabilities (released Dec 17, 2025)
  // 81.2% on MMMU-Pro benchmark, excellent for visual analysis
  const modelName = 'gemini-3-flash-preview';
  console.log('[AI Analysis] Using model:', modelName);
  console.log('[AI Analysis] Trying AI Gateway:', `${gatewayUrl}/v1beta/models/${modelName}:generateContent`);

  // Try AI Gateway first
  let response = await fetch(`${gatewayUrl}/v1beta/models/${modelName}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": config.geminiApiKey
    },
    body: requestBody
  });

  console.log('[AI Analysis] AI Gateway response:', response.status, response.statusText);

  // If AI Gateway fails, fall back to direct Gemini API
  if (!response.ok) {
    const gatewayError = await response.text();
    console.warn(`[AI Analysis] AI Gateway failed (${response.status}):`, gatewayError);
    console.log('[AI Analysis] Falling back to direct Gemini API:', directUrl);

    response = await fetch(`${directUrl}/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: requestBody
    });

    console.log('[AI Analysis] Direct Gemini response:', response.status, response.statusText);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI Analysis] FINAL ERROR - Gemini API failed:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  console.log('[AI Analysis] Gemini API call successful, parsing response...');

  const data = await response.json() as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  // Extract text from response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('[AI Analysis] No response text in Gemini response:', JSON.stringify(data).slice(0, 500));
    throw new Error("No response text from Gemini");
  }

  console.log('[AI Analysis] Got response text, length:', text.length);
  console.log('[AI Analysis] Response preview:', text.slice(0, 300) + '...');

  return text;
}

/**
 * Parse JSON from AI response (handles markdown code blocks and malformed JSON)
 */
function parseJsonResponse<T>(text: string): T {
  console.log('[AI Analysis] parseJsonResponse called, input length:', text.length);

  // Remove markdown code blocks if present
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.slice(7);
    console.log('[AI Analysis] Removed ```json prefix');
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.slice(3);
    console.log('[AI Analysis] Removed ``` prefix');
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.slice(0, -3);
    console.log('[AI Analysis] Removed ``` suffix');
  }
  cleanText = cleanText.trim();

  try {
    const parsed = JSON.parse(cleanText) as T;
    console.log('[AI Analysis] JSON parsed successfully');
    return parsed;
  } catch (e) {
    console.error('[AI Analysis] JSON parse failed:', e);
    console.error('[AI Analysis] Failed to parse text (first 1000 chars):', cleanText.slice(0, 1000));

    // Try to repair truncated JSON
    console.log('[AI Analysis] Attempting to repair truncated JSON...');
    const repaired = attemptJsonRepair(cleanText);
    if (repaired) {
      try {
        const parsed = JSON.parse(repaired) as T;
        console.log('[AI Analysis] JSON repaired and parsed successfully');
        return parsed;
      } catch (e2) {
        console.error('[AI Analysis] Repaired JSON still failed to parse:', e2);
      }
    }

    throw e;
  }
}

/**
 * Attempt to repair truncated JSON by closing open brackets/braces
 */
function attemptJsonRepair(text: string): string | null {
  try {
    // Count open brackets and braces
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\' && inString) {
        escaped = true;
        continue;
      }

      if (char === '"' && !escaped) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets--;
      }
    }

    console.log('[AI Analysis] JSON repair: openBraces=', openBraces, 'openBrackets=', openBrackets, 'inString=', inString);

    // If we're in a string, try to close it
    let repaired = text;
    if (inString) {
      // Find the last property and truncate there if possible
      const lastQuoteIndex = repaired.lastIndexOf('"');
      if (lastQuoteIndex > 0) {
        // Check if this looks like it's in the middle of a value
        const beforeQuote = repaired.slice(0, lastQuoteIndex);
        const colonIndex = beforeQuote.lastIndexOf(':');
        const commaIndex = beforeQuote.lastIndexOf(',');

        if (colonIndex > commaIndex) {
          // We're likely in the middle of a value, truncate to before the colon and add placeholder
          repaired = repaired.slice(0, lastQuoteIndex) + '..."';
        } else {
          repaired = repaired + '"';
        }
      } else {
        repaired = repaired + '"';
      }
    }

    // Close any remaining brackets/braces
    while (openBrackets > 0) {
      repaired += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      repaired += '}';
      openBraces--;
    }

    console.log('[AI Analysis] Repaired JSON (last 200 chars):', repaired.slice(-200));
    return repaired;
  } catch (e) {
    console.error('[AI Analysis] JSON repair failed:', e);
    return null;
  }
}

/**
 * Fetch image from R2 and convert to base64
 */
async function fetchImageAsBase64(env: Env, url: string): Promise<string | null> {
  console.log('[AI Analysis] fetchImageAsBase64 called with URL:', url);

  try {
    // Cast env to access R2 bucket (runtime-injected binding)
    const bucket = (env as any).BUCKET || (env as any).BUG_REPORTS_BUCKET;

    // Handle relative URLs that reference our API media endpoint
    // Format: /api/media/bugs/abc123/screenshot.png -> bugs/abc123/screenshot.png
    if (url.startsWith('/api/media/')) {
      const key = url.replace('/api/media/', '');
      console.log('[AI Analysis] Fetching from R2 with key:', key);

      if (!bucket) {
        console.error('[AI Analysis] R2 bucket not configured');
        return null;
      }

      const object = await bucket.get(key);
      if (!object) {
        console.error('[AI Analysis] Image not found in R2:', key);
        return null;
      }

      const arrayBuffer = await object.arrayBuffer();
      console.log('[AI Analysis] Image fetched from R2, size:', arrayBuffer.byteLength, 'bytes');
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      console.log('[AI Analysis] Image converted to base64, length:', base64.length);
      return base64;
    }

    // If it's an R2 URL, fetch from R2 bucket
    if (url.includes("/uploads/") || url.includes("r2.dev")) {
      // Extract key from URL
      const urlObj = new URL(url);
      const key = urlObj.pathname.replace(/^\//, "");
      console.log('[AI Analysis] Fetching from R2 with key:', key);

      if (!bucket) {
        console.error('[AI Analysis] R2 bucket not configured');
        return null;
      }

      const object = await bucket.get(key);
      if (!object) {
        console.error('[AI Analysis] Image not found in R2:', key);
        return null;
      }

      const arrayBuffer = await object.arrayBuffer();
      console.log('[AI Analysis] Image fetched from R2, size:', arrayBuffer.byteLength, 'bytes');
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      console.log('[AI Analysis] Image converted to base64, length:', base64.length);
      return base64;
    }

    // Otherwise fetch from external URL
    console.log('[AI Analysis] Fetching from external URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[AI Analysis] Failed to fetch image:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('[AI Analysis] Image fetched from URL, size:', arrayBuffer.byteLength, 'bytes');
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    console.log('[AI Analysis] Image converted to base64, length:', base64.length);
    return base64;
  } catch (error) {
    console.error('[AI Analysis] Error fetching image:', error);
    return null;
  }
}

/**
 * Analyze a screenshot using Gemini Vision
 */
async function analyzeScreenshot(
  config: AIGatewayConfig,
  env: Env,
  screenshotUrl: string
): Promise<ScreenshotAnalysis | null> {
  try {
    const imageBase64 = await fetchImageAsBase64(env, screenshotUrl);
    if (!imageBase64) {
      return null;
    }

    const response = await callGemini(
      config,
      SCREENSHOT_ANALYSIS_PROMPT,
      "You are an expert UI/UX analyst. Analyze screenshots and identify issues.",
      imageBase64
    );

    return parseJsonResponse<ScreenshotAnalysis>(response);
  } catch (error) {
    console.error("Screenshot analysis error:", error);
    return null;
  }
}

/**
 * Analyze a video using Gemini (currently URL-based)
 */
async function analyzeVideo(
  config: AIGatewayConfig,
  videoUrl: string
): Promise<VideoAnalysis | null> {
  try {
    // Note: For full video analysis, Gemini requires uploading via File API
    // For now, we include the URL and ask for text-based analysis
    const response = await callGemini(
      config,
      VIDEO_ANALYSIS_PROMPT,
      "You are an expert at analyzing screen recordings. Describe what you would expect to see based on the video URL and any context provided.",
      undefined,
      videoUrl
    );

    return parseJsonResponse<VideoAnalysis>(response);
  } catch (error) {
    console.error("Video analysis error:", error);
    return null;
  }
}

/**
 * Main bug analysis function
 */
export async function analyzeBug(
  env: Env,
  bug: BugReport,
  options: {
    includeScreenshot?: boolean;
    includeVideo?: boolean;
  } = {}
): Promise<Partial<BugAIAnalysis>> {
  const startTime = Date.now();

  console.log('========================================');
  console.log('[AI Analysis] ===== STARTING BUG ANALYSIS =====');
  console.log('[AI Analysis] Bug ID:', bug.id);
  console.log('[AI Analysis] Bug Title:', bug.title);
  console.log('[AI Analysis] Bug Category:', bug.category);
  console.log('[AI Analysis] Bug Severity:', bug.severity);
  console.log('[AI Analysis] Page URL:', bug.pageUrl);
  console.log('[AI Analysis] Has Screenshot:', !!bug.screenshotUrl);
  console.log('[AI Analysis] Has Video:', !!bug.videoUrl);
  console.log('[AI Analysis] Options:', JSON.stringify(options));
  console.log('========================================');

  // Get AI Gateway config from environment (cast to any since these are runtime-injected)
  const envAny = env as any;
  const config: AIGatewayConfig = {
    accountId: envAny.AI_GATEWAY_ACCOUNT_ID || "",
    gatewayId: envAny.AI_GATEWAY_ID || "bug-analysis",
    geminiApiKey: envAny.GEMINI_API_KEY || ""
  };

  console.log('[AI Analysis] Config check:', {
    hasAccountId: !!config.accountId,
    accountIdLength: config.accountId.length,
    hasGatewayId: !!config.gatewayId,
    gatewayId: config.gatewayId,
    hasApiKey: !!config.geminiApiKey,
    apiKeyLength: config.geminiApiKey.length,
    apiKeyPrefix: config.geminiApiKey.slice(0, 10) + '...'
  });

  // Validate config
  if (!config.accountId || !config.geminiApiKey) {
    console.error('[AI Analysis] CONFIG MISSING - accountId or geminiApiKey not set');
    return {
      summary: "AI analysis not configured",
      suggestedCause: "Missing AI Gateway configuration (AI_GATEWAY_ACCOUNT_ID or GEMINI_API_KEY)",
      suggestedSolutions: [{
        title: "Configure AI Gateway",
        description: "Add the required environment variables for AI analysis",
        steps: [
          "Add AI_GATEWAY_ACCOUNT_ID to wrangler.toml or .dev.vars",
          "Add GEMINI_API_KEY to wrangler.toml or .dev.vars",
          "Optionally set AI_GATEWAY_ID (defaults to 'bug-analysis')"
        ],
        estimatedEffort: "quick",
        confidence: "high"
      }],
      modelUsed: "none",
      confidence: "low",
      processingTimeMs: Date.now() - startTime,
      error: "AI Gateway not configured"
    };
  }

  console.log('[AI Analysis] Config validated successfully');

  try {
    // Analyze screenshot if available and requested
    let screenshotAnalysis: ScreenshotAnalysis | undefined;
    if (options.includeScreenshot && bug.screenshotUrl) {
      console.log('[AI Analysis] Starting screenshot analysis...');
      console.log('[AI Analysis] Screenshot URL:', bug.screenshotUrl);
      const result = await analyzeScreenshot(config, env, bug.screenshotUrl);
      if (result) {
        screenshotAnalysis = result;
        console.log('[AI Analysis] Screenshot analysis complete:', JSON.stringify(result).slice(0, 200));
      } else {
        console.log('[AI Analysis] Screenshot analysis returned null');
      }
    } else {
      console.log('[AI Analysis] Skipping screenshot analysis (not requested or no URL)');
    }

    // Analyze video if available and requested
    let videoAnalysis: VideoAnalysis | undefined;
    if (options.includeVideo && bug.videoUrl) {
      console.log('[AI Analysis] Starting video analysis...');
      console.log('[AI Analysis] Video URL:', bug.videoUrl);
      const result = await analyzeVideo(config, bug.videoUrl);
      if (result) {
        videoAnalysis = result;
        console.log('[AI Analysis] Video analysis complete');
      } else {
        console.log('[AI Analysis] Video analysis returned null');
      }
    } else {
      console.log('[AI Analysis] Skipping video analysis (not requested or no URL)');
    }

    // Get relevant documentation context
    console.log('[AI Analysis] Getting relevant documentation context...');
    const docsContext = getRelevantDocsContext(
      bug.pageUrl || '',
      bug.category,
      bug.description
    );
    console.log('[AI Analysis] Documentation context length:', docsContext.length);
    console.log('[AI Analysis] Documentation context preview:', docsContext.slice(0, 300) + '...');

    // Build the main analysis prompt with documentation context
    const bugContext = `
# Platform Documentation Context
${docsContext}

---

# Bug Report Details
- Title: ${bug.title}
- Description: ${bug.description}
- Severity: ${bug.severity}
- Category: ${bug.category}
- Page URL: ${bug.pageUrl}
- User Agent: ${bug.userAgent}
${screenshotAnalysis ? `\n## Screenshot Analysis:\n${JSON.stringify(screenshotAnalysis, null, 2)}` : ""}
${videoAnalysis ? `\n## Video Analysis:\n${JSON.stringify(videoAnalysis, null, 2)}` : ""}

---

Based on the platform documentation context above and this bug report (with any media analysis), provide a comprehensive analysis. Reference specific documentation sections in your response where applicable.`;

    console.log('[AI Analysis] Bug context built, total length:', bugContext.length);
    console.log('[AI Analysis] Calling Gemini for main analysis...');

    const response = await callGemini(
      config,
      bugContext,
      BUG_ANALYSIS_SYSTEM_PROMPT
    );

    console.log('[AI Analysis] Gemini response received, parsing JSON...');

    const analysis = parseJsonResponse<{
      summary: string;
      suggestedCause: string;
      suggestedSolutions: BugSolution[];
      relatedDocs?: Array<{
        sectionId: string;
        articleId: string;
        relevance: string;
      }>;
      confidence: AIAnalysisConfidence;
    }>(response);

    console.log('[AI Analysis] Analysis parsed:', {
      summary: analysis.summary?.slice(0, 100),
      suggestedCause: analysis.suggestedCause?.slice(0, 100),
      solutionCount: analysis.suggestedSolutions?.length || 0,
      relatedDocsCount: analysis.relatedDocs?.length || 0,
      confidence: analysis.confidence
    });

    // Enrich relatedDocs with titles from our documentation
    const relatedDocs: DocReference[] = [];
    if (analysis.relatedDocs && analysis.relatedDocs.length > 0) {
      console.log('[AI Analysis] Enriching relatedDocs with titles...');
      for (const doc of analysis.relatedDocs) {
        // Search for the article to get its title
        const searchResults = searchDocs(`${doc.sectionId} ${doc.articleId}`);
        const match = searchResults.find(
          r => r.sectionId === doc.sectionId && r.articleId === doc.articleId
        );

        if (match) {
          relatedDocs.push({
            sectionId: doc.sectionId,
            sectionTitle: match.sectionTitle,
            articleId: doc.articleId,
            articleTitle: match.articleTitle,
            relevance: doc.relevance,
            excerpt: match.excerpt
          });
        } else {
          // Fallback: use IDs as titles if not found
          relatedDocs.push({
            sectionId: doc.sectionId,
            sectionTitle: doc.sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            articleId: doc.articleId,
            articleTitle: doc.articleId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            relevance: doc.relevance
          });
        }
      }
      console.log('[AI Analysis] RelatedDocs enriched:', relatedDocs.length);
    }

    const processingTime = Date.now() - startTime;
    console.log('[AI Analysis] ===== ANALYSIS COMPLETE =====');
    console.log('[AI Analysis] Processing time:', processingTime, 'ms');

    return {
      summary: analysis.summary,
      suggestedCause: analysis.suggestedCause,
      suggestedSolutions: analysis.suggestedSolutions,
      screenshotAnalysis,
      videoAnalysis,
      relatedDocs: relatedDocs.length > 0 ? relatedDocs : undefined,
      modelUsed: "gemini-3-flash-preview",
      confidence: analysis.confidence,
      processingTimeMs: processingTime
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('========================================');
    console.error('[AI Analysis] ===== ANALYSIS FAILED =====');
    console.error('[AI Analysis] Error message:', errorMessage);
    console.error('[AI Analysis] Error stack:', errorStack);
    console.error('[AI Analysis] Error object:', error);
    console.error('[AI Analysis] Processing time before failure:', Date.now() - startTime, 'ms');
    console.error('========================================');

    return {
      summary: "Analysis failed",
      suggestedCause: "Unable to complete AI analysis",
      suggestedSolutions: [{
        title: "Manual Investigation Required",
        description: "The AI analysis failed. Please review the bug report manually.",
        steps: [
          "Review the bug description and any attached media",
          "Check the browser console for related errors",
          "Try to reproduce the issue locally"
        ],
        estimatedEffort: "moderate",
        confidence: "low"
      }],
      modelUsed: "gemini-3-flash-preview",
      confidence: "low",
      processingTimeMs: Date.now() - startTime,
      error: errorMessage
    };
  }
}
