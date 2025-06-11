// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/user"; // POST new user
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/users"; // GET all users

// DOM elements
const tbody = document.querySelector("#usersTable tbody");
const userForm = document.getElementById("userForm");
const modal = document.getElementById("userModal");
const insertBtn = document.getElementById("insertUserBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

let usersData = [];

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

// Render users table
function renderTable() {
    tbody.innerHTML = "";

    if (usersData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No users found</td></tr>`;
        return;
    }

    usersData.forEach((user) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.userid}</td>
            <td>${user.username}</td>
            <td>${user.passwordhash.substring(0, 15)}...</td>
            <td>${user.email}</td>
            <td>${user.accesslevel}</td>
            <td>${user.accountstatus}</td>
            <td>${user.lastlogin ? new Date(user.lastlogin).toLocaleString() : 'Never'}</td>
            <td>${user.failedloginattempts}</td>
            <td>${user.twofactorenabled ? 'Yes' : 'No'}</td>
            <td>${user.employeeid}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fetch all users
async function fetchUsers() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        usersData = data;
        renderTable();
        showStatus("Users loaded successfully", true);
    } catch (error) {
        console.error("Error fetching users:", error);
        showStatus("Failed to load users", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const userData = {
        username: document.getElementById("username").value.trim(),
        passwordhash: document.getElementById("passwordhash").value.trim(),
        email: document.getElementById("email").value.trim(),
        accesslevel: document.getElementById("accesslevel").value.trim(),
        accountstatus: document.getElementById("accountstatus").value.trim(),
        lastlogin: document.getElementById("lastlogin").value.trim(),
        failedloginattempts: parseInt(document.getElementById("failedloginattempts").value.trim()),
        twofactorenabled: document.getElementById("twofactorenabled").value === "true",
        employeeid: parseInt(document.getElementById("employeeid").value.trim())
    };

    // Validate required fields
    if (!userData.username || !userData.passwordhash || !userData.email || 
        !userData.accesslevel || !userData.accountstatus || !userData.lastlogin || 
        isNaN(userData.failedloginattempts) || isNaN(userData.employeeid)) {
        showStatus("Please fill in all required fields", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add user");
        }

        const addedUser = await response.json();
        usersData.push(addedUser);
        renderTable();
        modal.style.display = "none";
        showStatus("User added successfully", true);
    } catch (error) {
        console.error("Error adding user:", error);
        showStatus(`Failed to add user: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert User";
    userForm.reset();
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

userForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchUsers);