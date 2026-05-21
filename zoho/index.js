import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL; // e.g. https://desk.zoho.in/api/v1
const ZOHO_HOST = new URL(BASE_URL).origin; // e.g. https://desk.zoho.in

function getHeaders() {
  return {
    Authorization: `Zoho-oauthtoken ${process.env.ZOHO_TOKEN}`,
    orgId: process.env.ORG_ID,
  };
}

const reportsDir = path.join(__dirname, "reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

// ─── Processed Ticket Tracking ───────────────────────────────────────────────

const PROCESSED_FILE = path.join(__dirname, "processedTickets.json");

function loadProcessedTickets() {
  if (!fs.existsSync(PROCESSED_FILE)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(PROCESSED_FILE, "utf-8"));
    return new Set(Array.isArray(data) ? data : []);
  } catch {
    return new Set();
  }
}

function saveProcessedTickets(processed) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify([...processed], null, 2), "utf-8");
}

// ─── Pagination ──────────────────────────────────────────────────────────────

async function fetchAllTickets() {
  const tickets = [];
  let from = 0;
  const PAGE = 50;

  while (true) {
    const res = await axios.get(`${BASE_URL}/tickets`, {
      headers: getHeaders(),
      params: { from, limit: PAGE, status: "Open", assigneeId: "98595000004494071" },
    });
    const page = res.data.data || [];
    tickets.push(...page);
    if (!res.data.info?.moreRecords) break;
    from += PAGE;
  }

  return tickets;
}

async function fetchAllThreads(ticketId) {
  const threads = [];
  let from = 0;
  const PAGE = 50;

  while (true) {
    const res = await axios.get(`${BASE_URL}/tickets/${ticketId}/threads`, {
      headers: getHeaders(),
      params: { from, limit: PAGE },
    });
    const page = res.data.data || [];
    threads.push(...page);
    if (!res.data.info?.moreRecords) break;
    from += PAGE;
  }

  return threads.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
}

// ─── Download Binary File ────────────────────────────────────────────────────

async function downloadFile(url, savePath) {
  const res = await axios.get(url, { headers: getHeaders(), responseType: "arraybuffer" });
  fs.writeFileSync(savePath, Buffer.from(res.data));
}

// ─── Extract Inline Images from Thread HTML ──────────────────────────────────
// Zoho stores inline images as:
//   <img src="/api/v1/threads/{threadId}/inlineImages/{filename}" />
// We download each, save locally, and replace the <img> tag with markdown.

async function processInlineImages(html, threadId, imagesDir) {
  if (!html) return "";

  // Collect all img tags first (exec loop resets with /g flag)
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*\/?>/gi;
  const matches = [];
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    matches.push({ tag: m[0], src: m[1] });
  }

  let result = html;

  for (let i = 0; i < matches.length; i++) {
    const { tag, src } = matches[i];

    // Only handle Zoho-hosted paths (inline images or attachment content)
    const isZohoPath =
      src.includes("/inlineImages/") ||
      src.includes("/api/v1/threads/") ||
      src.startsWith(ZOHO_HOST);

    if (!isZohoPath) {
      // Remove non-Zoho img tags
      result = result.replace(tag, "");
      continue;
    }

    const fullUrl = src.startsWith("http") ? src : `${ZOHO_HOST}${src}`;

    // Detect extension from URL or default to png
    const urlExt = src.split(".").pop().split("?")[0].toLowerCase();
    const ext = ["png", "jpg", "jpeg", "gif", "webp"].includes(urlExt) ? urlExt : "png";
    const filename = `inline_${threadId}_${i}.${ext}`;
    const savePath = path.join(imagesDir, filename);

    try {
      await downloadFile(fullUrl, savePath);
      console.log(`    Downloaded inline image: ${filename}`);
      result = result.replace(tag, `![image](./images/${filename})`);
    } catch (err) {
      const status = err.response?.status || err.message;
      console.log(`    Inline image skip [${i}]: ${status}`);
      result = result.replace(tag, "");
    }
  }

  return result;
}

// ─── HTML → Readable Text ────────────────────────────────────────────────────
// Called AFTER inline images have already been replaced with markdown refs.

