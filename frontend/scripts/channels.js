// scripts/channels.js
import { API, setCurrentChannelId, setCurrentChannelName, getCurrentChannelId } from "./main.js";
import { fetchChats } from "./chats.js";

const channelList = document.getElementById("channelList");
const currentChannelNameElem = document.getElementById("currentChannelName");

export async function fetchChannels() {
  try {
    const res = await fetch(`${API}/channels`, { credentials: "include" });
    if (!res.ok) return;
    const channels = await res.json();
    channelList.innerHTML = "";
    channels.forEach(c => {
      const li = document.createElement("li");
      li.textContent = c.name;
      li.onclick = () => selectChannel(c._id, c.name, li);
      channelList.appendChild(li);
    });
  } catch (err) { console.error(err); }
}

function selectChannel(id, name, li) {
  setCurrentChannelId(id);
  setCurrentChannelName(name);
  currentChannelNameElem.textContent = name;
  document.querySelectorAll("#channelList li").forEach(el => el.classList.remove("active"));
  li.classList.add("active");
  fetchChats();
}

export async function createChannel() {
  const name = document.getElementById("newChannelName").value.trim();
  if (!name) return alert("Enter room name");
  await fetch(`${API}/channels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name })
  });
  document.getElementById("newChannelName").value = "";
  fetchChannels();
}

export async function renameChannel() {
  const id = getCurrentChannelId();
  if (!id) return alert("Select room first");
  const newName = prompt("New name:", document.getElementById("currentChannelName").textContent);
  if (!newName) return;
  await fetch(`${API}/channels/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name: newName })
  });
  fetchChannels();
}

export async function deleteChannel() {
  const id = getCurrentChannelId();
  if (!id) return alert("Select room first");
  if (!confirm("Delete this room?")) return;
  await fetch(`${API}/channels/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  setCurrentChannelId(null);
  setCurrentChannelName("");
  document.getElementById("currentChannelName").textContent = "Select a room";
  fetchChannels();
  document.getElementById("chatBox").innerHTML = "";
}
