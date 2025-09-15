// scripts/helpers.js

// Format structured text: black text, **bold** in unique colors
export function formatStructuredText(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let html = "";
  const boldColors = ["#60A5FA","#F472B6","#FBBF24","#34D399","#F87171","#A78BFA","#10B981"];
  let colorIndex = 0;

  lines.forEach(line => {
    if (line.trim() === "") {
      html += "<br>";
      return;
    }

    let content = line.trim();

    // Replace bold text with color
    content = content.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
      const color = boldColors[colorIndex % boldColors.length];
      colorIndex++;
      return `<strong style="color:${color}">${p1}</strong>`;
    });

    if (line.startsWith("###")) {
      // Subheader
      const clean = content.replace(/^###\s*/, "");
      html += `<div class="subheader">${clean}</div>`;
    } else if (line.startsWith("*")) {
      // Subtopic
      const clean = content.replace(/^\*\s*/, "");
      html += `<div class="subtopic">• ${clean}</div>`;
    } else {
      // Main topic
      html += `<div class="maintopic">${content}</div>`;
    }
  });

  return html;
}


export function copyText(txt) {
  navigator.clipboard.writeText(txt);
  alert("Copied!");
}

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Open image fullscreen
export function openImageModal(src) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modalImg.src = src;
  modal.style.display = "flex";
}

// Close fullscreen modal
export function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  document.getElementById("modalImage").src = "";
}

// scripts/helpers.js

export function attachImageClickHandlers() {
  document.querySelectorAll(".chat-message img").forEach(img => {
    img.onclick = () => {
      if (!img.classList.contains("fullscreen")) {
        // Go fullscreen
        img.classList.add("fullscreen");
        img.style.position = "fixed";
        img.style.top = "50%";
        img.style.left = "50%";
        img.style.transform = "translate(-50%, -50%)";
        img.style.maxWidth = "90%";
        img.style.maxHeight = "90%";
        img.style.zIndex = 9999;
        img.style.boxShadow = "0 0 30px rgba(0,0,0,0.8)";
        img.style.borderRadius = "12px";
        img.style.cursor = "zoom-out";
      } else {
        // Back to original
        img.classList.remove("fullscreen");
        img.style.position = "";
        img.style.top = "";
        img.style.left = "";
        img.style.transform = "";
        img.style.maxWidth = "";
        img.style.maxHeight = "";
        img.style.zIndex = "";
        img.style.boxShadow = "";
        img.style.borderRadius = "";
        img.style.cursor = "pointer";
      }
    };
  });
}

