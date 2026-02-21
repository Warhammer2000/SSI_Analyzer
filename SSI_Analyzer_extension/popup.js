document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const authSection = document.getElementById('auth-section');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const userEmail = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logout-btn');
  const captureBtn = document.getElementById('capture-btn');
  const statusEl = document.getElementById('status');

  // Check auth state on load
  chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (response) => {
    if (response.isAuthenticated) {
      showAuthView(response.email);
    } else {
      showLoginView();
    }
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    chrome.runtime.sendMessage(
      { type: 'LOGIN', email, password },
      (response) => {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';

        if (response.success) {
          showAuthView(response.email);
        } else {
          loginError.textContent = response.error;
          loginError.style.display = 'block';
        }
      }
    );
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOGOUT' }, () => {
      showLoginView();
    });
  });

  // Capture SSI
  captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    captureBtn.textContent = 'Capturing...';
    showStatus('Parsing SSI page...', 'info');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url || !tab.url.includes('linkedin.com/sales/ssi')) {
        showStatus('Please navigate to your LinkedIn SSI page first.', 'error');
        captureBtn.disabled = false;
        captureBtn.textContent = 'Capture SSI from Current Tab';
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'PARSE_SSI' }, (parseResult) => {
        if (chrome.runtime.lastError) {
          showStatus('Cannot access page. Try reloading the SSI page.', 'error');
          captureBtn.disabled = false;
          captureBtn.textContent = 'Capture SSI from Current Tab';
          return;
        }

        if (parseResult.error) {
          showStatus(parseResult.error, 'error');
          captureBtn.disabled = false;
          captureBtn.textContent = 'Capture SSI from Current Tab';
          return;
        }

        // Send to API
        showStatus('Saving snapshot...', 'info');
        chrome.runtime.sendMessage(
          { type: 'SAVE_SNAPSHOT', payload: parseResult.data },
          (saveResult) => {
            captureBtn.disabled = false;
            captureBtn.textContent = 'Capture SSI from Current Tab';

            if (saveResult.success) {
              showStatus('SSI snapshot saved successfully!', 'success');
            } else {
              showStatus(saveResult.error || 'Failed to save', 'error');
              if (saveResult.error && saveResult.error.includes('login')) {
                setTimeout(() => showLoginView(), 2000);
              }
            }
          }
        );
      });
    } catch (err) {
      showStatus('An error occurred. Please try again.', 'error');
      captureBtn.disabled = false;
      captureBtn.textContent = 'Capture SSI from Current Tab';
    }
  });

  function showLoginView() {
    loginSection.style.display = 'block';
    authSection.style.display = 'none';
    loginError.style.display = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
  }

  function showAuthView(email) {
    loginSection.style.display = 'none';
    authSection.style.display = 'block';
    userEmail.textContent = email;
    statusEl.style.display = 'none';
  }

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
  }
});
