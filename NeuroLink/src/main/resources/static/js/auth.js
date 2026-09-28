const registerForm =
    document.getElementById("registerForm");

const loginForm =
    document.getElementById("loginForm");


/* =========================================
   REGISTER
========================================= */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            // Prevent the browser from refreshing the page
            event.preventDefault();


            // Get values from the registration form
            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;

            const message =
                document.getElementById(
                    "registerMessage"
                );


            // Check if passwords match
            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                message.className =
                    "form-message error";

                return;
            }


            // Send registration request to Spring Boot
            try {

                const user = await apiRequest(
                    "/users/register",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    }
                );


                // Registration successful
                message.textContent =
                    "Account created successfully! Redirecting...";

                message.className =
                    "form-message success";


                // Go to login page
                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1200);


            } catch (error) {

                // Show backend error
                message.textContent =
                    error.message;

                message.className =
                    "form-message error";
            }

        }
    );

}


/* =========================================
   LOGIN
========================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            // Prevent normal form submission
            event.preventDefault();


            // Get login values
            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const message =
                document.getElementById(
                    "loginMessage"
                );


            // Send login request to Spring Boot
            try {

                const user = await apiRequest(
                    "/users/login",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


                /*
                 * Save the logged-in user's
                 * basic information in the browser.
                 */
                localStorage.setItem(
                    "userId",
                    user.id
                );

                localStorage.setItem(
                    "userName",
                    user.name
                );

                localStorage.setItem(
                    "userEmail",
                    user.email
                );


                // Show success message
                message.textContent =
                    "Login successful! Opening your vault...";

                message.className =
                    "form-message success";


                // Open dashboard
                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 800);


            } catch (error) {

                // Show login error
                message.textContent =
                    "Invalid email or password.";

                message.className =
                    "form-message error";
            }

        }
    );

}