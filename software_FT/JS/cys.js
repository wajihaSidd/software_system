// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/cybersecuritylog"; // POST new log
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/cybersecuritylogs"; // GET all logs

// DOM elements
const tbody = document.querySelector("#cybersecurityLogsTable tbody");
const logForm = document.getElementById("logForm");
const modal = document.getElementById("logModal");
const insertBtn = document.getElementById("insertLogBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

let cybersecurityLogsData = [];

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

// Render cybersecurity logs table
function renderTable() {
    tbody.innerHTML = "";

    if (cybersecurityLogsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center;">No cybersecurity logs found</td></tr>`;
        return;
    }

    cybersecurityLogsData.forEach((log) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${log.logid}</td>
            <td>${log.eventtype}</td>
            <td>${log.userid}</td>
            <td>${log.ipaddress}</td>
            <td>${new Date(log.eventtimestamp).toLocaleString()}</td>
            <td>${log.description}</td>
            <td>${log.severity}</td>
            <td>${log.actiontaken || 'N/A'}</td>
            <td>${log.status}</td>
            <td>${log.relatedentitytype}</td>
            <td>${log.relatedentityid}</td>
            <td>${new Date(log.createdat).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fetch all cybersecurity logs
async function fetchCybersecurityLogs() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        cybersecurityLogsData = data;
        renderTable();
        showStatus("Cybersecurity logs loaded successfully", true);
    } catch (error) {
        console.error("Error fetching cybersecurity logs:", error);
        showStatus("Failed to load cybersecurity logs", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const logData = {
        eventtype: document.getElementById("eventtype").value.trim(),
        userid: document.getElementById("userid").value.trim(),
        ipaddress: document.getElementById("ipaddress").value.trim(),
        eventtimestamp: document.getElementById("eventtimestamp").value.trim(),
        description: document.getElementById("description").value.trim(),
        severity: document.getElementById("severity").value.trim(),
        actiontaken: document.getElementById("actiontaken").value.trim(),
        status: document.getElementById("status").value.trim(),
        relatedentitytype: document.getElementById("relatedentitytype").value.trim(),
        relatedentityid: document.getElementById("relatedentityid").value.trim(),
        createdat: document.getElementById("createdat").value.trim()
    };

    // Validate required fields
    if (!logData.eventtype || !logData.userid || !logData.ipaddress || 
        !logData.eventtimestamp || !logData.description || !logData.severity || 
        !logData.status || !logData.relatedentitytype || !logData.relatedentityid || 
        !logData.createdat) {
        showStatus("Please fill in all required fields", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add cybersecurity log");
        }

        const addedLog = await response.json();
        cybersecurityLogsData.push(addedLog);
        renderTable();
        modal.style.display = "none";
        showStatus("Cybersecurity log added successfully", true);
    } catch (error) {
        console.error("Error adding cybersecurity log:", error);
        showStatus(`Failed to add cybersecurity log: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Cybersecurity Log";
    logForm.reset();
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

logForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchCybersecurityLogs);