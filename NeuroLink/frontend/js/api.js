const API_BASE_URL = "http://localhost:8080/api";


async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                method: options.method || "GET",

                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },

                body: options.body
            }
        );


        /*
         * Read the response.
         *
         * Spring Boot may return either JSON
         * or plain text.
         */

        const contentType =
            response.headers.get("content-type");

        let data;


        if (
            contentType &&
            contentType.includes("application/json")
        ) {

            data = await response.json();

        } else {

            data = await response.text();

        }


        /*
         * If Spring Boot returned an error,
         * convert it into a JavaScript error.
         */

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : data.message ||
                    "Request failed"
            );

        }


        return data;


    } catch (error) {

        /*
         * Show the actual error in the browser console.
         */

        console.error(
            "API Request Error:",
            error
        );

        throw error;

    }

}