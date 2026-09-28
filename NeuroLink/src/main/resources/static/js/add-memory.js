/* =========================================
   AUTHENTICATION CHECK
========================================= */

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


/* Set default date to today */

document.getElementById("memoryDate").value = new Date().toISOString().split("T")[0];


/* =========================================
   MOOD PICKER LOGIC
========================================= */

const moodInput = document.getElementById("mood");

const moodChips = document.querySelectorAll(".mood-chip");


moodChips.forEach(chip => {

    chip.addEventListener("click", () => {

        moodChips.forEach(c => c.classList.remove("active"));

        chip.classList.add("active");

        moodInput.value = chip.dataset.mood;

    });

});


/* =========================================
   MEDIA UPLOAD & PREVIEW LOGIC
========================================= */

let currentMediaUrl = "";

let currentMediaType = "";


const dropzone = document.getElementById("dropzone");

const mediaFileInput = document.getElementById("mediaFile");

const browseButton = document.getElementById("browseButton");

const mediaUrlInput = document.getElementById("mediaUrlInput");

const mediaPreviewBox = document.getElementById("mediaPreviewBox");

const previewContent = document.getElementById("previewContent");

const previewLabel = document.getElementById("previewLabel");

const removeMediaBtn = document.getElementById("removeMediaBtn");



/* Click to browse */

browseButton.addEventListener("click", () => mediaFileInput.click());

dropzone.addEventListener("click", (e) => {

    if (e.target !== browseButton && e.target !== mediaFileInput) {

        mediaFileInput.click();

    }

});



/* Drag & Drop events */

['dragenter', 'dragover'].forEach(eventName => {

    dropzone.addEventListener(eventName, (e) => {

        e.preventDefault();

        e.stopPropagation();

        dropzone.classList.add('dragover');

    }, false);

});


['dragleave', 'drop'].forEach(eventName => {

    dropzone.addEventListener(eventName, (e) => {

        e.preventDefault();

        e.stopPropagation();

        dropzone.classList.remove('dragover');

    }, false);

});


dropzone.addEventListener('drop', (e) => {

    const files = e.dataTransfer.files;

    if (files.length > 0) {

        handleFileSelected(files[0]);

    }

});


mediaFileInput.addEventListener('change', (e) => {

    if (e.target.files.length > 0) {

        handleFileSelected(e.target.files[0]);

    }

});


mediaUrlInput.addEventListener('input', () => {

    const url = mediaUrlInput.value.trim();

    if (url) {

        const isVideo = url.match(/\.(mp4|webm|ogg|mov)($|\?)/i) || url.includes("video");

        showPreview(url, isVideo ? "video" : "image");

    } else if (!mediaFileInput.files.length) {

        clearPreview();

    }

});


function handleFileSelected(file) {

    const isVideo = file.type.startsWith("video/");

    const reader = new FileReader();


    reader.onload = (e) => {

        const dataUrl = e.target.result;

        showPreview(dataUrl, isVideo ? "video" : "image");

    };


    reader.readAsDataURL(file);

}


function showPreview(url, type) {

    currentMediaUrl = url;

    currentMediaType = type;


    mediaPreviewBox.style.display = "block";

    previewContent.innerHTML = "";


    if (type === "video") {

        previewLabel.textContent = "🎥 Video Preview";

        const video = document.createElement("video");

        video.src = url;

        video.controls = true;

        video.className = "preview-video";

        previewContent.appendChild(video);

    } else {

        previewLabel.textContent = "📷 Photo Preview";

        const img = document.createElement("img");

        img.src = url;

        img.className = "preview-image";

        previewContent.appendChild(img);

    }

}


function clearPreview() {

    currentMediaUrl = "";

    currentMediaType = "";

    mediaPreviewBox.style.display = "none";

    previewContent.innerHTML = "";

    mediaFileInput.value = "";

    mediaUrlInput.value = "";

}


removeMediaBtn.addEventListener("click", clearPreview);



/* =========================================
   FORM SUBMISSION
========================================= */

const form = document.getElementById("addMemoryForm");

const submitBtn = document.getElementById("submitBtn");


form.addEventListener("submit", async (e) => {

    e.preventDefault();


    submitBtn.disabled = true;

    submitBtn.textContent = "Saving...";


    try {

        const requestBody = JSON.stringify({

            title: document.getElementById("title").value.trim(),

            memoryDate: document.getElementById("memoryDate").value,

            category: document.getElementById("category").value,

            mood: document.getElementById("mood").value,

            location: document.getElementById("location").value.trim(),

            people: document.getElementById("people").value.trim(),

            tags: document.getElementById("tags").value.trim(),

            description: document.getElementById("description").value.trim(),

            mediaUrl: currentMediaUrl,

            mediaType: currentMediaType

        });


        await apiRequest(`/memories?userId=${userId}`, {

            method: "POST",

            body: requestBody

        });


        window.location.href = "memories.html";


    } catch (error) {

        console.error("Error creating memory:", error);

        alert("Failed to save memory: " + error.message);

        submitBtn.disabled = false;

        submitBtn.textContent = "✨ Save Memory";

    }

});



/* =========================================
   LOGOUT
========================================= */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", () => {

        localStorage.clear();

        window.location.href = "login.html";

    });

}

