import { API, getCurrentChannelId } from "./main.js";
import { formatStructuredText, toBase64, attachImageClickHandlers } from "./helpers.js";
import { removeImage } from "./image.js";

const chatBox = document.getElementById("chatBox");
const spinner = document.getElementById("loadingSpinner");

export async function fetchChats() {
  const id = getCurrentChannelId();
  if (!id) return;

  spinner.style.display = "block"; // แสดง spinner

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

      const copyBtn = msgDiv.querySelector(".copy-btn");
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(c.text).then(() => alert("Copied!"));
      });
    });

    attachImageClickHandlers();
  } catch (err) {
    console.error(err);
  } finally {
    spinner.style.display = "none"; // ซ่อน spinner หลังโหลดเสร็จ
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

  spinner.style.display = "block"; // แสดง spinner

  try {
    const res = await fetch(`${API}/chats/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text, imageUrl })
    });

    if (res.ok) await fetchChats(); // fetchChats จะซ่อน spinner
  } catch (err) {
    console.error(err);
  } finally {
    spinner.style.display = "none"; // ซ่อน spinner หาก error
  }
}