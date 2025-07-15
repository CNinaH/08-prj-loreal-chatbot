/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// The Cloudflare Worker endpoint URL
const workerUrl = "https://loreal-worker.ninawark.workers.dev/";

// Store the chat history for OpenAI-style messages
const messages = [
  {
    role: "system",
    content:
      "You are a helpful beauty assistant for L'Oréal products. You specialize in skincare, makeup, haircare, and beauty routines using L'Oréal brands. You can help with product recommendations, beauty tips, ingredient information, and usage advice. If someone asks about topics unrelated to L'Oréal products, beauty, skincare, makeup, or haircare, politely redirect them back to beauty-related topics you can help with.",
  },
];

/* Helper function to show all messages in the chat window */
function renderMessages() {
  // Start with an empty string
  let html = "";

  // Show all messages (skip the system message at index 0)
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    const cls = msg.role === "user" ? "msg user" : "msg ai";
    html += `<div class="${cls}">${msg.content}</div>`;
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
    // console.log("Sending to worker:", { messages });

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

    // Extract the assistant's reply from OpenAI's response format
    const reply =
      data.choices?.[0]?.message?.content || "⚠️ No reply received.";

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
