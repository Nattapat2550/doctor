// scripts/main.js
export const API = "http://localhost:3222/api"; // change if deployed

// --- State ---
let currentChannelId = null;
let currentChannelName = "";
let selectedImageFile = null;

// --- Getters & Setters ---
export function getCurrentChannelId() { return currentChannelId; }
export function setCurrentChannelId(id) { currentChannelId = id; }

export function getCurrentChannelName() { return currentChannelName; }
export function setCurrentChannelName(name) { currentChannelName = name; }

export function getSelectedImageFile() { return selectedImageFile; }
export function setSelectedImageFile(file) { selectedImageFile = file; }
