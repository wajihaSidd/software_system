// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/team"; // POST new team
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/teams"; // GET all teams

// DOM elements
const tbody = document.querySelector("#teamsTable tbody");
const teamForm = document.getElementById("teamForm");
const modal = document.getElementById("teamModal");
const insertBtn = document.getElementById("insertTeamBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

let teamsData = [];

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = "block";
    tbody.style.opacity = "0.5";
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = "none";
    tbody.style.opacity = "1";
}

// Show status message
function showStatus(message, isSuccess) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isSuccess ? 'success' : 'error'}`;
    statusMessage.style.display = "block";
    
    setTimeout(() => {
        statusMessage.style.display = "none";
    }, 5000);
}

// Render teams table
function renderTable() {
    tbody.innerHTML = "";

    if (teamsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No teams found</td></tr>`;
        return;
    }

    teamsData.forEach((team) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${team.teamid}</td>
            <td>${team.teamname}</td>
            <td>${team.departmentid}</td>
            <td>${team.teamleadid}</td>
            <td>${team.description}</td>
            <td>${new Date(team.createdat).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fetch all teams
async function fetchTeams() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        teamsData = data;
        renderTable();
        showStatus("Teams loaded successfully", true);
    } catch (error) {
        console.error("Error fetching teams:", error);
        showStatus("Failed to load teams", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const teamData = {
        teamname: document.getElementById("teamname").value.trim(),
        departmentid: parseInt(document.getElementById("departmentid").value.trim()),
        teamleadid: parseInt(document.getElementById("teamleadid").value.trim()),
        description: document.getElementById("description").value.trim(),
        createdat: document.getElementById("createdat").value.trim()
    };

    // Validate required fields
    if (!teamData.teamname || isNaN(teamData.departmentid) || 
        isNaN(teamData.teamleadid) || !teamData.description || 
        !teamData.createdat) {
        showStatus("Please fill in all required fields with valid values", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(teamData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add team");
        }

        const addedTeam = await response.json();
        teamsData.push(addedTeam);
        renderTable();
        modal.style.display = "none";
        showStatus("Team added successfully", true);
    } catch (error) {
        console.error("Error adding team:", error);
        showStatus(`Failed to add team: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Team";
    teamForm.reset();
    modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

logoutBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

teamForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchTeams);