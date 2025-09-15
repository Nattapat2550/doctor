// scripts/main.js
export const API = "http://localhost:3222/api"; // change if deployed

// --- State ---
let currentChannelId = null;
let currentChannelName = "";
let selectedImageFile = null;

export const userToken = localStorage.getItem("userToken") || (() => {
  const token = "user_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("userToken", token);
  return token;
})();
// --- Getters & Setters ---
export function getCurrentChannelId() { return currentChannelId; }
export function setCurrentChannelId(id) { currentChannelId = id; }

export function getCurrentChannelName() { return currentChannelName; }
export function setCurrentChannelName(name) { currentChannelName = name; }

export function getSelectedImageFile() { return selectedImageFile; }
export function setSelectedImageFile(file) { selectedImageFile = file; }
