// ============================================================
// Gallery items — replace emoji with image paths as needed.
// To use a real image: { src: "images/tree.png", label: "Tree" }
// ============================================================
const GALLERY_ITEMS = [
  { src: "duck_pictures/Angry Duck Front.png", label: "Angry Duck" },
  { src: "duck_pictures/Baseball Duck Front.png", label: "Baseball Duck" },
  { src: "duck_pictures/Black Mask Duck Front.png", label: "Black Mask" },
  { src: "duck_pictures/Block  Duck Front.png", label: "Block Duck" },
  { src: "duck_pictures/blue masked Duck front.png", label: "Blue Mask" },
  { src: "duck_pictures/Brown Stripe Front.png", label: "Brown Stripe" },
  { src: "duck_pictures/Bumble Bee Front.png", label: "Bumble Bee" },
  { src: "duck_pictures/Cool Guy Front.png", label: "Cool Guy" },
  { src: "duck_pictures/Cute Duck Front.png", label: "Cute Duck" },
  { src: "duck_pictures/Easter Egg Duck Front.png", label: "Easter Egg" },
  { src: "duck_pictures/Elephant Duck Front For real.png", label: "Elephant" },
  { src: "duck_pictures/Farmer Duck Front.png", label: "Farmer" },
  { src: "duck_pictures/Giraffe Duck Front.png", label: "Giraffe" },
  { src: "duck_pictures/Green Bird Front.png", label: "Green Bird" },
  { src: "duck_pictures/Green Dragon Front.png", label: "Green Dragon" },
  { src: "duck_pictures/Green Mohawk Duck Front.png", label: "Mohawk Green" },
  { src: "duck_pictures/Lil Black Front.png", label: "Lil Black" },
  { src: "duck_pictures/Lil Red Front.png", label: "Lil Red" },
  { src: "duck_pictures/Lil Yellow Front.png", label: "Lil Yellow" },
  { src: "duck_pictures/Lion Duck front.png", label: "Lion Duck" },
  { src: "duck_pictures/Luau Front.png", label: "Luau" },
  { src: "duck_pictures/Mohawk Duck Front.png", label: "Mohawk" },
  { src: "duck_pictures/Monkey Duck Front.png", label: "Monkey" },
  { src: "duck_pictures/Mouse Elephant Front.png", label: "Mouse" },
  { src: "duck_pictures/Orange Barbed Wire Duck Front.png", label: "Barbed Wire" },
  { src: "duck_pictures/Orange Duck front.png", label: "Orange Duck" },
  { src: "duck_pictures/Pig Duck front.png", label: "Pig Duck" },
  { src: "duck_pictures/Pink Bird Front.png", label: "Pink Bird" },
  { src: "duck_pictures/Pink duck mask front.png", label: "Pink Mask" },
  { src: "duck_pictures/Polka Dot Front.png", label: "Polka Dot" },
  { src: "duck_pictures/Princess Front.png", label: "Princess" },
  { src: "duck_pictures/Shark Front.png", label: "Shark" },
  { src: "duck_pictures/Snowman Duck front.png", label: "Snowman" },
  { src: "duck_pictures/Soccer Front.png", label: "Soccer" },
  { src: "duck_pictures/Swimming Duck Front.png", label: "Swimming" },
  { src: "duck_pictures/Tiger Duck Front.png", label: "Tiger Duck" },
  { src: "duck_pictures/Uncle Sam Duck front.png", label: "Uncle Sam" },
  { src: "duck_pictures/Unicorn Duck front.png", label: "Unicorn" },
  { src: "duck_pictures/White Barbed wire Front.png", label: "White Barbed" },
];

// ---- State ----
let selectedItem = null;

// ---- DOM refs ----
const gallery = document.getElementById("gallery");
const whiteboard = document.getElementById("whiteboard");
const clearBtn = document.getElementById("clearBtn");

// ---- Auto-crop: trim transparent pixels from a PNG ----
// Returns a new image URL (data URL) with transparent padding removed.
function autoCrop(img) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    let top = height, left = width, bottom = 0, right = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) { // non-transparent pixel
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }

    // Add a small padding (2% of dimensions)
    const padX = Math.round((right - left) * 0.02);
    const padY = Math.round((bottom - top) * 0.02);
    top = Math.max(0, top - padY);
    left = Math.max(0, left - padX);
    bottom = Math.min(height - 1, bottom + padY);
    right = Math.min(width - 1, right + padX);

    const cropW = right - left + 1;
    const cropH = bottom - top + 1;

    if (cropW <= 0 || cropH <= 0) {
      resolve(img.src);
      return;
    }

    const cropped = document.createElement("canvas");
    cropped.width = cropW;
    cropped.height = cropH;
    const cCtx = cropped.getContext("2d");
    cCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);

    resolve(cropped.toDataURL("image/png"));
  });
}

// Cache for cropped image URLs
const croppedCache = {};

// Load and auto-crop an image, returns a promise with the cropped data URL
function getCroppedSrc(src) {
  if (croppedCache[src]) return Promise.resolve(croppedCache[src]);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      autoCrop(img).then((croppedUrl) => {
        croppedCache[src] = croppedUrl;
        resolve(croppedUrl);
      });
    };
    img.onerror = () => resolve(src); // fallback to original
    img.src = src;
  });
}

// ---- Build gallery ----
GALLERY_ITEMS.forEach((item, idx) => {
  const el = document.createElement("div");
  el.className = "gallery-item";
  el.dataset.index = idx;
  el.draggable = true;

  if (item.src) {
    const img = document.createElement("img");
    img.alt = item.label;
    el.appendChild(img);
    // Auto-crop and display
    getCroppedSrc(item.src).then((croppedUrl) => {
      img.src = croppedUrl;
    });
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
function placeItem(item, x, y, size = 80) {
  const el = document.createElement("div");
  el.className = "placed-item";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.width = size + "px";

  if (item.src) {
    const img = document.createElement("img");
    img.alt = item.label;
    img.style.width = size + "px";
    el.appendChild(img);
    // Use cropped version
    getCroppedSrc(item.src).then((croppedUrl) => {
      img.src = croppedUrl;
    });
  } else {
    el.style.fontSize = size + "px";
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
    startSize = parseFloat(el.style.width || el.style.fontSize);
    startX = e.clientX;
    e.stopPropagation();
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    const delta = e.clientX - startX;
    const newSize = Math.max(20, startSize + delta * 0.5);
    const img = el.querySelector("img");
    if (img) {
      el.style.width = newSize + "px";
      img.style.width = newSize + "px";
    } else {
      el.style.fontSize = newSize + "px";
    }
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
