const conversationInput = document.getElementById('conversationId');
const statusEl = document.getElementById('status');
const requestsEl = document.getElementById('requests');

function renderRequests(requests) {
  requestsEl.innerHTML = '';

  if (!requests || requests.length === 0) {
    requestsEl.textContent = 'No matching requests captured yet.';
    return;
  }

  for (const request of requests.slice().reverse()) {
    const container = document.createElement('div');
    container.className = 'request';

    const title = document.createElement('div');
    title.textContent = `${request.method} ${request.url}`;
    container.appendChild(title);

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = request.timestamp;
    container.appendChild(timestamp);

    if (request.body) {
      const body = document.createElement('pre');
      body.textContent = request.body;
      container.appendChild(body);
    }

    requestsEl.appendChild(container);
  }
}

function showStatus(text) {
  statusEl.textContent = text;
  setTimeout(() => {
    statusEl.textContent = '';
  }, 1500);
}

function fetchRequests() {
  chrome.runtime.sendMessage({ type: 'getRequests' }, (response) => {
    renderRequests(response?.requests || []);
  });
}

document.getElementById('saveConversation').addEventListener('click', () => {
  const conversationId = conversationInput.value.trim();
  chrome.runtime.sendMessage({ type: 'setConversationId', conversationId }, () => {
    showStatus('Conversation ID saved. Capturing matching requests...');
  });
});

document.getElementById('clearRequests').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'clearRequests' }, () => {
    renderRequests([]);
    showStatus('Cleared captured requests.');
  });
});

chrome.runtime.sendMessage({ type: 'getConversationId' }, (response) => {
  if (response?.conversationId) {
    conversationInput.value = response.conversationId;
  }
});

fetchRequests();
