chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchRecommendations") {
    const URL = `https://issuex-api.onrender.com/issues?repo=${request.repo}&level=Beginner`;

    fetch(URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        sendResponse({ success: true, data: data });
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});