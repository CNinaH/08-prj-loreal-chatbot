/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// The Cloudflare Worker endpoint URL
const workerUrl = "https://tight-rain-6157.ninawark.workers.dev/";

// Store the chat history for OpenAI-style messages
const messages = [
  {
    role: "system",
    content: "You are a helpful assistant for beauty products for L'Oreal.",
  },
];

/* Helper function to show all messages in the chat window */
function renderMessages() {
  // Start with an empty string
  let html = "";

  // Show all previous messages as bubbles
  for (let i = 1; i < messages.length - 1; i++) {
    const msg = messages[i];
    const cls = msg.role === "user" ? "msg user" : "msg ai";
    html += `<div class="${cls}">${msg.content}</div>`;
  }

  // Show the latest user question above the assistant's reply
  if (messages.length > 2) {
    const lastUserMsg = messages[messages.length - 2];
    const lastAiMsg = messages[messages.length - 1];
    if (lastUserMsg.role === "user" && lastAiMsg.role === "assistant") {
      html += `<div class="msg user latest">${lastUserMsg.content}</div>`;
      html += `<div class="msg ai latest">${lastAiMsg.content}</div>`;
    }
  } else if (messages.length === 2) {
    // Only user message, no assistant reply yet
    const lastUserMsg = messages[1];
    html += `<div class="msg user latest">${lastUserMsg.content}</div>`;
  }

  chatWindow.innerHTML = html || "👋 Hello! How can I help you today?";
}

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message from the input box
  const userMessage = userInput.value;

  // Add the user's message to the messages array
  messages.push({ role: "user", content: userMessage });

  // Show all messages including the new user message
  renderMessages();

  // Show a loading message while waiting for the response
  chatWindow.innerHTML += `<div class="msg ai latest">⏳ Thinking...</div>`;

  // Clear the input box for the next message
  userInput.value = "";

  try {
    // Log the payload being sent for debugging
    console.log("Sending to worker:", { messages });

    // Send the messages array to the worker API using fetch
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    // Parse the JSON response from the server
    const data = await response.json();

    // Log the response for debugging
    console.log("Received from worker:", data);

    // Use the reply property, or fallback to other possible keys
    const reply =
      data.reply || data.result || data.text || "⚠️ No reply received.";

    // Add the assistant's reply to the messages array
    messages.push({ role: "assistant", content: reply });

    // Show all messages including the assistant's reply
    renderMessages();
  } catch (error) {
    messages.push({
      role: "assistant",
      content: "⚠️ Sorry, there was a problem. Please try again!",
    });
    renderMessages();
  }
});
