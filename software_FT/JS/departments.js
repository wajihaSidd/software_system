// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/department"; // POST new department
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/departments"; // GET all departments

// DOM elements
const tbody = document.querySelector("#departmentsTable tbody");
const departmentForm = document.getElementById("departmentForm");
const modal = document.getElementById("departmentModal");
const insertBtn = document.getElementById("insertDeptBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");
const showChartBtn = document.getElementById("showChartBtn");
const budgetChartCanvas = document.getElementById("budgetChart");

let departmentsData = [];
let budgetChart = null;

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

// Render departments table
function renderTable() {
    tbody.innerHTML = "";

    if (departmentsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No departments found</td></tr>`;
        return;
    }

    departmentsData.forEach((department) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${department.departmentid}</td>
            <td>${department.departmentname}</td>
            <td>$${department.budget.toLocaleString()}</td>
            <td>${department.location}</td>
            <td>${department.contactemail}</td>
            <td>${department.contactphone}</td>
            <td>${department.description}</td>
            <td>${new Date(department.createdat).toLocaleDateString()}</td>
            <td>${department.departmentheadid}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Create or update budget chart
function renderBudgetChart() {
    // Destroy previous chart if it exists
    if (budgetChart) {
        budgetChart.destroy();
    }
    
    const ctx = budgetChartCanvas.getContext("2d");
    
    // Extract department names and budgets
    const departmentNames = departmentsData.map(dept => dept.departmentname);
    const departmentBudgets = departmentsData.map(dept => dept.budget);
    
    // Create chart
    budgetChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: departmentNames,
            datasets: [{
                label: "Department Budget ($)",
                data: departmentBudgets,
                backgroundColor: "rgba(74, 144, 226, 0.6)",
                borderColor: "rgba(74, 144, 226, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Show the chart
    budgetChartCanvas.style.display = "block";
}

// Toggle chart visibility
function toggleChartVisibility() {
    if (budgetChartCanvas.style.display === "none") {
        renderBudgetChart();
        showChartBtn.textContent = "Hide Budget Chart";
    } else {
        budgetChartCanvas.style.display = "none";
        showChartBtn.textContent = "Show Budget Chart";
    }
}

// Fetch all departments
async function fetchDepartments() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        departmentsData = data;
        renderTable();
        showStatus("Departments loaded successfully", true);
    } catch (error) {
        console.error("Error fetching departments:", error);
        showStatus("Failed to load departments", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const departmentData = {
        departmentname: document.getElementById("departmentname").value.trim(),
        budget: parseFloat(document.getElementById("budget").value.trim()),
        location: document.getElementById("location").value.trim(),
        contactemail: document.getElementById("contactemail").value.trim(),
        contactphone: document.getElementById("contactphone").value.trim(),
        description: document.getElementById("description").value.trim(),
        createdat: document.getElementById("createdat").value.trim(),
        departmentheadid: parseInt(document.getElementById("departmentheadid").value.trim())
    };

    // Validate required fields
    if (!departmentData.departmentname || isNaN(departmentData.budget) || 
        !departmentData.location || !departmentData.contactemail || 
        !departmentData.contactphone || !departmentData.description || 
        !departmentData.createdat || isNaN(departmentData.departmentheadid)) {
        showStatus("Please fill in all required fields", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(departmentData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add department");
        }

        const addedDepartment = await response.json();
        departmentsData.push(addedDepartment);
        renderTable();
        modal.style.display = "none";
        showStatus("Department added successfully", true);
        
        // Update the chart if it's visible
        if (budgetChartCanvas.style.display !== "none") {
            renderBudgetChart();
        }
    } catch (error) {
        console.error("Error adding department:", error);
        showStatus(`Failed to add department: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Department";
    departmentForm.reset();
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

showChartBtn.addEventListener("click", toggleChartVisibility);

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

departmentForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchDepartments);