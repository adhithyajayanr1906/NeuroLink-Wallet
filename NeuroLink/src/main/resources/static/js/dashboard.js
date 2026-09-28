/* =========================================
   GET LOGGED-IN USER
========================================= */

const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");


/* =========================================
   CHECK LOGIN
========================================= */

if (!userId) {
    window.location.href = "login.html";
}


/* =========================================
   DISPLAY USER NAME
========================================= */

const userNameElement = document.getElementById("userName");

if (userNameElement && userName) {
    userNameElement.textContent = userName;
}


/* =========================================
   LOAD MEMORIES FOR DASHBOARD
========================================= */

async function loadDashboardMemories() {

    try {

        const memories = await apiRequest(`/memories?userId=${userId}`);


        /* Update total memory count */
        const totalMemoriesElem = document.getElementById("totalMemories");
        if (totalMemoriesElem) {
            totalMemoriesElem.textContent = memories.length;
        }


        if (memories.length === 0) {
            return;
        }


        /* Calculate favorite mood */
        const moodCounts = {};
        memories.forEach(m => {
            if (m.mood) {
                moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
            }
        });

        let topMood = "—";
        let maxCount = 0;
        for (const [mood, count] of Object.entries(moodCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topMood = mood;
            }
        }

        const favMoodElem = document.getElementById("favoriteMood");
        if (favMoodElem) {
            favMoodElem.textContent = topMood !== "—" ? `${getMoodIcon(topMood)} ${topMood}` : "—";
        }


        /* Sort memories by date (newest first) */
        memories.sort((a, b) => new Date(b.memoryDate) - new Date(a.memoryDate));


        /* Latest memory date */
        const latest = memories[0];
        const latestMemoryElem = document.getElementById("latestMemory");
        if (latestMemoryElem) {
            latestMemoryElem.textContent = latest.memoryDate || "—";
        }


        /* Display recent memories */
        const container = document.getElementById("recentMemories");
        container.innerHTML = "";


        const recentMemories = memories.slice(0, 6);


        recentMemories.forEach(memory => {

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

                    <p>${escapeHtml(memory.description || "No description added.")}</p>

                    <div class="memory-meta">
                        <span>📅 ${memory.memoryDate || "No date"}</span>
                        <span>📍 ${escapeHtml(memory.location || "No location")}</span>
                    </div>
                </div>
            `;

            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                window.location.href = "memories.html";
            });

            container.appendChild(card);

        });


    } catch (error) {

        console.error("Unable to load memories:", error);

    }

}


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


/* =========================================
   LOGOUT
========================================= */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {
        localStorage.clear();
        window.location.href = "login.html";
    });

}


/* START DASHBOARD */
loadDashboardMemories();