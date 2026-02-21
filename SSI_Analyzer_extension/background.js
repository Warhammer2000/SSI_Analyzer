// Service worker — handles auth token storage and API calls

const API_BASE = 'http://localhost:5136/api';

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_SNAPSHOT') {
    handleSaveSnapshot(message.payload).then(sendResponse);
    return true; // keep channel open for async
  }

  if (message.type === 'LOGIN') {
    handleLogin(message.email, message.password).then(sendResponse);
    return true;
  }

  if (message.type === 'LOGOUT') {
    chrome.storage.local.remove(['token', 'email', 'userId'], () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_AUTH_STATE') {
    chrome.storage.local.get(['token', 'email'], (data) => {
      sendResponse({
        isAuthenticated: !!data.token,
        email: data.email || '',
      });
    });
    return true;
  }
});

async function handleLogin(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text || `Login failed (${res.status})` };
    }

    const data = await res.json();
    await chrome.storage.local.set({
      token: data.token,
      email: data.email,
      userId: data.userId,
    });

    return { success: true, email: data.email };
  } catch (err) {
    return { success: false, error: 'Cannot connect to API server' };
  }
}

async function handleSaveSnapshot(payload) {
  try {
    const { token } = await chrome.storage.local.get('token');
    if (!token) {
      return { success: false, error: 'Not logged in. Please login via the extension popup.' };
    }

    const res = await fetch(`${API_BASE}/ssi/snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      await chrome.storage.local.remove(['token', 'email', 'userId']);
      return { success: false, error: 'Session expired. Please login again.' };
    }

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text || `Save failed (${res.status})` };
    }

    const data = await res.json();
    return { success: true, snapshotId: data.id };
  } catch (err) {
    return { success: false, error: 'Cannot connect to API server' };
  }
}
