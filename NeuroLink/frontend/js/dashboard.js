/* =========================================
   GET LOGGED-IN USER
========================================= */

const userId =
    localStorage.getItem("userId");

const userName =
    localStorage.getItem("userName");


/* =========================================
   CHECK LOGIN
========================================= */

if (!userId) {

    window.location.href =
        "login.html";

}


/* =========================================
   DISPLAY USER NAME
========================================= */

const userNameElement =
    document.getElementById("userName");

if (userNameElement && userName) {

    userNameElement.textContent =
        userName;

}


/* =========================================
   LOAD MEMORIES
========================================= */

async function loadDashboardMemories() {

    try {

        const memories =
            await apiRequest(
                `/memories?userId=${userId}`
            );


        /*
         * Update total memory count.
         */

        document.getElementById(
            "totalMemories"
        ).textContent = memories.length;


        /*
         * If there are no memories,
         * keep the empty state.
         */

        if (memories.length === 0) {

            return;

        }


        /*
         * Sort memories by date.
         * Newest memory appears first.
         */

        memories.sort(
            (a, b) =>
                new Date(b.memoryDate) -
                new Date(a.memoryDate)
        );


        /*
         * Latest memory date.
         */

        const latest =
            memories[0];

        document.getElementById(
            "latestMemory"
        ).textContent =
            latest.memoryDate || "—";


        /*
         * Display recent memories.
         */

        const container =
            document.getElementById(
                "recentMemories"
            );

        container.innerHTML = "";


        /*
         * Show maximum 6 recent memories.
         */

        const recentMemories =
            memories.slice(0, 6);


        recentMemories.forEach(
            memory => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "dashboard-memory-card";


                card.innerHTML = `

                    <span class="memory-category">
                        ${memory.category || "Memory"}
                    </span>

                    <h3>
                        ${memory.title}
                    </h3>

                    <p>
                        ${memory.description || "No description added."}
                    </p>

                    <div class="memory-meta">

                        <span>
                            📅 ${memory.memoryDate || "No date"}
                        </span>

                        <span>
                            📍 ${memory.location || "No location"}
                        </span>

                    </div>

                `;


                container.appendChild(card);

            }
        );


    } catch (error) {

        console.error(
            "Unable to load memories:",
            error
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            /*
             * Remove saved user information.
             */

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "userName"
            );

            localStorage.removeItem(
                "userEmail"
            );


            /*
             * Return to login page.
             */

            window.location.href =
                "login.html";

        }
    );

}


/* =========================================
   START DASHBOARD
========================================= */

loadDashboardMemories();