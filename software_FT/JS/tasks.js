// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/task"; // POST new task
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/tasks"; // GET all tasks

// DOM elements
const tbody = document.querySelector("#tasksTable tbody");
const taskForm = document.getElementById("taskForm");
const modal = document.getElementById("taskModal");
const insertBtn = document.getElementById("insertTaskBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

let tasksData = [];

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

// Render tasks table
function renderTable() {
    tbody.innerHTML = "";

    if (tasksData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align: center;">No tasks found</td></tr>`;
        return;
    }

    tasksData.forEach((task) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${task.taskid}</td>
            <td>${task.projectid}</td>
            <td>${task.taskname}</td>
            <td>${task.description}</td>
            <td>${task.assignedto}</td>
            <td>${task.assignedby}</td>
            <td>${new Date(task.startdate).toLocaleDateString()}</td>
            <td>${new Date(task.duedate).toLocaleDateString()}</td>
            <td>${task.estimatedhours}</td>
            <td>${task.actualhours}</td>
            <td>${task.priority}</td>
            <td>${task.status}</td>
            <td>${task.completionpercentage}</td>
            <td>${task.notes}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fetch all tasks
async function fetchTasks() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        tasksData = data;
        renderTable();
        showStatus("Tasks loaded successfully", true);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        showStatus("Failed to load tasks", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const taskData = {
        projectid: parseInt(document.getElementById("projectid").value.trim()),
        taskname: document.getElementById("taskname").value.trim(),
        description: document.getElementById("description").value.trim(),
        assignedto: document.getElementById("assignedto").value.trim(),
        assignedby: document.getElementById("assignedby").value.trim(),
        startdate: document.getElementById("startdate").value.trim(),
        duedate: document.getElementById("duedate").value.trim(),
        estimatedhours: parseFloat(document.getElementById("estimatedhours").value.trim()),
        actualhours: parseFloat(document.getElementById("actualhours").value.trim()),
        priority: document.getElementById("priority").value.trim(),
        status: document.getElementById("status").value.trim(),
        completionpercentage: parseInt(document.getElementById("completionpercentage").value.trim()),
        notes: document.getElementById("notes").value.trim()
    };

    // Validate required fields
    if (isNaN(taskData.projectid)) {
        showStatus("Project ID must be a number", false);
        return;
    }

    if (isNaN(taskData.estimatedhours) ){
        showStatus("Estimated hours must be a number", false);
        return;
    }

    if (isNaN(taskData.actualhours)) {
        showStatus("Actual hours must be a number", false);
        return;
    }

    if (isNaN(taskData.completionpercentage) || taskData.completionpercentage < 0 || taskData.completionpercentage > 100) {
        showStatus("Completion percentage must be between 0 and 100", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add task");
        }

        const addedTask = await response.json();
        tasksData.push(addedTask);
        renderTable();
        modal.style.display = "none";
        showStatus("Task added successfully", true);
    } catch (error) {
        console.error("Error adding task:", error);
        showStatus(`Failed to add task: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Task";
    taskForm.reset();
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

taskForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchTasks);