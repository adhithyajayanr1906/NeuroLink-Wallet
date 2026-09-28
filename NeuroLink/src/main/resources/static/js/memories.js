/* =========================================
   AUTH CHECK
========================================= */

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


let allMemories = [];
let activeCategory = "ALL";
let currentSelectedMemory = null;


/* DOM Elements */
const memoriesGrid = document.getElementById("memoriesGrid");
const categoryPills = document.querySelectorAll(".pill");

/* Modal Elements */
const memoryModal = document.getElementById("memoryModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalViewMode = document.getElementById("modalViewMode");
const modalEditMode = document.getElementById("modalEditMode");

const modalMediaContainer = document.getElementById("modalMediaContainer");
const modalCategory = document.getElementById("modalCategory");
const modalMood = document.getElementById("modalMood");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalLocation = document.getElementById("modalLocation");
const modalPeople = document.getElementById("modalPeople");
const modalDescription = document.getElementById("modalDescription");
const modalTagsContainer = document.getElementById("modalTagsContainer");

const modalEditBtn = document.getElementById("modalEditBtn");
const modalDeleteBtn = document.getElementById("modalDeleteBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editMemoryForm = document.getElementById("editMemoryForm");


/* =========================================
   FETCH & RENDER MEMORIES
========================================= */

async function loadMemories() {
    try {
        allMemories = await apiRequest(`/memories?userId=${userId}`);
        
        // Sort newest first
        allMemories.sort((a, b) => new Date(b.memoryDate) - new Date(a.memoryDate));
        
        renderGrid();

    } catch (error) {
        console.error("Failed to load memories:", error);
        memoriesGrid.innerHTML = `
            <div class="empty-memory">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to load memories</h3>
                <p>${error.message || "Please make sure backend server is running."}</p>
            </div>
        `;
    }
}


function renderGrid() {
    let filtered = allMemories;

    if (activeCategory !== "ALL") {
        filtered = allMemories.filter(m => (m.category || "").toLowerCase() === activeCategory.toLowerCase());
    }

    if (filtered.length === 0) {
        memoriesGrid.innerHTML = `
            <div class="empty-memory">
                <div class="empty-icon">🧠</div>
                <h3>No memories found</h3>
                <p>${activeCategory === "ALL" ? "Your vault is empty. Click '+ Add Memory' to get started." : "No memories found in " + activeCategory + " category."}</p>
                <a href="add-memory.html" class="primary-button">+ Add Memory</a>
            </div>
        `;
        return;
    }

    memoriesGrid.innerHTML = "";

    filtered.forEach(memory => {
        const card = document.createElement("div");
        card.className = "dashboard-memory-card gallery-card";

        let mediaThumbnailHtml = "";

        if (memory.mediaUrl) {
            if (memory.mediaType === "video") {
                mediaThumbnailHtml = `
                    <div class="card-media-preview video-preview">
                        <video src="${memory.mediaUrl}" preload="metadata"></video>
                        <div class="play-overlay-icon">▶ Play Video</div>
                    </div>
                `;
            } else {
                mediaThumbnailHtml = `
                    <div class="card-media-preview image-preview">
                        <img src="${memory.mediaUrl}" alt="${memory.title}" loading="lazy">
                    </div>
                `;
            }
        }

        const moodIcon = getMoodIcon(memory.mood);

        card.innerHTML = `
            ${mediaThumbnailHtml}
            <div class="card-content-wrap">
                <div class="card-badge-row">
                    <span class="memory-category">${memory.category || "Memory"}</span>
                    ${memory.mood ? `<span class="mood-badge">${moodIcon} ${memory.mood}</span>` : ""}
                </div>

                <h3>${escapeHtml(memory.title)}</h3>

                <p>${escapeHtml(memory.description || "No description provided.")}</p>

                <div class="memory-meta">
                    <span>📅 ${memory.memoryDate || "No date"}</span>
                    ${memory.location ? `<span>📍 ${escapeHtml(memory.location)}</span>` : ""}
                    ${memory.people ? `<span>👥 ${escapeHtml(memory.people)}</span>` : ""}
                </div>
            </div>
        `;

        card.addEventListener("click", () => openMemoryModal(memory));

        memoriesGrid.appendChild(card);
    });
}


/* Category Filter Click */
categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
        categoryPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeCategory = pill.dataset.category;
        renderGrid();
    });
});


/* =========================================
   MODAL DISPLAY & MEDIA PLAYER
========================================= */

