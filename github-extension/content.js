// === Feature 1: Wallet/signature bridge (NO CHANGE) ===
window.addEventListener('message', (event) => {
  if (event.data.action === 'linkGitHubWallet') {
    chrome.runtime.sendMessage({
      action: 'verifyLink',
      signature: event.data.signature,
      wallet_address: event.data.walletAddress
    });
  }
});

// === Feature 2: Inject "Mint Badge" button (only on github.com, after DOM ready) ===
function injectMintBadgeButton() {
  if (!location.hostname.endsWith('github.com')) return;
  if (document.getElementById('mint-badge-extension-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'mint-badge-extension-btn';
  btn.textContent = '🏅 Mint Badge';
  btn.style.position = 'fixed';
  btn.style.top = '16px';
  btn.style.right = '16px';
  btn.style.zIndex = 10000;
  btn.style.padding = '10px 18px';
  btn.style.background = '#2da44e';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '6px';
  btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  btn.style.fontSize = '16px';
  btn.style.cursor = 'pointer';

  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    // Parse the URL: https://github.com/{owner}/{repo}/pull/{number}
    const url = window.location.href;
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(\/pull\/(\d+))?/);
    if (!match) return;

    const owner = match[1];
    const repo = match[2];
    const prNumber = match[4] || "";

    // Save info to storage, then open the popup
    chrome.runtime.sendMessage({
      action: 'githubInfo',
      owner,
      repo,
      prNumber,
      url,
    }, () => {
      if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup();
      }
    });
  });
}

// Wait for DOM to be ready before injecting button
if (location.hostname.endsWith('github.com')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMintBadgeButton);
  } else {
    injectMintBadgeButton();
  }
}
