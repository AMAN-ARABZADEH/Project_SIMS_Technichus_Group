/**
 * @param endpoint
 * The backend server endpoint, which is the
 * URL of the request.
 * @param payloadData
 * The data to be processed in the request
 * @returns {Promise<unknown>}
 * Promises are used for handling asynchronous
 * operations. It's an object representing the
 * eventual completion or failure of an
 * asynchronous operation and its resulting value. */
async function sendDataToServer(endpoint, payloadData) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadData)
        })
            /* First the response object is received,
             * which contains both the data and the
             * status of the request, status text,
             * headers, and methods for further operations.*/
        .then(response => response.json())
            /* 'data' is just a variable name; it's what
             * you receive when the Promise from the
             * response.json() resolves. */
        .then(data => {     /** var => {} is an arrow function, where 'var' is passed as an argument to the function */
            if (data.success) resolve(data); // resolves the promise; async op was successful
            else reject(data);  // rejects the promise; async op failed.
        });
    });
}

async function fetchDataFromServer(endpoint, queryParams = {}) {
    const url = `http://localhost:3000/${endpoint}?${queryParams}`;
    fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }, })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Data fetched successfully", data);
            // Do something with the data
        } else { console.log("Data fetching failed"); }
    })
    .catch(error => { console.log("An error occurred: ", error); });
}

document.addEventListener("DOMContentLoaded", () => {

    const welcomeDiv = document.getElementById('welcome_div');
    if(welcomeDiv !== null) {
        welcomeDiv.style.display = "none";
    } else {
        console.log("Element with ID 'welcome_div' not found.");
    }

    /*--------------------------------- ADMINISTRATOR REGISTRATION------------------------------------- */
    const submitAdmin = document.getElementById("reg_admin_submit_btn");
    submitAdmin.addEventListener("click", (e) => {
        e.preventDefault();
        const email = document.getElementById('input_email').value;
        const password = document.getElementById('input_pw').value;
        const firstName = document.getElementById('input_first_name').value;
        const lastName = document.getElementById('input_last_name').value;
        sendDataToServer("registerAdmin", {firstName, lastName, email, password})
            .then(r => { window.location.href = "../public/dashboard.html"; });
    });
    /*--------------------------------- EXHIBIT REGISTRATION ------------------------------------------ */
    const submitExhibit = document.getElementById("reg_exh_submit_btn");
    submitExhibit.addEventListener("click", (e) => {
        e.preventDefault();
        const name = document.getElementById('input_exhibit_name').value;
        const theme = document.getElementById('input_exhibit_theme').value;
        sendDataToServer("registerExhibit", {name, theme})
            .then(r => { });
    });
    /*--------------------------------- MEDIA PLAYER REGISTRATION ------------------------------------- */
    const submitMediaPlayer = document.getElementById("reg_player_submit_btn");

    submitMediaPlayer.addEventListener("click", (e) => {
        e.preventDefault();
        const player_name = document.getElementById("input_player_name").value;
        const assoc_exhibit = document.getElementById("input_player_station").value;
        const resolution = document.getElementById("input_player_resolution").value;
        sendDataToServer("registerMediaPlayer",
            {player_name, assoc_exhibit, resolution}).then(r => {});
    });

    /*--------------------------------- MANAGE MEDIA PLAYERS ------------------------------------------ */
    const manage_media_players_btn = document.getElementById("manage_media_players_btn");

    manage_media_players_btn.addEventListener("click", (e) => {
        e.preventDefault();
        fetchDataFromServer("manageMediaPlayers")
        .then(r => {
            console.log(r.data.body);
        });
    });

    /*------------------------------------- ADMIN SIGN IN ------------------------------------------ */
    const sign_in_btn = document.getElementById("sign_in_submit_btn");

    sign_in_btn.addEventListener("click", (e) => {
        e.preventDefault();

        const email = document.getElementById('input_email').value;
        const pw = document.getElementById('input_pw').value;

        fetchDataFromServer("signIn", {email: email, password: pw})
        .then(r => r.json())
        .then(data => {
           if (data.success) {
               document.getElementById('log_in').style.display = "none";
               document.getElementById('welcome_msg').style.display = "block";
               document.getElementById('welcome_msg').innerHTML += data.name;
               console.log("Logged in successfully");
               window.location.href = "../public/dashboard.html";
           }
           else { console.log("Failed to sign in"); }
        });
    });
});

