// Turns a review-packet API response into a single, self-contained HTML
// file the user can download, open in any browser offline, and print to
// PDF from there. No extra dependency (jsPDF etc.) needed for this.

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "record";
}

export function buildReviewPacketHtml(packet) {
  const { meta, metrics = [], generatedSections = [], validationWarnings = [], missingFields = [], userNotes = [] } =
    packet;

  const generatedAt = new Date(meta.generatedAt).toLocaleString();
  const ownerLabel = meta.owner ? `${meta.owner.name} (${meta.owner.email})` : "Unknown owner";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Review Packet — ${escapeHtml(meta.moduleLabel)} — ${escapeHtml(meta.owner?.name || "")}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 40px; color: #1e1b2e; background: #fff; line-height: 1.55; }
  .wrap { max-width: 800px; margin: 0 auto; }
  header { border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 28px; }
  .kicker { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; font-weight: 700; }
  h1 { font-size: 26px; margin: 4px 0 10px; }
  .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 24px; font-size: 12.5px; color: #4b4560; }
  .meta-grid strong { color: #1e1b2e; }
  .badge { display: inline-block; font-size: 10.5px; font-weight: 700; padding: 2px 9px; border-radius: 999px; margin-left: 6px; vertical-align: middle; }
  .badge.complete { background: #d1fae5; color: #065f46; }
  .badge.incomplete { background: #fef3c7; color: #92400e; }
  section { margin-bottom: 28px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.06em; color: #5b21b6; border-bottom: 1px solid #e5e0f5; padding-bottom: 6px; margin-bottom: 12px; }
  .section-body { font-size: 13.5px; white-space: pre-wrap; }
  .source-tag { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-left: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #eee; }
  ul { margin: 0; padding-left: 20px; font-size: 13.5px; }
  li { margin-bottom: 6px; }
  .warn-list li { color: #92400e; }
  .missing-list li { color: #9d174d; }
  .note { border-left: 3px solid #7c3aed; padding: 8px 12px; margin-bottom: 10px; background: #faf8ff; font-size: 13px; }
  .note-meta { font-size: 10.5px; color: #6b7280; margin-top: 4px; }
  .empty { font-size: 13px; color: #9ca3af; font-style: italic; }
  footer { margin-top: 40px; padding-top: 14px; border-top: 1px solid #eee; font-size: 10.5px; color: #9ca3af; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="kicker">LifeOS · Agent Task Review Packet</div>
    <h1>${escapeHtml(meta.moduleLabel)} record
      <span class="badge ${meta.checklist.complete ? "complete" : "incomplete"}">${meta.checklist.done}/${meta.checklist.total} sources ready</span>
    </h1>
    <div class="meta-grid">
      <div><strong>Owner:</strong> ${escapeHtml(ownerLabel)}</div>
      <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
      <div><strong>Task ID:</strong> ${escapeHtml(String(meta.taskId))}</div>
    </div>
  </header>

  ${generatedSections
    .map(
      (s) => `<section>
    <h2>${escapeHtml(s.heading)}<span class="source-tag">${s.source === "ai" ? "AI-generated" : "Template"}</span></h2>
    <div class="section-body">${escapeHtml(s.body)}</div>
  </section>`
    )
    .join("\n")}

  <section>
    <h2>Key Metrics</h2>
    ${
      metrics.length
        ? `<table>${metrics
            .map((m) => `<tr><td>${escapeHtml(m.label)}</td><td><strong>${escapeHtml(m.value)}</strong></td></tr>`)
            .join("")}</table>`
        : `<p class="empty">No metrics available.</p>`
    }
  </section>

  <section>
    <h2>Validation Warnings (${validationWarnings.length})</h2>
    ${
      validationWarnings.length
        ? `<ul class="warn-list">${validationWarnings.map((w) => `<li>${escapeHtml(w.message)}</li>`).join("")}</ul>`
        : `<p class="empty">No validation warnings were flagged.</p>`
    }
  </section>

  <section>
    <h2>Missing Fields (${missingFields.length})</h2>
    ${
      missingFields.length
        ? `<ul class="missing-list">${missingFields.map((f) => `<li>${escapeHtml(f.label)}</li>`).join("")}</ul>`
        : `<p class="empty">All required sources are marked complete.</p>`
    }
  </section>

  <section>
    <h2>Reviewer Notes (${userNotes.length})</h2>
    ${
      userNotes.length
        ? userNotes
            .map(
              (n) =>
                `<div class="note">${escapeHtml(n.text)}<div class="note-meta">— ${escapeHtml(
                  n.author || "Unknown"
                )}, ${escapeHtml(new Date(n.createdAt).toLocaleString())}</div></div>`
            )
            .join("\n")
        : `<p class="empty">No reviewer notes yet.</p>`
    }
  </section>

  <footer>Generated by LifeOS · This packet reflects live data at the time of export and is not automatically re-synced.</footer>
</div>
</body>
</html>`;
}

export function downloadReviewPacket(packet) {
  if (!packet) return;
  const html = buildReviewPacketHtml(packet);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const ownerSlug = slugify(packet.meta.owner?.name || "user");
  const dateSlug = new Date(packet.meta.generatedAt).toISOString().slice(0, 10);

  const a = document.createElement("a");
  a.href = url;
  a.download = `review-packet-${packet.meta.module}-${ownerSlug}-${dateSlug}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
