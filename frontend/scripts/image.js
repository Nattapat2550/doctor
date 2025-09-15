// scripts/image.js
import { setSelectedImageFile } from "./main.js";

export function previewImage() {
  const fileInput = document.getElementById("chatImage");
  const previewDiv = document.getElementById("imagePreview");
  const file = fileInput.files[0];
  setSelectedImageFile(file || null);

  previewDiv.innerHTML = "";
  if (file) {
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

export function removeImage() {
  const fileInput = document.getElementById("chatImage");
  const previewDiv = document.getElementById("imagePreview");
  fileInput.value = "";
  setSelectedImageFile(null);
  previewDiv.innerHTML = "";
}
