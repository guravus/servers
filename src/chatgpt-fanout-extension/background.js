const STORAGE_KEYS = {
  conversationId: 'conversationId',
  requests: 'capturedRequests'
};

let conversationId = null;
let capturedRequests = [];

async function loadState() {
  const stored = await chrome.storage.local.get([STORAGE_KEYS.conversationId, STORAGE_KEYS.requests]);
  conversationId = stored[STORAGE_KEYS.conversationId] || '';
  capturedRequests = stored[STORAGE_KEYS.requests] || [];
}

function encodeBody(requestBody) {
  if (!requestBody) {
    return null;
  }

  if (requestBody.formData) {
    const parts = Object.entries(requestBody.formData).flatMap(([key, values]) =>
      values.map((value) => `${key}=${value}`)
    );
    return parts.join('&');
  }

  if (requestBody.raw && requestBody.raw.length > 0 && requestBody.raw[0].bytes) {
    const decoder = new TextDecoder();
    return decoder.decode(requestBody.raw[0].bytes);
  }

  return null;
}

function matchesConversation(details, bodyText) {
  if (!conversationId) {
    return false;
  }

  if (details.url.includes(conversationId)) {
    return true;
  }

  if (bodyText && bodyText.includes(conversationId)) {
    return true;
  }

  return false;
}

async function recordRequest(details) {
  const bodyText = encodeBody(details.requestBody);
  if (!matchesConversation(details, bodyText)) {
    return;
  }

  const entry = {
    id: `${details.requestId}-${Date.now()}`,
    url: details.url,
    method: details.method,
    timestamp: new Date(details.timeStamp).toISOString(),
    body: bodyText
  };

  capturedRequests.push(entry);
  if (capturedRequests.length > 200) {
    capturedRequests = capturedRequests.slice(-200);
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.requests]: capturedRequests
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  recordRequest,
  {
    urls: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
    types: ['xmlhttprequest', 'fetch']
  },
  ['requestBody']
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'setConversationId') {
    conversationId = message.conversationId || '';
    chrome.storage.local.set({
      [STORAGE_KEYS.conversationId]: conversationId
    });
    sendResponse({ status: 'ok' });
  }

  if (message?.type === 'getConversationId') {
    sendResponse({ conversationId });
  }

  if (message?.type === 'getRequests') {
    sendResponse({ requests: capturedRequests });
  }

  if (message?.type === 'clearRequests') {
    capturedRequests = [];
    chrome.storage.local.set({ [STORAGE_KEYS.requests]: capturedRequests });
    sendResponse({ status: 'ok' });
  }

  return true;
});

loadState();
