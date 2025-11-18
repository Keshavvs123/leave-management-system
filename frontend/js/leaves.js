const API_URL = "http://localhost:5000/api";

// Util: Remove duplicate leave type names
function getUniqueTypes(types) {
  const seenNames = new Set();
  const unique = [];
  for (const type of types) {
    const name = type.lvtype_name.trim().toLowerCase();
    if (!seenNames.has(name)) {
      unique.push(type);
      seenNames.add(name);
    }
  }
  return unique;
}

async function loadLeaveTypes() {
  const response = await fetch(`${API_URL}/leaves/types`);
  let types = await response.json();
  types = getUniqueTypes(types);
  const select = document.getElementById("lvtype_id");
  select.innerHTML = `<option value="">Select Leave Type</option>`;
  types.forEach(type => {
    select.innerHTML += `<option value="${type.lvtype_id}">${type.lvtype_name}</option>`;
  });
}

// Day calculation
const startInput = document.getElementById("start_date");
const endInput = document.getElementById("end_date");
const daysInput = document.getElementById("lv_days");
function updateLeaveDays() {
  const start = new Date(startInput.value);
  const end = new Date(endInput.value);
  if (startInput.value && endInput.value && end >= start) {
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    daysInput.value = days;
  } else {
    daysInput.value = "";
  }
}
startInput.addEventListener("change", updateLeaveDays);
endInput.addEventListener("change", updateLeaveDays);

// Messages
function showMsg(type, msg) {
  document.getElementById(type).style.display = "block";
  document.getElementById(type).textContent = msg;
  setTimeout(() => {
    document.getElementById(type).style.display = "none";
  }, 4000);
}

// Auth helpers (adapt to your system if needed)
function getToken() {
  return localStorage.getItem("token");
}
function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

document.getElementById("applyLeaveForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const lvtype_id = document.getElementById("lvtype_id").value;
  const start_date = document.getElementById("start_date").value;
  const end_date = document.getElementById("end_date").value;
  const lv_days = document.getElementById("lv_days").value;
  const lv_desc = document.getElementById("lv_desc").value;

  const user = getUser();
  const token = getToken();

  if (!lvtype_id || !start_date || !end_date || !lv_days) {
    showMsg("error", "Please fill all required fields & select valid dates.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        emp_id: user.empId, lvtype_id, lv_desc, lv_days, start_date, end_date
      }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      showMsg("success", "Leave applied successfully!");
      document.getElementById("applyLeaveForm").reset();
      daysInput.value = "";
    } else {
      showMsg("error", data.message || "Failed to apply for leave");
    }
  } catch (err) {
    showMsg("error", "Backend error: " + err.message);
  }
});

loadLeaveTypes();
