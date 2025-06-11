// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/contracts"; // POST new contract
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/contracts"; // GET all contracts

// DOM elements
const tbody = document.querySelector("#contractsTable tbody");
const contractForm = document.getElementById("contractForm");
const modal = document.getElementById("contractModal");
const insertBtn = document.getElementById("insertContractBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");
const statusChartCanvas = document.getElementById("statusChart");
const toggleStatusChartBtn = document.getElementById("toggleStatusChartBtn");

let contractsData = [];
let statusChart = null;

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

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Render contracts table
function renderTable() {
    tbody.innerHTML = "";

    if (contractsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center;">No contracts found</td></tr>`;
        return;
    }

    contractsData.forEach((contract) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${contract.contractid}</td>
            <td>${contract.clientid}</td>
            <td>${contract.contractname}</td>
            <td>${formatDate(contract.startdate)}</td>
            <td>${formatDate(contract.enddate)}</td>
            <td>$${contract.contractvalue?.toLocaleString() || '0'}</td>
            <td>${contract.paymentschedule}</td>
            <td>${contract.termsandconditions?.substring(0, 50)}${contract.termsandconditions?.length > 50 ? '...' : ''}</td>
            <td>${formatDate(contract.signeddate)}</td>
            <td>${contract.signedbyclient}</td>
            <td>${contract.signedbycompany}</td>
            <td>${contract.status}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Render contract status chart
function renderStatusChart() {
    // Count contracts by status
    const statusCounts = contractsData.reduce((acc, contract) => {
        acc[contract.status] = (acc[contract.status] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    
    // Define colors based on status
    const backgroundColors = labels.map(status => {
        switch(status.toLowerCase()) {
            case 'active': return 'rgba(75, 192, 192, 0.6)';
            case 'pending': return 'rgba(255, 206, 86, 0.6)';
            case 'completed': return 'rgba(54, 162, 235, 0.6)';
            case 'cancelled': return 'rgba(255, 99, 132, 0.6)';
            default: return 'rgba(153, 102, 255, 0.6)';
        }
    });

    const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

    const ctx = statusChartCanvas.getContext("2d");

    // Destroy previous chart if it exists
    if (statusChart) {
        statusChart.destroy();
    }

    statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#eaeaea',
                        font: {
                            family: "'Roboto', sans-serif"
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Contract Status Distribution',
                    color: '#4a90e2',
                    font: {
                        family: "'Orbitron', sans-serif",
                        size: 16
                    }
                }
            }
        }
    });
}

// Toggle chart visibility
function toggleChart() {
    if (statusChartCanvas.style.display === "none") {
        statusChartCanvas.style.display = "block";
        toggleStatusChartBtn.textContent = "Hide Status Chart";
        renderStatusChart();
    } else {
        statusChartCanvas.style.display = "none";
        toggleStatusChartBtn.textContent = "Show Status Chart";
    }
}

// Fetch all contracts
async function fetchContracts() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        contractsData = data;
        renderTable();
        showStatus("Contracts loaded successfully", true);
    } catch (error) {
        console.error("Error fetching contracts:", error);
        showStatus("Failed to load contracts", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const contractData = {
        clientid: parseInt(document.getElementById("clientid").value.trim()),
        contractname: document.getElementById("contractname").value.trim(),
        startdate: document.getElementById("startdate").value.trim(),
        enddate: document.getElementById("enddate").value.trim(),
        contractvalue: parseFloat(document.getElementById("contractvalue").value.trim()),
        paymentschedule: document.getElementById("paymentschedule").value.trim(),
        termsandconditions: document.getElementById("termsandconditions").value.trim(),
        signeddate: document.getElementById("signeddate").value.trim(),
        signedbyclient: document.getElementById("signedbyclient").value.trim(),
        signedbycompany: document.getElementById("signedbycompany").value.trim(),
        status: document.getElementById("status").value.trim()
    };

    // Validate required fields
    if (isNaN(contractData.clientid)) {
        showStatus("Please enter a valid Client ID", false);
        return;
    }
    if (!contractData.contractname) {
        showStatus("Please enter a Contract Name", false);
        return;
    }
    if (!contractData.startdate || !contractData.enddate || !contractData.signeddate) {
        showStatus("Please fill in all date fields", false);
        return;
    }
    if (isNaN(contractData.contractvalue)) {
        showStatus("Please enter a valid Contract Value", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contractData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add contract");
        }

        const addedContract = await response.json();
        contractsData.push(addedContract);
        renderTable();
        
        // Update chart if it's visible
        if (statusChartCanvas.style.display !== "none") {
            renderStatusChart();
        }
        
        modal.style.display = "none";
        showStatus("Contract added successfully", true);
    } catch (error) {
        console.error("Error adding contract:", error);
        showStatus(`Failed to add contract: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Contract";
    contractForm.reset();
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

toggleStatusChartBtn.addEventListener("click", toggleChart);

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

contractForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchContracts);