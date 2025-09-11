import { API, getCurrentChannelId } from "./main.js";
import { formatStructuredText, toBase64, attachImageClickHandlers } from "./helpers.js";
import { removeImage } from "./image.js";

const chatBox = document.getElementById("chatBox");

export async function fetchChats() {
  const id = getCurrentChannelId();
  if (!id) return;

  try {
    const res = await fetch(`${API}/chats/${id}`, { credentials: "include" });
    if (!res.ok) return;

    const chats = await res.json();
    chatBox.innerHTML = "";

    chats.forEach(c => {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message", c.role);

  msgDiv.innerHTML = `
    <span>${formatStructuredText(c.text)}</span>
    ${c.imageUrl ? `<img src="${c.imageUrl}" alt="chat image"/>` : ""}
    <button class="copy-btn">📋</button>
  `;

  chatBox.appendChild(msgDiv);

  // Attach copy listener safely
  const copyBtn = msgDiv.querySelector(".copy-btn");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(c.text).then(() => alert("Copied!"));
  });
});


    attachImageClickHandlers(); // ✅ Make images toggle fullscreen

  } catch (err) {
    console.error(err);
  }
}

export async function sendChat(selectedImageFile) {
  const id = getCurrentChannelId();
  if (!id) return alert("Select room first");

  const text = document.getElementById("chatText").value.trim();
  let imageUrl = null;

  if (selectedImageFile) {
    imageUrl = await toBase64(selectedImageFile);
  }

  if (!text && !imageUrl) return alert("Enter text or select image");

  document.getElementById("chatText").value = "";
  removeImage();

  try {
    const res = await fetch(`${API}/chats/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text, imageUrl })
    });

    if (res.ok) fetchChats();
  } catch (err) {
    console.error(err);
  }
}
