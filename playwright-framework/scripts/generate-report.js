const fs = require("fs");
const path = require("path");

const RESULTS_DIR = path.resolve("allure-results");
const REPORT_DIR = path.resolve("allure-report");

function readAllResults() {
  const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith("-result.json"));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(RESULTS_DIR, f), "utf-8");
    return JSON.parse(raw);
  });
}

function readAttachments(test) {
  if (!test.attachments) return [];
  return test.attachments.map((a) => {
    const filePath = path.join(RESULTS_DIR, a.source);
    if (!fs.existsSync(filePath)) return { ...a, dataUrl: null };
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(a.source).toLowerCase();
    let mime = "application/octet-stream";
    if (ext === ".png") mime = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
    else if (ext === ".webm") mime = "video/webm";
    else if (ext === ".mp4") mime = "video/mp4";
    else if (ext === ".txt" || ext === ".md") mime = "text/plain";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    return { ...a, dataUrl, mime };
  });
}

function flattenSteps(steps, depth = 0) {
  const result = [];
  if (!steps) return result;
  for (const step of steps) {
    result.push({ ...step, depth });
    if (step.steps && step.steps.length > 0) {
      result.push(...flattenSteps(step.steps, depth + 1));
    }
  }
  return result;
}

function formatDuration(start, stop) {
  if (!start || !stop) return "-";
  const ms = stop - start;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getSuiteInfo(test) {
  const labels = test.labels || [];
  const parentSuite = labels.find((l) => l.name === "parentSuite")?.value || "";
  const suite = labels.find((l) => l.name === "suite")?.value || "";
  const subSuite = labels.find((l) => l.name === "subSuite")?.value || "";
  return { parentSuite, suite, subSuite };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusColor(status) {
  const colors = {
    passed: "#00a86b",
    failed: "#e74c3c",
    broken: "#e67e22",
    skipped: "#95a5a6",
    pending: "#95a5a6",
    unknown: "#bdc3c7",
  };
  return colors[status] || "#bdc3c7";
}

function statusIcon(status) {
  const icons = {
    passed: "&#10003;",
    failed: "&#10007;",
    broken: "&#9888;",
    skipped: "&#8725;",
    pending: "&#8987;",
    unknown: "?",
  };
  return icons[status] || "?";
}

function generateReport(results) {
  const total = results.length;
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const broken = results.filter((r) => r.status === "broken").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const other = total - passed - failed - broken - skipped;

  const duration = results.reduce((sum, r) => {
    if (r.start && r.stop) return sum + (r.stop - r.start);
    return sum;
  }, 0);

  // Group by suite
  const suiteMap = {};
  for (const r of results) {
    const info = getSuiteInfo(r);
    const key = `${info.parentSuite} > ${info.suite} > ${info.subSuite}`;
    if (!suiteMap[key]) suiteMap[key] = [];
    suiteMap[key].push(r);
  }

  let suiteHtml = "";
  let suiteIndex = 0;
  for (const [suiteName, tests] of Object.entries(suiteMap)) {
    suiteIndex++;
    const suitePassed = tests.filter((t) => t.status === "passed").length;
    const suiteFailed = tests.filter((t) => t.status === "failed" || t.status === "broken").length;
    const suiteTotal = tests.length;

    let testsHtml = "";
    for (const test of tests) {
      const attachments = readAttachments(test);
      const allSteps = flattenSteps(test.steps);
      const duration = formatDuration(test.start, test.stop);

      let stepsHtml = "";
      if (allSteps.length > 0) {
        stepsHtml = `<div class="steps">`;
        for (const step of allSteps) {
          const indent = step.depth * 16;
          const stepColor = statusColor(step.status);
          const stepDuration = formatDuration(step.start, step.stop);
          stepsHtml += `
            <div class="step" style="padding-left:${indent}px">
              <span class="step-status" style="color:${stepColor}">${statusIcon(step.status)}</span>
              <span class="step-name">${escapeHtml(step.name)}</span>
              <span class="step-duration">${stepDuration}</span>
            </div>`;
        }
        stepsHtml += `</div>`;
      }

      let attachHtml = "";
      if (attachments.length > 0) {
        attachHtml = `<div class="attachments">`;
        for (const att of attachments) {
          if (att.dataUrl) {
            if (att.type === "image/png" || att.type === "image/jpeg") {
              attachHtml += `
                <div class="attachment">
                  <div class="attachment-name">${escapeHtml(att.name || "screenshot")}</div>
                  <img src="${att.dataUrl}" alt="${escapeHtml(att.name)}" class="attachment-img" />
                </div>`;
            } else if (att.type === "video/webm") {
              attachHtml += `
                <div class="attachment">
                  <div class="attachment-name">${escapeHtml(att.name || "video")}</div>
                  <video controls class="attachment-video"><source src="${att.dataUrl}" type="video/webm"></video>
                </div>`;
            } else {
              attachHtml += `
                <div class="attachment">
                  <div class="attachment-name">${escapeHtml(att.name || "file")}</div>
                  <pre class="attachment-text">${escapeHtml(fs.readFileSync(path.join(RESULTS_DIR, att.source), "utf-8").substring(0, 5000))}</pre>
                </div>`;
            }
          }
        }
        attachHtml += `</div>`;
      }

      let statusDetail = "";
      if (test.statusDetails && test.statusDetails.message) {
        statusDetail = `<div class="status-detail">${escapeHtml(test.statusDetails.message)}</div>`;
      }

      const errorHtml =
        test.status === "failed" || test.status === "broken"
          ? `<div class="test-error">${escapeHtml(test.statusDetails?.message || "")}</div>`
          : "";

      testsHtml += `
        <div class="test-card" onclick="this.classList.toggle('expanded')">
          <div class="test-header">
            <span class="test-status-badge" style="background:${statusColor(test.status)}">${statusIcon(test.status)} ${test.status}</span>
            <span class="test-name">${escapeHtml(test.name)}</span>
            <span class="test-duration">${duration}</span>
          </div>
          <div class="test-body">
            ${statusDetail}
            ${errorHtml}
            ${stepsHtml}
            ${attachHtml}
          </div>
        </div>`;
    }

    suiteHtml += `
      <div class="suite" onclick="this.classList.toggle('expanded')">
        <div class="suite-header">
          <span class="suite-toggle">&#9654;</span>
          <span class="suite-name">${escapeHtml(suiteName)}</span>
          <span class="suite-stats">
            <span class="stat-passed">${suitePassed} passed</span>
            ${suiteFailed > 0 ? `<span class="stat-failed">${suiteFailed} failed</span>` : ""}
            <span class="stat-total">${suiteTotal} total</span>
          </span>
        </div>
        <div class="suite-tests">${testsHtml}</div>
      </div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Allure Report - Playwright Automation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #333; }
    .header { background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%); color: white; padding: 24px 32px; }
    .header h1 { font-size: 22px; font-weight: 600; }
    .header .subtitle { opacity: 0.8; font-size: 13px; margin-top: 4px; }
    .summary { display: flex; gap: 16px; padding: 20px 32px; flex-wrap: wrap; }
    .summary-card { background: white; border-radius: 8px; padding: 16px 24px; min-width: 120px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .summary-card .count { font-size: 32px; font-weight: 700; }
    .summary-card .label { font-size: 12px; color: #888; text-transform: uppercase; margin-top: 4px; }
    .summary-card.total .count { color: #333; }
    .summary-card.passed .count { color: #00a86b; }
    .summary-card.failed .count { color: #e74c3c; }
    .summary-card.broken .count { color: #e67e22; }
    .summary-card.skipped .count { color: #95a5a6; }
    .summary-card.duration .count { font-size: 22px; color: #555; }
    .progress-bar { height: 6px; background: #e0e0e0; border-radius: 3px; margin: 0 32px; overflow: hidden; display: flex; }
    .progress-bar .seg-passed { background: #00a86b; height: 100%; }
    .progress-bar .seg-failed { background: #e74c3c; height: 100%; }
    .progress-bar .seg-broken { background: #e67e22; height: 100%; }
    .progress-bar .seg-skipped { background: #95a5a6; height: 100%; }
    .content { padding: 20px 32px; }
    .suite { background: white; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .suite-header { padding: 12px 16px; display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; border-bottom: 1px solid #f0f0f0; }
    .suite-header:hover { background: #fafafa; }
    .suite-toggle { font-size: 10px; color: #999; transition: transform 0.2s; }
    .suite.expanded .suite-toggle { transform: rotate(90deg); }
    .suite-name { font-weight: 600; font-size: 14px; flex: 1; }
    .suite-stats { display: flex; gap: 12px; font-size: 12px; }
    .stat-passed { color: #00a86b; }
    .stat-failed { color: #e74c3c; }
    .stat-total { color: #999; }
    .suite-tests { display: none; }
    .suite.expanded .suite-tests { display: block; }
    .test-card { border-bottom: 1px solid #f0f0f0; }
    .test-card:last-child { border-bottom: none; }
    .test-header { padding: 10px 16px 10px 32px; display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
    .test-header:hover { background: #fafafa; }
    .test-status-badge { padding: 2px 8px; border-radius: 4px; color: white; font-size: 11px; font-weight: 600; white-space: nowrap; text-transform: uppercase; }
    .test-name { flex: 1; font-size: 13px; }
    .test-duration { font-size: 12px; color: #999; white-space: nowrap; }
    .test-body { display: none; padding: 0 16px 16px 52px; }
    .test-card.expanded .test-body { display: block; }
    .status-detail { background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 8px 12px; margin-bottom: 10px; font-size: 12px; color: #856404; }
    .test-error { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 8px 12px; margin-bottom: 10px; font-size: 12px; color: #721c24; white-space: pre-wrap; }
    .steps { margin-bottom: 10px; }
    .step { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 12px; }
    .step-status { font-weight: bold; width: 14px; text-align: center; }
    .step-name { flex: 1; }
    .step-duration { color: #999; white-space: nowrap; }
    .attachments { margin-top: 8px; }
    .attachment { margin-bottom: 10px; }
    .attachment-name { font-size: 11px; color: #888; margin-bottom: 4px; text-transform: uppercase; }
    .attachment-img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
    .attachment-video { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; }
    .attachment-text { background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; padding: 8px; font-size: 11px; overflow-x: auto; max-height: 300px; overflow-y: auto; }
    .footer { text-align: center; padding: 20px; color: #aaa; font-size: 12px; }
    .filter-bar { padding: 12px 32px; display: flex; gap: 8px; }
    .filter-btn { padding: 6px 14px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 12px; }
    .filter-btn.active { background: #2b5876; color: white; border-color: #2b5876; }
    .filter-btn:hover { background: #f0f0f0; }
    .filter-btn.active:hover { background: #1e4259; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Allure Report</h1>
    <div class="subtitle">Playwright Automation &mdash; ${new Date().toLocaleString()}</div>
  </div>

  <div class="summary">
    <div class="summary-card total"><div class="count">${total}</div><div class="label">Total</div></div>
    <div class="summary-card passed"><div class="count">${passed}</div><div class="label">Passed</div></div>
    <div class="summary-card failed"><div class="count">${failed}</div><div class="label">Failed</div></div>
    <div class="summary-card broken"><div class="count">${broken}</div><div class="label">Broken</div></div>
    <div class="summary-card skipped"><div class="count">${skipped}</div><div class="label">Skipped</div></div>
    <div class="summary-card duration"><div class="count">${formatDuration(0, duration)}</div><div class="label">Duration</div></div>
  </div>

  <div class="progress-bar">
    ${total > 0 ? `<div class="seg-passed" style="width:${(passed / total) * 100}%"></div>` : ""}
    ${total > 0 ? `<div class="seg-failed" style="width:${(failed / total) * 100}%"></div>` : ""}
    ${total > 0 ? `<div class="seg-broken" style="width:${(broken / total) * 100}%"></div>` : ""}
    ${total > 0 ? `<div class="seg-skipped" style="width:${(skipped / total) * 100}%"></div>` : ""}
  </div>

  <div class="filter-bar">
    <button class="filter-btn active" onclick="filterTests('all')">All (${total})</button>
    <button class="filter-btn" onclick="filterTests('passed')">Passed (${passed})</button>
    <button class="filter-btn" onclick="filterTests('failed')">Failed (${failed + broken})</button>
    <button class="filter-btn" onclick="filterTests('skipped')">Skipped (${skipped})</button>
  </div>

  <div class="content" id="test-content">
    ${suiteHtml}
  </div>

  <div class="footer">Generated by Allure Playwright Reporter &mdash; ${new Date().toISOString()}</div>

  <script>
    function filterTests(status) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      document.querySelectorAll('.test-card').forEach(card => {
        const badge = card.querySelector('.test-status-badge');
        const s = badge ? badge.textContent.trim().split(' ').pop() : '';
        if (status === 'all') { card.style.display = ''; return; }
        if (status === 'failed' && (s === 'failed' || s === 'broken')) { card.style.display = ''; return; }
        if (status === s) { card.style.display = ''; return; }
        card.style.display = 'none';
      });
    }
  </script>
</body>
</html>`;

  return html;
}

// Deduplicate: keep only the final status per test testCaseId
function deduplicateResults(results) {
  const byTestId = new Map();
  for (const r of results) {
    const testId = r.testCaseId || r.uuid || r.name;
    const existing = byTestId.get(testId);
    if (!existing || (r.status !== "skipped" && existing.status === "skipped")) {
      byTestId.set(testId, r);
    }
  }
  return Array.from(byTestId.values());
}

// Main
const rawResults = readAllResults();
const results = deduplicateResults(rawResults);
console.log(`Found ${rawResults.length} raw results, ${results.length} unique tests in allure-results/`);

if (results.length === 0) {
  console.error("No test results found. Run tests first.");
  process.exit(1);
}

const html = generateReport(results);

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const indexPath = path.join(REPORT_DIR, "index.html");
fs.writeFileSync(indexPath, html, "utf-8");
console.log(`Allure HTML report generated successfully!`);
console.log(`Report path: ${indexPath}`);
