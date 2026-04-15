# IssueX

IssueX is a browser extension designed to streamline the open-source contribution workflow. It integrates natively into the GitHub user interface, allowing developers to discover, filter, and analyze beginner-friendly issues within a given repository without disrupting their browsing experience.

Powered by a FastAPI backend, the extension analyzes repository issues based on required skills and difficulty levels, injecting actionable summaries directly into GitHub's Document Object Model (DOM).

## Key Features

- **Native UI Integration:** Injects trigger buttons and information panels seamlessly into the GitHub interface using standard GitHub CSS classes.
- **Style Encapsulation:** Utilizes the Shadow DOM API to ensure extension styles do not conflict with or inherit from GitHub's global stylesheets.
- **Contextual Issue Analysis:** Automatically detects the current repository and retrieves relevant issues via a dedicated REST API.
- **Inline Summaries:** Injects persistent analysis summaries directly into specific issue pages utilizing local browser storage to maintain state across navigation.
- **Cross-Browser Support:** Built using standard WebExtensions APIs, ensuring compatibility with Google Chrome (Manifest V3) and Mozilla Firefox.
- **Dynamic DOM Observation:** Employs `MutationObserver` to maintain UI persistence across GitHub's Single Page Application (SPA) navigations.

## Architecture & Technology Stack

**Frontend (Browser Extension)**

- Vanilla JavaScript (ES6+)
- WebExtensions API (Manifest V3 / Event Pages)
- HTML5 / CSS3 (Shadow DOM)

**Backend (API Service)**

- FastAPI
- Hosted on Render (`https://issuex-api.onrender.com`)

## Project Structure

```text
issuex-extension/
├── manifest.chrome.json       # Extension configuration and permissions for Chromium
├── manifest.firefox.json      # Extension configuration and permissions for Mozilla Firefox
├── src/
│   ├── background.js          # Service worker for API communication
│   └── content.js             # DOM manipulation, UI injection, and SPA observation
└── README.md                  # Project documentation
```

## Installation for Development

To run the extension locally, you must load the source code into your browser using developer tools.

**Google Chrome**

1. Open Google Chrome and navigate to chrome://extensions/.
2. Enable Developer mode using the toggle in the top right corner.
3. Click the Load unpacked button.
4. Select the root directory of this project (the folder containing manifest.json).

**Mozilla Firefox**

1. Open Mozilla Firefox and navigate to about:debugging.
2. Select This Firefox from the left-hand sidebar.
3. Click the Load Temporary Add-on... button.
4. Navigate to the project directory and select the manifest.json file.

## Usage Guide

1. Navigate to a Repository: Open any public repository on GitHub (e.g., https://github.com/facebook/react).
2. Trigger the Search: Locate the "Find Issues" button injected into the repository header (adjacent to the Watch/Fork/Star actions) and click it.
3. Review Recommendations: A secure, isolated panel will render on the right side of the screen, displaying issues filtered by your API for beginner accessibility.
4. View Contextual Summaries: Click any issue link from the panel. Upon opening the new tab, IssueX will inject a detailed analysis summary directly below the issue title.

## Permission Required

The `manifest.json` requires the following permissions to operate securely:

- `activeTab`: To read the repository URL of the current active tab.
- `scripting`: To inject the frontend UI logic into the GitHub DOM.
- `storage`: To persist issue analysis data across browser tabs.
- `host_permissions`: To authorize secure network requests to (`https://github.com/*`) and the FastAPI backend.

## Contributing

We welcome contributions to IssueX. Please ensure that any pull requests maintain the Vanilla JavaScript architecture to keep the extension lightweight, and adhere to Manifest V3 security standards.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
