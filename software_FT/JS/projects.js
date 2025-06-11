// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/project"; // POST new project
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/projects"; // GET all projects

// DOM elements
const tbody = document.querySelector("#projectsTable tbody");
const projectForm = document.getElementById("projectForm");
const modal = document.getElementById("projectModal");
const insertBtn = document.getElementById("insertProjectBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

// Chart variables
let budgetChart;
let statusChart;

let projectsData = [];

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

// Render projects table
function renderTable() {
    tbody.innerHTML = "";

    if (projectsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" style="text-align: center;">No projects found</td></tr>`;
        return;
    }

    projectsData.forEach((project) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${project.projectid}</td>
            <td>${project.projectname}</td>
            <td>${project.description.substring(0, 50)}${project.description.length > 50 ? '...' : ''}</td>
            <td>${project.clientid}</td>
            <td>${project.contractid}</td>
            <td>${new Date(project.startdate).toLocaleDateString()}</td>
            <td>${new Date(project.deadline).toLocaleDateString()}</td>
            <td>$${project.budget.toLocaleString()}</td>
            <td>${project.estimatedhours}</td>
            <td>${project.projectmanagerid}</td>
            <td>${project.status}</td>
            <td>${project.technologystack.substring(0, 20)}${project.technologystack.length > 20 ? '...' : ''}</td>
            <td><a href="${project.repositoryurl}" target="_blank">View Repo</a></td>
        `;
        tbody.appendChild(tr);
    });
}



// Fetch all projects
async function fetchProjects() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        projectsData = data;
        renderTable();
        createCharts();
        showStatus("Projects loaded successfully", true);
    } catch (error) {
        console.error("Error fetching projects:", error);
        showStatus("Failed to load projects", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const projectData = {
        projectname: document.getElementById("projectname").value.trim(),
        description: document.getElementById("description").value.trim(),
        clientid: document.getElementById("clientid").value.trim(),
        contractid: document.getElementById("contractid").value.trim(),
        startdate: document.getElementById("startdate").value.trim(),
        deadline: document.getElementById("deadline").value.trim(),
        budget: parseFloat(document.getElementById("budget").value.trim()),
        estimatedhours: parseInt(document.getElementById("estimatedhours").value.trim()),
        projectmanagerid: document.getElementById("projectmanagerid").value.trim(),
        status: document.getElementById("status").value.trim(),
        technologystack: document.getElementById("technologystack").value.trim(),
        repositoryurl: document.getElementById("repositoryurl").value.trim()
    };

    // Validate required fields
    if (!projectData.projectname || !projectData.description || !projectData.clientid || 
        !projectData.contractid || !projectData.startdate || !projectData.deadline || 
        isNaN(projectData.budget) || isNaN(projectData.estimatedhours) || 
        !projectData.projectmanagerid || !projectData.status || 
        !projectData.technologystack || !projectData.repositoryurl) {
        showStatus("Please fill in all required fields", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add project");
        }

        const addedProject = await response.json();
        projectsData.push(addedProject);
        renderTable();
        createCharts();
        modal.style.display = "none";
        showStatus("Project added successfully", true);
    } catch (error) {
        console.error("Error adding project:", error);
        showStatus(`Failed to add project: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Project";
    projectForm.reset();
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



projectForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchProjects);