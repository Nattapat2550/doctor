// scripts/channels.js
import { API, setCurrentChannelId, setCurrentChannelName, getCurrentChannelId, userToken } from "./main.js";
import { fetchChats } from "./chats.js";

const channelList = document.getElementById("channelList");
const currentChannelNameElem = document.getElementById("currentChannelName");

export async function fetchChannels() {
  try {
    const res = await fetch(`${API}/channels?token=${userToken}`);
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
  await fetch(`${API}/channels?token=${userToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  
  try {
    // แก้ไข URL endpoint ให้ถูกต้อง
    const response = await fetch(`${API}/channels/${id}?token=${userToken}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error: ${errorData.error || 'Failed to rename channel'}`);
      return;
    }
    
    // อัพเดทชื่อช่องปัจจุบันทันที
    setCurrentChannelName(newName);
    currentChannelNameElem.textContent = newName;
    
    // รีเฟรชรายการช่อง
    fetchChannels();
    
  } catch (err) {
    console.error("Error renaming channel:", err);
    alert("Failed to rename channel. Please try again.");
  }
}


export async function deleteChannel() {
  const id = getCurrentChannelId();
  if (!id) return alert("Select room first");
  if (!confirm("Delete this room?")) return;
  await fetch(`${API}/channels/${id}?token=${userToken}`, {
    method: "DELETE"
  });
  setCurrentChannelId(null);
  setCurrentChannelName("");
  document.getElementById("currentChannelName").textContent = "Select a room";
  fetchChannels();
  document.getElementById("chatBox").innerHTML = "";
}
