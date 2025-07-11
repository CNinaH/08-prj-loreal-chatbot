/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const workerUrl = "https://tight-rain-6157.ninawark.workers.dev/";

// Create an array to store the chat history for OpenAI-style messages
const messages = [{ role: "system", content: "You are a helpful assistant." }];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message from the input box
  const message = userInput.value;

  // Add the user's message to the messages array
  messages.push({ role: "user", content: message });

  // Show a loading message while waiting for the response
  chatWindow.textContent = "⏳ Thinking...";

  try {
    // Send the messages array to the worker API using fetch
    const response = await fetch(workerUrl, {
      method: "POST", // Use POST to send data
      headers: {
        "Content-Type": "application/json", // Tell the server we're sending JSON
      },
      body: JSON.stringify({ messages }), // Send the messages array as JSON
    });

    // Parse the JSON response from the server
    const data = await response.json();

    // Add the assistant's reply to the messages array
    messages.push({ role: "assistant", content: data.reply });

    // Show the response from the API in the chat window
    chatWindow.textContent = data.reply;
  } catch (error) {
    // If something goes wrong, show an error message
    chatWindow.textContent = "⚠️ Sorry, there was a problem. Please try again!";
  }
});
