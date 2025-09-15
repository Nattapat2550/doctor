import { API, getCurrentChannelId, userToken } from "./main.js";
import { formatStructuredText, toBase64, attachImageClickHandlers } from "./helpers.js";
import { removeImage } from "./image.js";

const chatBox = document.getElementById("chatBox");
const spinner = document.getElementById("loadingSpinner");
const textInput = document.getElementById("chatText");
const sendBtn = document.getElementById("sendBtn");

let sending = false; // flag ป้องกันส่งซ้ำ

// --- เพิ่มข้อความใน chatBox ---
function appendChatMessage(c) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message", c.role);
  msgDiv.innerHTML = `
    <span>${formatStructuredText(c.text)}</span>
    ${c.imageUrl ? `<img src="${c.imageUrl}" alt="chat image"/>` : ""}
    <button class="copy-btn">📋</button>
  `;
  chatBox.appendChild(msgDiv);

  const copyBtn = msgDiv.querySelector(".copy-btn");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(c.text).then(() => alert("Copied!"));
  });

  attachImageClickHandlers();
}

// --- แสดง typing ---
function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("chat-message", "assistant", "typing");
  typingDiv.id = "aiTyping";
  typingDiv.textContent = "AI is typing...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typingDiv = document.getElementById("aiTyping");
  if (typingDiv) typingDiv.remove();
}

// --- โหลด chat เมื่อเปิดห้อง ---
export async function loadChatsOnOpen() {
  const id = getCurrentChannelId();
  if (!id) return;

  spinner.style.display = "block";

  try {
    const res = await fetch(`${API}/chats/${id}?token=${userToken}`);
    if (!res.ok) return;

    const chats = await res.json();
    chatBox.innerHTML = "";

    chats.forEach(c => appendChatMessage(c));

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error(err);
  } finally {
    spinner.style.display = "none";
  }
}

// --- Fetch chats ปกติ ---
export async function fetchChats() {
  const id = getCurrentChannelId();
  if (!id) return;

  const wasSpinnerVisible = spinner.style.display === "block";
  if (!wasSpinnerVisible) spinner.style.display = "block";

  try {
    const res = await fetch(`${API}/chats/${id}?token=${userToken}`);
    if (!res.ok) return;

    const chats = await res.json();
    chatBox.innerHTML = "";
    chats.forEach(c => appendChatMessage(c));
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error(err);
  } finally {
    if (!wasSpinnerVisible) spinner.style.display = "none";
  }
}

// --- ส่งข้อความ/รูป ---
export async function sendChat(selectedImageFile) {
  if (sending) return;

  const id = getCurrentChannelId();
  if (!id) return alert("Select room first");

  const text = textInput.value.trim();
  let imageUrl = null;

  if (selectedImageFile) imageUrl = await toBase64(selectedImageFile);
  if (!text && !imageUrl) return alert("Enter text or select image");

  textInput.value = "";
  removeImage();

  sending = true;
  textInput.disabled = true;
  sendBtn.disabled = true;
  spinner.style.display = "block";

  showTyping();

  try {
    const res = await fetch(`${API}/chats/${id}?token=${userToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, imageUrl })
    });

    removeTyping();

    if (res.ok) await fetchChats();
    else alert("Failed to send message");
  } catch (err) {
    removeTyping();
    console.error(err);
  } finally {
    textInput.disabled = false;
    sendBtn.disabled = false;
    spinner.style.display = "none";
    sending = false;
  }
}

// --- โหลด greeting/ข้อความแรกเมื่อเปิดห้อง ---
document.addEventListener("DOMContentLoaded", () => {
  loadChatsOnOpen();
});
