// ============================================================
// Gallery items — replace emoji with image paths as needed.
// To use a real image: { src: "images/tree.png", label: "Tree" }
// ============================================================
const GALLERY_ITEMS = [
  { emoji: "🌳", label: "Tree" },
  { emoji: "🏠", label: "House" },
  { emoji: "🧍", label: "Person" },
  { emoji: "🐕", label: "Dog" },
  { emoji: "🐈", label: "Cat" },
  { emoji: "🚗", label: "Car" },
  { emoji: "⭐", label: "Star" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "🌸", label: "Flower" },
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "☀️", label: "Sun" },
  { emoji: "🌙", label: "Moon" },
  { emoji: "🐟", label: "Fish" },
  { emoji: "🐦", label: "Bird" },
  { emoji: "🏔️", label: "Mountain" },
  { emoji: "🌊", label: "Wave" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🪨", label: "Rock" },
  { emoji: "🌈", label: "Rainbow" },
  { emoji: "👑", label: "Crown" },
];

// ---- State ----
let selectedItem = null;

// ---- DOM refs ----
const gallery = document.getElementById("gallery");
const whiteboard = document.getElementById("whiteboard");
const clearBtn = document.getElementById("clearBtn");

// ---- Build gallery ----
GALLERY_ITEMS.forEach((item, idx) => {
  const el = document.createElement("div");
  el.className = "gallery-item";
  el.dataset.index = idx;
  el.draggable = true;

  if (item.src) {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label;
    el.appendChild(img);
  } else {
    el.textContent = item.emoji;
  }

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = item.label;
  el.appendChild(label);

  // Click to select
  el.addEventListener("click", () => {
    document.querySelectorAll(".gallery-item").forEach((g) => g.classList.remove("selected"));
    el.classList.add("selected");
    selectedItem = item;
  });

  // Drag start
  el.addEventListener("dragstart", (e) => {
    selectedItem = item;
    e.dataTransfer.setData("text/plain", idx);
  });

  gallery.appendChild(el);
});

// ---- Whiteboard: click to place ----
whiteboard.addEventListener("click", (e) => {
  if (!selectedItem) return;
  if (e.target.closest(".placed-item")) return; // don't place when clicking existing items
  const rect = whiteboard.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  placeItem(selectedItem, x, y);
});

// ---- Whiteboard: drop to place ----
whiteboard.addEventListener("dragover", (e) => e.preventDefault());
whiteboard.addEventListener("drop", (e) => {
  e.preventDefault();
  const rect = whiteboard.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (selectedItem) placeItem(selectedItem, x, y);
});

// ---- Place an item on the whiteboard ----
function placeItem(item, x, y, size = 48) {
  const el = document.createElement("div");
  el.className = "placed-item";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.fontSize = size + "px";

  if (item.src) {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label;
    img.style.width = size + "px";
    el.appendChild(img);
  } else {
    el.textContent = item.emoji;
  }

  // Delete button
  const del = document.createElement("button");
  del.className = "delete-btn";
  del.textContent = "×";
  del.addEventListener("click", (e) => {
    e.stopPropagation();
    el.remove();
  });
  el.appendChild(del);

  // Resize handle
  const resize = document.createElement("div");
  resize.className = "resize-handle";
  el.appendChild(resize);

  // ---- Drag to move ----
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener("mousedown", (e) => {
    if (e.target === del || e.target === resize) return;
    isDragging = true;
    const rect = el.getBoundingClientRect();
    const wbRect = whiteboard.getBoundingClientRect();
    offsetX = e.clientX - rect.left - rect.width / 2;
    offsetY = e.clientY - rect.top - rect.height / 2;
    el.style.zIndex = getNextZ();
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const wbRect = whiteboard.getBoundingClientRect();
    el.style.left = e.clientX - wbRect.left - offsetX + "px";
    el.style.top = e.clientY - wbRect.top - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // ---- Resize handle ----
  let isResizing = false;
  let startSize, startX;

  resize.addEventListener("mousedown", (e) => {
    isResizing = true;
    startSize = parseFloat(el.style.fontSize);
    startX = e.clientX;
    e.stopPropagation();
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    const delta = e.clientX - startX;
    const newSize = Math.max(20, startSize + delta * 0.5);
    el.style.fontSize = newSize + "px";
    const img = el.querySelector("img");
    if (img) img.style.width = newSize + "px";
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
  });

  whiteboard.appendChild(el);
}

// ---- Z-index management ----
let zCounter = 1;
function getNextZ() {
  return ++zCounter;
}

// ---- Clear all ----
clearBtn.addEventListener("click", () => {
  if (confirm("Clear the entire board?")) {
    whiteboard.innerHTML = "";
  }
});
