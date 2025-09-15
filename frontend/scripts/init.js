// scripts/init.js
import { fetchChannels, createChannel, renameChannel, deleteChannel } from "./channels.js";
import { sendChat } from "./chats.js";
import { previewImage } from "./image.js";
import { getSelectedImageFile } from "./main.js";

// Expose globally for buttons in HTML
window.createChannel = createChannel;
window.renameChannel = renameChannel;
window.deleteChannel = deleteChannel;
window.sendChat = () => sendChat(getSelectedImageFile());
window.previewImage = previewImage;

// ✅ ฟังก์ชัน toggle sidebar
// Toggle sidebar

const toggleBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.querySelector(".sidebar");
const container = document.querySelector(".container");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("mini");
  container.classList.toggle("mini-sidebar");
});


// Init
fetchChannels();
