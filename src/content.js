function getRepoName() {
  const path = window.location.pathname.split("/").filter(Boolean);
  if (path.length >= 2) return `${path[0]}/${path[1]}`;
  return null;
}

function injectButton() {
  const isButton = document.getElementById("issuex-btn");
  if (isButton) return;
  const container = document.querySelector(".pagehead-actions");
  if (!container) return;
  const newElement = document.createElement("li");
  const btn = document.createElement("button");
  btn.id = "issuex-btn";
  btn.innerHTML = "Find Issues";
  btn.className = "btn btn-sm";
  btn.addEventListener("click", togglePanel);
  newElement.appendChild(btn);
  container.prepend(newElement);
}

function togglePanel() {
  const isPanel = document.getElementById("issuex-panel");
  if (isPanel) {
    isPanel.remove();
    return;
  }
  const repo = getRepoName();
  if (!repo) return alert("Could not detect repository name.");
  const newElement = document.createElement("div");
  newElement.id = "issuex-panel";
  newElement.style.cssText =
    "top: 80px; right: 20px; position: fixed; z-index: 9999; width: 350px";
  const shadowRoot = newElement.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
        <style>
            .panel { background: #ffffff; border: 1px solid #d0d7de; border-radius: 6px; box-shadow: 0 8px 24px rgba(140,149,159,0.2); padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #24292f; max-height: 80vh; overflow-y: auto; }
            .header { border-bottom: 1px solid #d0d7de; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;}
            .header h3 { margin: 0; font-size: 14px; }
            .close-btn { cursor: pointer; background: none; border: none; font-size: 16px; color: #57606a; }
            .loading { text-align: center; color: #57606a; font-size: 13px; margin: 20px 0; }
        </style>
        <div class="panel">
            <div class="header">
                <h3> Recommended for ${repo}</h3>
                <button class="close-btn" id="close-panel">✖</button>
            </div>
            <div id="results" class="loading">Loading...</div>
        </div>
    `;
  document.body.appendChild(newElement);
  const closeBtn = shadowRoot.getElementById("close-panel");
  closeBtn.addEventListener("click", () => {
    newElement.remove();
  });

  chrome.runtime.sendMessage(
    { action: "fetchRecommendations", repo: repo },
    (response) => {
      const resultsContainer = shadowRoot.getElementById("results");
      if (!response || !response.success) {
        resultsContainer.innerHTML = `<p style="color: #cf222e; font-size: 13px;">Error: ${response?.error || "Server Unreachable"}.</p>`;
        return;
      }
      chrome.storage.local.set({ issuex_data: response.data });
      renderIssues(response.data, resultsContainer);
    },
  );
}

function renderIssues(issues, container) {
  if (!issues || issues.length === 0) {
    container.innerHTML =
      '<p style="font-size: 13px; color: #57606a;">No issues found.</p>';
    return;
  }

  const html = issues
    .map(
      (issue) => `
        <div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 12px; margin-bottom: 12px; background: #f6f8fa;">
            <a href="${issue.url}" target="_blank" style="color: #0969da; text-decoration: none; font-weight: 600; font-size: 14px; display: block; margin-bottom: 6px;">
                #${issue.number} ${issue.title}
            </a>
            <div style="font-size: 12px; color: #57606a; margin-bottom: 8px;">
                <strong>Skill:</strong> ${issue.analysis.skill} | <strong>Level:</strong> ${issue.analysis.difficulty}
            </div>
            <p style="font-size: 13px; margin: 0 0 8px 0; color: #24292f; line-height: 1.4;">
                ${issue.analysis.explanation}
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${issue.labels
                  .map(
                    (label) => `
                    <span style="background: #ddf4ff; color: #0969da; padding: 2px 6px; border-radius: 2em; font-size: 11px;">
                        ${label}
                    </span>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `,
    )
    .join("");

  container.innerHTML = html;
  container.classList.remove("loading");
}

function injectIssueSummary() {
  const path = window.location.pathname.split("/").filter(Boolean);
  if (path.length < 4 || path[2] !== "issues" || isNaN(path[3])) return;
  if (document.getElementById("issuex-summary")) return;

  const issueNumber = parseInt(path[3], 10);
  chrome.storage.local.get(["issuex_data"], (result) => {
    if (document.getElementById("issuex-summary")) return;
    const issues = result.issuex_data;
    if (!issues) return;
    const currentIssue = issues.find((i) => i.number === issueNumber);
    if (!currentIssue) return;

    const targetContainer = document.querySelector(
      '[data-testid="issue-header"]',
    );
    if (!targetContainer) {
      console.log("IssueX: Still waiting for GitHub's header DOM to load...");
      return;
    }

    const summaryDiv = document.createElement("div");
    summaryDiv.id = "issuex-summary";
    summaryDiv.style.cssText =
      "margin-bottom: 16px; padding: 12px 16px; background: #ddf4ff; border: 1px solid #54aeff; border-radius: 6px; color: #24292f; font-family: sans-serif;";

    summaryDiv.innerHTML = `
      <div style="font-size: 12px; margin-bottom: 6px;">
        <strong>IssueX Analysis</strong> 
        <span style="margin: 0 8px;">|</span> 
        <strong>Skill:</strong> ${currentIssue.analysis.skill} 
        <span style="margin: 0 8px;">|</span> 
        <strong>Level:</strong> ${currentIssue.analysis.difficulty}
      </div>
      <p style="margin: 0; font-size: 14px; line-height: 1.5;">
          ${currentIssue.analysis.explanation}
      </p>`;
    targetContainer.appendChild(summaryDiv);
  });
}

const observer = new MutationObserver(() => {
  if (!document.getElementById("issuex-btn")) {
    injectButton();
  }

  injectIssueSummary();
});
observer.observe(document.body, { childList: true, subtree: true });
injectButton();
injectIssueSummary();
