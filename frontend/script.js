const API = "http://localhost:3222/api"; // Change to EC2 IP if needed
let currentChannelId = null;
let currentChannelName = "";
let selectedImageFile = null;

const channelList = document.getElementById("channelList");
const chatBox = document.getElementById("chatBox");
const currentChannelNameElem = document.getElementById("currentChannelName");

// Format text: all black except **bold** with unique colors
function formatStructuredText(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let html = "";
  const boldColors = ["#60A5FA","#F472B6","#FBBF24","#34D399","#F87171","#A78BFA","#10B981"];
  let colorIndex = 0;

  lines.forEach(line => {
    if(line.trim() === ""){
      html += "<br>";
      return;
    }

    let content = line.trim();
    // Replace bold text with unique colors
    content = content.replace(/\*\*(.*?)\*\*/g, (match,p1)=>{
      const color = boldColors[colorIndex % boldColors.length];
      colorIndex++;
      return `<strong style="color:${color}">${p1}</strong>`;
    });

    if(line.startsWith("*")){
      // Subtopic: remove leading * and spaces
      const clean = content.replace(/^\*\s*/, "");
      html += `<div class="subtopic">• ${clean}</div>`;
    } else {
      // Main topic: black
      html += `<div class="maintopic">${content}</div>`;
    }
  });

  return html;
}

// ----------------- Channels -----------------
async function fetchChannels(){
  try{
    const res = await fetch(`${API}/channels`, {credentials:"include"});
    if(!res.ok) return;
    const channels = await res.json();
    channelList.innerHTML = "";
    channels.forEach(c => {
      const li = document.createElement("li");
      li.textContent = c.name;
      li.onclick = () => selectChannel(c._id, c.name, li);
      channelList.appendChild(li);
    });
  } catch(err){ console.error(err); }
}

function selectChannel(id, name, li){
  currentChannelId = id;
  currentChannelName = name;
  currentChannelNameElem.textContent = name;
  document.querySelectorAll("#channelList li").forEach(el => el.classList.remove("active"));
  li.classList.add("active");
  fetchChats();
}

async function createChannel(){
  const name = document.getElementById("newChannelName").value.trim();
  if(!name) return alert("Enter room name");
  await fetch(`${API}/channels`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({name})
  });
  document.getElementById("newChannelName").value="";
  fetchChannels();
}

async function renameChannel(){
  if(!currentChannelId) return alert("Select room first");
  const name = prompt("New name:", currentChannelName);
  if(!name) return;
  await fetch(`${API}/channels/${currentChannelId}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({name})
  });
  fetchChannels();
}

async function deleteChannel(){
  if(!currentChannelId) return alert("Select room first");
  if(!confirm("Delete this room?")) return;
  await fetch(`${API}/channels/${currentChannelId}`,{
    method:"DELETE",
    credentials:"include"
  });
  currentChannelId = null;
  currentChannelNameElem.textContent = "Select a room";
  fetchChannels();
  chatBox.innerHTML="";
}

// ----------------- Chats -----------------
async function fetchChats(){
  if(!currentChannelId) return;
  try{
    const res = await fetch(`${API}/chats/${currentChannelId}`, {credentials:"include"});
    if(!res.ok) return;
    const chats = await res.json();
    chatBox.innerHTML = "";
    chats.forEach(c => {
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("chat-message", c.role);
      msgDiv.innerHTML = `
        <span>${formatStructuredText(c.text)}</span>
        ${c.imageUrl ? `<img src="${c.imageUrl}"/>` : ""}
        <button onclick="copyText('${c.text.replace(/'/g,"\\'")}')">📋</button>
      `;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  } catch(err){ console.error(err); }
}

// ----------------- Send Chat -----------------
async function sendChat(){
  if(!currentChannelId) return alert("Select room first");
  const text = document.getElementById("chatText").value.trim();
  let imageUrl = null;

  if(selectedImageFile){
    imageUrl = await toBase64(selectedImageFile);
  }

  if(!text && !imageUrl) return alert("Enter text or select image");

  document.getElementById("chatText").value = "";
  removeImage(); // clear preview

  const res = await fetch(`${API}/chats/${currentChannelId}`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({text, imageUrl})
  });

  if(res.ok) fetchChats();
}

// ----------------- Image Preview -----------------

function previewImage(){
  const fileInput = document.getElementById("chatImage");
  const previewDiv = document.getElementById("imagePreview");
  const file = fileInput.files[0];
  selectedImageFile = file || null;
  
  previewDiv.innerHTML = "";
  if(file){
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "150px";
    img.style.maxHeight = "150px";
    img.style.borderRadius = "10px";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "❌";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.onclick = removeImage;

    previewDiv.appendChild(img);
    previewDiv.appendChild(cancelBtn);
  }
}

function removeImage(){
  const fileInput = document.getElementById("chatImage");
  const previewDiv = document.getElementById("imagePreview");
  fileInput.value = "";
  selectedImageFile = null;
  previewDiv.innerHTML = "";
}


// ----------------- Helpers -----------------
function copyText(txt){
  navigator.clipboard.writeText(txt);
  alert("Copied!");
}

function toBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ----------------- Init -----------------
fetchChannels();