function htmlToText(html) {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/<script[^>]*>.*?<\/script>/gs, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, "  ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
// ─── Conversation Builder ────────────────────────────────────────────────────

async function buildConversation(ticketId, threads, imagesDir) {
  const parts = [];

  for (const thread of threads) {
    try {
      const res = await axios.get(
        `${BASE_URL}/tickets/${ticketId}/threads/${thread.id}`,
        { headers: getHeaders() }
      );

      const rawHtml = res.data.content || "";
      if (!rawHtml) {
        console.log(`    Thread ${thread.id}: empty content, skipping`);
        continue;
      }

      // Step 1: replace <img> tags with markdown refs, download images
      const processedHtml = await processInlineImages(rawHtml, thread.id, imagesDir);

      // Step 2: strip remaining HTML → plain text (markdown refs preserved)
      const text = htmlToText(processedHtml);
      if (!text) continue;

      const sender = thread.author?.name || thread.fromEmailAddress || "Unknown";
      const time = thread.createdTime || "";
      parts.push(`**From:** ${sender}  \n**Time:** ${time}\n\n${text}`);
    } catch (err) {
      console.log(`    Thread ${thread.id} skipped: ${err.response?.data?.errorMessage || err.message}`);
    }
  }

  return parts.join("\n\n---\n\n");
}

// ─── Attachment Images ───────────────────────────────────────────────────────

async function collectAttachmentImages(ticketId, threads, imagesDir) {
  const lines = [];

  async function processAttachment(file, prefix) {
    const contentType = file.contentType || file.type || "";
    if (!contentType.startsWith("image")) return;

    const filename = `${prefix}_${file.name || file.id}`;
    const savePath = path.join(imagesDir, filename);
    const url =
      file.href ||
      `${BASE_URL}/tickets/${ticketId}/attachments/${file.id}/content`;

    try {
      await downloadFile(url, savePath);
      lines.push(`![${file.name || "image"}](./images/${filename})`);
      console.log(`    Downloaded attachment: ${filename}`);
    } catch (err) {
      const status = err.response?.status || err.message;
      console.log(`    Attachment skip (${file.name}): ${status}`);
    }
  }

  // Ticket-level attachments
  try {
    const res = await axios.get(`${BASE_URL}/tickets/${ticketId}/attachments`, { headers: getHeaders() });
    const attachments = res.data.data || [];
    console.log(`  Ticket attachments: ${attachments.length}`);
    for (const file of attachments) await processAttachment(file, ticketId);
  } catch (err) {
    console.log(`  Ticket attachments error: ${err.response?.data?.errorMessage || err.message}`);
  }

  // Thread-level attachments
  for (const thread of threads) {
    try {
      const res = await axios.get(
        `${BASE_URL}/tickets/${ticketId}/threads/${thread.id}/attachments`,
        { headers: getHeaders() }
      );
      const attachments = res.data.data || [];
      if (!attachments.length) continue;
      console.log(`  Thread ${thread.id} attachments: ${attachments.length}`);
      for (const file of attachments) await processAttachment(file, thread.id);
    } catch (err) {
      console.log(`  Thread ${thread.id} attachments error: ${err.response?.data?.errorMessage || err.message}`);
    }
  }

  return lines.join("\n\n");
}

// ─── Per-Ticket Report ───────────────────────────────────────────────────────

async function generateTicketReport(ticketId) {
  // Ticket details
  const detailRes = await axios.get(`${BASE_URL}/tickets/${ticketId}`, { headers: getHeaders() });
  const ticket = detailRes.data;
  const subject = ticket.subject || "No Subject";

  const safeSubject = subject.replace(/[\\/:*?"<>|]/g, "_").trim();
  const ticketDir = path.join(reportsDir, safeSubject);
  const imagesDir = path.join(ticketDir, "images");
  fs.mkdirSync(ticketDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });
  const description = htmlToText(ticket.description || ticket.descriptionText || "");

  // Threads (paginated, sorted oldest → newest)
  const threads = await fetchAllThreads(ticketId);
  console.log(`  Threads: ${threads.length}`);

  // Conversation: inline images extracted + downloaded, text cleaned
  const conversation = await buildConversation(ticketId, threads, imagesDir);

  // Attachment images (ticket-level + thread-level)
  const attachmentImages = await collectAttachmentImages(ticketId, threads, imagesDir);

  const md = `# Ticket Report

## Ticket ID
${ticketId}

## Subject
${subject}

## Description
${description || "No description"}

## Full Conversation

${conversation || "No conversation found"}

## Images
${attachmentImages || "No attachment images"}
`;

  const mdPath = path.join(ticketDir, "ticket.md");
  fs.writeFileSync(mdPath, md, "utf-8");
  console.log(`  [${ticketId}] ticket.md written (${md.length} bytes)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const processed = loadProcessedTickets();

    const allTickets = await fetchAllTickets();
    console.log(`Total tickets fetched: ${allTickets.length}`);

    const newTickets = allTickets.filter((t) => !processed.has(t.id));
    console.log(`New (unprocessed) tickets: ${newTickets.length}`);

    if (newTickets.length === 0) {
      console.log("Nothing to process.");
      return;
    }

    let count = 0;

    for (const t of newTickets) {
      const ticketId = t.id;
      try {
        console.log(`\nProcessing [${ticketId}]...`);
        await generateTicketReport(ticketId);
        processed.add(ticketId);
        saveProcessedTickets(processed);
        count++;
      } catch (err) {
        console.error(`  [${ticketId}] FAILED: ${err.response?.data?.errorMessage || err.message}`);
      }
    }

    console.log(`\nDone. Reports generated: ${count} | Skipped (already processed): ${allTickets.length - newTickets.length}`);
  } catch (error) {
    console.error("Fatal:", error.response?.data || error.message);
    process.exit(1);
  }
}

main();
