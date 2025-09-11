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

// Init
fetchChannels();
