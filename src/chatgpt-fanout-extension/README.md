# ChatGPT Fanout Inspector Chrome Extension

This extension captures background and fan-out network requests made by ChatGPT for a specific conversation. It listens for requests to chatgpt.com/chat.openai.com and stores any that contain the configured conversation ID in the URL or request body.

## Installation

You do not need to build anything—load the unpacked extension directly from this repository.

1. In Chrome/Edge, open `chrome://extensions` and enable **Developer mode** (top right).
2. Click **Load unpacked** and select the `src/chatgpt-fanout-extension` folder from this repo.
3. (Optional) Pin the extension so its icon is visible in the toolbar.

## Usage

1. Open a ChatGPT conversation and copy its conversation ID from the URL (the UUID after `/c/`).
2. Open the extension popup and paste that conversation ID into the input field.
3. Perform actions in the same conversation; matching requests will appear in the popup log.
4. Use **Clear Requests** to reset the log at any time.

> Requests are stored locally in extension storage and capped at 200 entries to keep the log responsive.
