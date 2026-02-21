// Content script — runs on https://www.linkedin.com/sales/ssi*
// Parses SSI data from the page and provides a "Save" overlay button.

(function () {
  if (document.getElementById('ssi-analyzer-overlay')) return;

  function parseSSI() {
    const text = document.body.innerText;

    // Debug: log innerText to console for troubleshooting
    console.log('[SSI Analyzer] innerText length:', text.length);

    // Component scores: "12.275 | Establish your professional brand"
    // Use \b word boundary and allow only "|" or whitespace between number and label
    // The number must be at start of line or after newline
    const brandMatch = text.match(/(?:^|\n)\s*(\d+(?:\.\d+)?)\s*\|?\s*Establish your professional brand/im);
    const peopleMatch = text.match(/(?:^|\n)\s*(\d+(?:\.\d+)?)\s*\|?\s*Find the right people/im);
    const insightsMatch = text.match(/(?:^|\n)\s*(\d+(?:\.\d+)?)\s*\|?\s*Engage with insights/im);
    const relationshipsMatch = text.match(/(?:^|\n)\s*(\d+(?:\.\d+)?)\s*\|?\s*Build relationships/im);

    // Rank percentiles — LinkedIn renders as:
    //   "Top\nIndustry SSI rank\n65\n%"  OR  "Industry SSI rank\nTop 65%"
    // Also: "You rank in the top 65%" in the lower section
    const industryRankMatch =
      text.match(/Top\s+Industry SSI rank\s+(\d+)\s*%/i) ||
      text.match(/Industry SSI rank\s+Top\s+(\d+)\s*%/i) ||
      text.match(/People in your industry[\s\S]*?top\s+(\d+)\s*%/i);
    const networkRankMatch =
      text.match(/Top\s+Network SSI rank\s+(\d+)\s*%/i) ||
      text.match(/Network SSI rank\s+Top\s+(\d+)\s*%/i) ||
      text.match(/People in your network[\s\S]*?top\s+(\d+)\s*%/i);

    // Averages: "average SSI of 31" or "average SSI of 31."
    const industryAvgMatch = text.match(/industry\s+have an average SSI of\s+(\d+)/i);
    const networkAvgMatch = text.match(/network\s+have an average SSI of\s+(\d+)/i);

    if (!brandMatch || !peopleMatch || !insightsMatch || !relationshipsMatch) {
      return { error: 'Could not find all 4 component scores on this page. Make sure you are on the LinkedIn SSI page.' };
    }
    if (!industryRankMatch || !networkRankMatch) {
      return { error: 'Could not find Industry or Network rank percentiles. The page may still be loading — try again in a few seconds.' };
    }
    if (!industryAvgMatch || !networkAvgMatch) {
      return { error: 'Could not find Industry or Network averages.' };
    }

    return {
      data: {
        recordedAt: new Date().toISOString().split('T')[0],
        establishBrand: parseFloat(brandMatch[1]),
        findPeople: parseFloat(peopleMatch[1]),
        engageInsights: parseFloat(insightsMatch[1]),
        buildRelationships: parseFloat(relationshipsMatch[1]),
        industryAverage: parseInt(industryAvgMatch[1]),
        networkAverage: parseInt(networkAvgMatch[1]),
        industryRankPercentile: parseInt(industryRankMatch[1]),
        networkRankPercentile: parseInt(networkRankMatch[1]),
      },
    };
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'PARSE_SSI') {
      const result = parseSSI();
      sendResponse(result);
    }
    return true;
  });

  // Create overlay button on the SSI page
  function createOverlay() {
    const btn = document.createElement('button');
    btn.id = 'ssi-analyzer-overlay';
    btn.textContent = 'Save to SSI Analyzer';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '99999',
      padding: '12px 24px',
      backgroundColor: '#0a66c2',
      color: '#fff',
      border: 'none',
      borderRadius: '24px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      transition: 'background-color 0.2s',
    });

    btn.addEventListener('mouseenter', () => (btn.style.backgroundColor = '#004182'));
    btn.addEventListener('mouseleave', () => (btn.style.backgroundColor = '#0a66c2'));

    btn.addEventListener('click', async () => {
      const result = parseSSI();
      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'SAVE_SNAPSHOT',
          payload: result.data,
        });

        if (response.success) {
          showToast('SSI snapshot saved!', 'success');
          btn.textContent = 'Saved!';
          setTimeout(() => {
            btn.textContent = 'Save to SSI Analyzer';
            btn.disabled = false;
          }, 3000);
        } else {
          showToast(response.error || 'Failed to save', 'error');
          btn.textContent = 'Save to SSI Analyzer';
          btn.disabled = false;
        }
      } catch (err) {
        showToast('Extension error. Please login first.', 'error');
        btn.textContent = 'Save to SSI Analyzer';
        btn.disabled = false;
      }
    });

    document.body.appendChild(btn);
  }

  function showToast(message, type) {
    const existing = document.getElementById('ssi-analyzer-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'ssi-analyzer-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '80px',
      right: '24px',
      zIndex: '99999',
      padding: '12px 20px',
      backgroundColor: type === 'success' ? '#057642' : '#cc1016',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      transition: 'opacity 0.3s',
    });

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Wait for page to fully load (LinkedIn SSI is a SPA, data loads async)
  function waitAndCreateOverlay() {
    // Delay to let LinkedIn's SPA render SSI data
    setTimeout(createOverlay, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndCreateOverlay);
  } else {
    waitAndCreateOverlay();
  }
})();