function openMemoryModal(memory) {
    currentSelectedMemory = memory;

    modalViewMode.style.display = "block";
    modalEditMode.style.display = "none";

    // Media
    modalMediaContainer.innerHTML = "";
    if (memory.mediaUrl) {
        modalMediaContainer.style.display = "block";
        if (memory.mediaType === "video") {
            const video = document.createElement("video");
            video.src = memory.mediaUrl;
            video.controls = true;
            video.autoplay = false;
            video.className = "modal-video-player";
            modalMediaContainer.appendChild(video);
        } else {
            const img = document.createElement("img");
            img.src = memory.mediaUrl;
            img.alt = memory.title;
            img.className = "modal-image-preview";
            modalMediaContainer.appendChild(img);
        }
    } else {
        modalMediaContainer.style.display = "none";
    }

    modalCategory.textContent = memory.category || "Memory";
    modalMood.textContent = `${getMoodIcon(memory.mood)} ${memory.mood || "Neutral"}`;
    modalTitle.textContent = memory.title;
    modalDate.textContent = `📅 ${memory.memoryDate || "No date"}`;
    modalLocation.textContent = memory.location ? `📍 ${memory.location}` : "";
    modalPeople.textContent = memory.people ? `👥 ${memory.people}` : "";
    modalDescription.textContent = memory.description || "No detailed description written.";

    // Tags
    modalTagsContainer.innerHTML = "";
    if (memory.tags) {
        const tagList = memory.tags.split(",").map(t => t.trim()).filter(Boolean);
        tagList.forEach(tag => {
            const tagSpan = document.createElement("span");
            tagSpan.className = "tag-chip";
            tagSpan.textContent = `#${tag}`;
            modalTagsContainer.appendChild(tagSpan);
        });
    }

    memoryModal.style.display = "flex";
}


function closeModal() {
    memoryModal.style.display = "none";
    modalMediaContainer.innerHTML = "";
}

modalCloseBtn.addEventListener("click", closeModal);
memoryModal.addEventListener("click", (e) => {
    if (e.target === memoryModal) closeModal();
});


/* =========================================
   EDIT & DELETE MEMORY LOGIC
========================================= */

modalEditBtn.addEventListener("click", () => {
    if (!currentSelectedMemory) return;

    modalViewMode.style.display = "none";
    modalEditMode.style.display = "block";

    document.getElementById("editMemoryId").value = currentSelectedMemory.id;
    document.getElementById("editTitle").value = currentSelectedMemory.title;
    document.getElementById("editDate").value = currentSelectedMemory.memoryDate || "";
    document.getElementById("editCategory").value = currentSelectedMemory.category || "Personal";
    document.getElementById("editMood").value = currentSelectedMemory.mood || "Happy";
    document.getElementById("editLocation").value = currentSelectedMemory.location || "";
    document.getElementById("editPeople").value = currentSelectedMemory.people || "";
    document.getElementById("editTags").value = currentSelectedMemory.tags || "";
    document.getElementById("editDescription").value = currentSelectedMemory.description || "";
});

cancelEditBtn.addEventListener("click", () => {
    modalViewMode.style.display = "block";
    modalEditMode.style.display = "none";
});

editMemoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editMemoryId").value;

    const updatedData = {
        title: document.getElementById("editTitle").value.trim(),
        memoryDate: document.getElementById("editDate").value,
        category: document.getElementById("editCategory").value,
        mood: document.getElementById("editMood").value,
        location: document.getElementById("editLocation").value.trim(),
        people: document.getElementById("editPeople").value.trim(),
        tags: document.getElementById("editTags").value.trim(),
        description: document.getElementById("editDescription").value.trim(),
        mediaUrl: currentSelectedMemory.mediaUrl,
        mediaType: currentSelectedMemory.mediaType
    };

    try {
        const result = await apiRequest(`/memories/${id}?userId=${userId}`, {
            method: "PUT",
            body: JSON.stringify(updatedData)
        });

        closeModal();
        await loadMemories();

    } catch (error) {
        console.error("Failed to update memory:", error);
        alert("Failed to update memory: " + error.message);
    }
});


modalDeleteBtn.addEventListener("click", async () => {
    if (!currentSelectedMemory) return;

    if (confirm(`Are you sure you want to delete "${currentSelectedMemory.title}"?`)) {
        try {
            await apiRequest(`/memories/${currentSelectedMemory.id}?userId=${userId}`, {
                method: "DELETE"
            });

            closeModal();
            await loadMemories();

        } catch (error) {
            console.error("Failed to delete memory:", error);
            alert("Failed to delete memory: " + error.message);
        }
    }
});


/* =========================================
   UTILITIES
========================================= */

function getMoodIcon(mood) {
    switch ((mood || "").toLowerCase()) {
        case "happy": return "🌟";
        case "peaceful": return "🌿";
        case "excited": return "⚡";
        case "grateful": return "💖";
        case "reflective": return "🌙";
        case "nostalgic": return "🍂";
        case "energetic": return "🔥";
        case "sad": return "☁️";
        default: return "✨";
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}


/* Logout */
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });
}


/* Start */
loadMemories();
