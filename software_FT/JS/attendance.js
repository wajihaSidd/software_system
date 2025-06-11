// API endpoints
const post_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/attendances"; // POST new attendance
const get_URL = "https://ideal-umbrella-r4rx4gxq7jq5c5gxq-6060.app.github.dev/attendance"; // GET all attendance records

// DOM elements
const tbody = document.querySelector("#attendanceTable tbody");
const attendanceForm = document.getElementById("attendanceForm");
const modal = document.getElementById("attendanceModal");
const insertBtn = document.getElementById("insertAttendanceBtn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelFormBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

let attendanceData = [];

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

// Render attendance table
function renderTable() {
    tbody.innerHTML = "";

    if (attendanceData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No attendance records found</td></tr>`;
        return;
    }

    attendanceData.forEach((attendance) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${attendance.attendanceid}</td>
            <td>${attendance.employeeid}</td>
            <td>${formatDate(attendance.date)}</td>
            <td>${attendance.checkin || 'N/A'}</td>
            <td>${attendance.checkout || 'N/A'}</td>
            <td>${attendance.status}</td>
            <td>${attendance.leavetype || 'N/A'}</td>
            <td>${attendance.hoursworked}</td>
            <td>${attendance.notes?.substring(0, 30) || 'N/A'}${attendance.notes?.length > 30 ? '...' : ''}</td>
            <td>${attendance.approvedby}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fetch all attendance records
async function fetchAttendance() {
    showLoading();
    try {
        const response = await fetch(get_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        attendanceData = data;
        renderTable();
        showStatus("Attendance records loaded successfully", true);
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        showStatus("Failed to load attendance records", false);
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const attendanceData = {
        employeeid: parseInt(document.getElementById("employeeid").value.trim()),
        date: document.getElementById("date").value.trim(),
        checkin: document.getElementById("checkin").value.trim(),
        checkout: document.getElementById("checkout").value.trim(),
        status: document.getElementById("status").value.trim(),
        leavetype: document.getElementById("leavetype").value.trim(),
        hoursworked: parseFloat(document.getElementById("hoursworked").value.trim()),
        notes: document.getElementById("notes").value.trim(),
        approvedby: parseInt(document.getElementById("approvedby").value.trim())
    };

    // Validate required fields
    if (isNaN(attendanceData.employeeid)) {
        showStatus("Please enter a valid Employee ID", false);
        return;
    }
    if (!attendanceData.date) {
        showStatus("Please select a date", false);
        return;
    }
    if (!attendanceData.status) {
        showStatus("Please select a status", false);
        return;
    }
    if (isNaN(attendanceData.hoursworked)) {
        showStatus("Please enter valid hours worked", false);
        return;
    }
    if (isNaN(attendanceData.approvedby)) {
        showStatus("Please enter a valid Approver ID", false);
        return;
    }

    try {
        showLoading();
        const response = await fetch(post_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendanceData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add attendance record");
        }

        const addedAttendance = await response.json();
        attendanceData.push(addedAttendance);
        renderTable();
        modal.style.display = "none";
        showStatus("Attendance record added successfully", true);
    } catch (error) {
        console.error("Error adding attendance record:", error);
        showStatus(`Failed to add attendance record: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Event listeners
insertBtn.addEventListener("click", () => {
    document.querySelector(".modal-title").textContent = "Insert Attendance";
    attendanceForm.reset();
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

attendanceForm.addEventListener("submit", handleFormSubmit);

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchAttendance);