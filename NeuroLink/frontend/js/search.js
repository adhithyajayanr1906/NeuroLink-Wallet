/* =========================================
   AUTH CHECK
========================================= */

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


let searchTimeout = null;
let currentResults = [];
let activeQuickFilter = "ALL";


/* DOM Elements */
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchResultsGrid = document.getElementById("searchResultsGrid");
const resultsHeading = document.getElementById("resultsHeading");
const resultsCountEyebrow = document.getElementById("resultsCountEyebrow");
const filterChips = document.querySelectorAll(".filter-chip");

/* Modal Elements */
const memoryModal = document.getElementById("memoryModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalMediaContainer = document.getElementById("modalMediaContainer");
const modalCategory = document.getElementById("modalCategory");
const modalMood = document.getElementById("modalMood");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalLocation = document.getElementById("modalLocation");
const modalPeople = document.getElementById("modalPeople");
const modalDescription = document.getElementById("modalDescription");
const modalTagsContainer = document.getElementById("modalTagsContainer");


/* =========================================
   SEARCH EXECUTION
========================================= */

async function performSearch(keyword = "") {
    try {
        const query = keyword.trim();

        let endpoint = `/memories?userId=${userId}`;
        if (query.length > 0) {
            endpoint = `/memories/search?userId=${userId}&keyword=${encodeURIComponent(query)}`;
        }

        const data = await apiRequest(endpoint);

        currentResults = data;
        renderSearchResults(query);

    } catch (error) {
        console.error("Search failed:", error);
        searchResultsGrid.innerHTML = `
            <div class="empty-memory">
                <div class="empty-icon">⚠️</div>
                <h3>Search failed</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}


function renderSearchResults(query = "") {
    let filtered = currentResults;

    if (activeQuickFilter === "MEDIA_ONLY") {
        filtered = currentResults.filter(m => m.mediaUrl && m.mediaUrl.length > 0);
    } else if (activeQuickFilter !== "ALL") {
        filtered = currentResults.filter(m => 
            (m.mood || "").toLowerCase() === activeQuickFilter.toLowerCase() ||
            (m.category || "").toLowerCase() === activeQuickFilter.toLowerCase()
        );
    }

    // Update count & heading
    resultsCountEyebrow.textContent = query ? `RESULTS FOR "${query.toUpperCase()}"` : "ALL VAULT MEMORIES";
    resultsHeading.textContent = `${filtered.length} Memory ${filtered.length === 1 ? "Found" : "Found"}`;

    if (filtered.length === 0) {
        searchResultsGrid.innerHTML = `
            <div class="empty-memory">
                <div class="empty-icon">🔍</div>
                <h3>No memories matched</h3>
                <p>Try searching with different keywords or clearing your quick filters.</p>
            </div>
        `;
        return;
    }

    searchResultsGrid.innerHTML = "";

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

        card.addEventListener("click", () => openModal(memory));
        searchResultsGrid.appendChild(card);
    });
}


/* Input Debounce Listener */
searchInput.addEventListener("input", (e) => {
    const val = e.target.value;

    clearSearchBtn.style.display = val.length > 0 ? "block" : "none";

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(val);
    }, 300);
});


clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    performSearch("");
});


/* Quick Filter Chips */
filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
        filterChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeQuickFilter = chip.dataset.filter;
        renderSearchResults(searchInput.value);
    });
});


/* =========================================
   MODAL DISPLAY
========================================= */

function openModal(memory) {
    modalMediaContainer.innerHTML = "";

    if (memory.mediaUrl) {
        modalMediaContainer.style.display = "block";
        if (memory.mediaType === "video") {
            const video = document.createElement("video");
            video.src = memory.mediaUrl;
            video.controls = true;
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
    modalDescription.textContent = memory.description || "No description text.";

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

modalCloseBtn.addEventListener("click", () => {
    memoryModal.style.display = "none";
    modalMediaContainer.innerHTML = "";
});

memoryModal.addEventListener("click", (e) => {
    if (e.target === memoryModal) {
        memoryModal.style.display = "none";
        modalMediaContainer.innerHTML = "";
    }
});


/* Helpers */
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


/* Initial Load */
performSearch("");
