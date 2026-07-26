/* ---------------------------------------------------------
   API HELPERS
--------------------------------------------------------- */
const API = {
    get: async (url) => {
        const res = await fetch(url);
        return res.json().catch(() => ({ success: false, error: "Invalid JSON" }));
    },
    post: async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return res.json().catch(() => ({ success: false, error: "Invalid JSON" }));
    },
    put: async (url, data) => {
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return res.json().catch(() => ({ success: false, error: "Invalid JSON" }));
    },
    delete: async (url) => {
        const res = await fetch(url, { method: "DELETE" });
        return res.json().catch(() => ({ success: false, error: "Invalid JSON" }));
    }
};

/* ---------------------------------------------------------
   DOM ELEMENTS
--------------------------------------------------------- */
const plannerForm = document.getElementById("plannerForm");
const loading = document.getElementById("loading");
const success = document.getElementById("success");
const error = document.getElementById("error");

const screens = document.querySelectorAll(".app-screen");
const navItems = document.querySelectorAll(".nav-item");
const sidebarItems = document.querySelectorAll(".sidebar-item");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

const headerBell = document.querySelector(".header-bell");
const headerProfile = document.querySelector(".header-profile");
const searchInput = document.getElementById("searchInput");

/* ---------------------------------------------------------
   SCREEN SWITCHER
--------------------------------------------------------- */
function switchScreen(name) {
    screens.forEach(s => s.classList.remove("active-screen"));
    const screen = document.getElementById("screen-" + name);
    if (screen) screen.classList.add("active-screen");
}

/* ---------------------------------------------------------
   SEND EMAIL FUNCTION
--------------------------------------------------------- */
async function sendEmail(parent_email, title, notes) {
    try {
        const response = await fetch("https://smart-kids-planner.onrender.com/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                parent_email,
                title,
                notes
            })
        });

        const data = await response.json();
        console.log("Email response:", data);

        if (data.success) {
            alert("Email sent successfully!");
        } else {
            alert("Email failed to send.");
        }

    } catch (error) {
        console.error("Frontend error:", error);
        alert("Something went wrong.");
    }
}

/* ---------------------------------------------------------
   FORM SUBMISSION (TASKS)
--------------------------------------------------------- */
plannerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        child_id: document.getElementById("child_id").value,
        parent_email: document.getElementById("parent_email").value,
        date: document.getElementById("date").value,
        category: document.getElementById("category").value,
        title: document.getElementById("title").value,
        time: document.getElementById("time").value,
        notes: document.getElementById("notes").value
    };

    if (!data.child_id) return alert("Please select a child.");

    showMessage("loading");

    const result = await API.post("https://smart-kids-planner.onrender.com/api/tasks", data);

    if (result.success) {
        sendEmail(data.parent_email, data.title, data.notes);
    }
});

/* ---------------------------------------------------------
   MESSAGE HANDLER
--------------------------------------------------------- */
function showMessage(type) {
    loading.style.display = type === "loading" ? "block" : "none";
    success.style.display = type === "success" ? "block" : "none";
    error.style.display = type === "error" ? "block" : "none";
}

/* ---------------------------------------------------------
   LOAD TASKS
--------------------------------------------------------- */
async function loadTasks() {
    const containers = {
        study: document.getElementById("studyTasks"),
        meals: document.getElementById("mealsTasks"),
        sleep: document.getElementById("sleepTasks"),
        activities: document.getElementById("activitiesTasks"),
        tasks: document.getElementById("tasksTasks")
    };

    Object.values(containers).forEach(div => (div.innerHTML = ""));

    const tasks = await API.get("https://smart-kids-planner.onrender.com/api/tasks");

    if (!tasks || !Array.isArray(tasks)) return;

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.dataset.category = task.category;

        card.innerHTML = `
            <div class="task-title">📘 ${task.title}</div>
            <div class="task-time">⏰ ${task.time}</div>
            <div class="task-notes">📝 ${task.notes}</div>

            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${task.id})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️ Delete</button>
            </div>
        `;

        containers[task.category].appendChild(card);
    });

    searchInput.dispatchEvent(new Event("input"));
}

/* ---------------------------------------------------------
   DELETE TASK
--------------------------------------------------------- */
async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    const result = await API.delete(`https://smart-kids-planner.onrender.com/api/tasks/${id}`);
    if (result.success) loadTasks();
}

/* ---------------------------------------------------------
   EDIT TASK
--------------------------------------------------------- */
async function editTask(id) {
    const newTitle = prompt("New Title:");
    const newTime = prompt("New Time (HH:MM):");
    const newNotes = prompt("New Notes:");

    if (!newTitle || !newTime || !newNotes) {
        return alert("All fields required.");
    }

    const result = await API.put(`https://smart-kids-planner.onrender.com/api/tasks/${id}`, {
        title: newTitle,
        time: newTime,
        notes: newNotes
    });

    if (result.success) loadTasks();
}

/* ---------------------------------------------------------
   LOAD CHILDREN
--------------------------------------------------------- */
async function loadChildren() {
    const list = document.getElementById("childrenList");
    list.innerHTML = "";

    const children = await API.get("https://smart-kids-planner.onrender.com/api/children");

    if (!children.data || children.data.length === 0) {
        list.innerHTML = "<p>No children found.</p>";
        return;
    }

    children.data.forEach(child => {
        const card = document.createElement("div");
        card.className = "child-card";

        card.innerHTML = `
            <h4>${child.child_name} (${child.child_age})</h4>
            <div class="child-actions">
                <button class="child-btn" onclick="viewChildTasks(${child.id})">View Tasks</button>
                <button class="child-btn" onclick="deleteChild(${child.id})">Delete</button>
            </div>
        `;

        list.appendChild(card);
    });

    searchInput.dispatchEvent(new Event("input"));
}

/* ---------------------------------------------------------
   DELETE CHILD
--------------------------------------------------------- */
async function deleteChild(id) {
    if (!confirm("Delete this child?")) return;

    const result = await API.delete(`https://smart-kids-planner.onrender.com/api/children/${id}`);
    if (result.success) loadChildren();
}

/* ---------------------------------------------------------
   VIEW CHILD TASKS
--------------------------------------------------------- */
async function viewChildTasks(id) {
    const tasks = await API.get(`https://smart-kids-planner.onrender.com/api/children/${id}/tasks`);
    alert(`Tasks for child #${id}:\n\n${tasks.map(t => `${t.title} - ${t.time}`).join("\n")}`);
}

/* ---------------------------------------------------------
   LOAD CHILD DROPDOWN
--------------------------------------------------------- */
async function loadChildDropdown() {
    const dropdown = document.getElementById("child_id");
    dropdown.innerHTML = "";

    const children = await API.get("https://smart-kids-planner.onrender.com/api/children");

    if (!children.data || children.data.length === 0) {
        dropdown.innerHTML = `<option value="">No children found</option>`;
        return;
    }

    children.data.forEach(child => {
        const option = document.createElement("option");
        option.value = child.id;
        option.textContent = `${child.child_name} (${child.child_age})`;
        dropdown.appendChild(option);
    });
}

/* ---------------------------------------------------------
   ADD CHILD
--------------------------------------------------------- */
async function addChild(e) {
    e.preventDefault();

    const child_name = document.getElementById("child_name").value;
    const child_age = document.getElementById("child_age").value;
    const parent_email = document.getElementById("child_parent_email").value;

    if (!child_name || !child_age || !parent_email) {
        alert("Please fill all required fields.");
        return;
    }

    const result = await API.post("https://smart-kids-planner.onrender.com/api/children", {
        child_name,
        child_age,
        parent_email
    });

    if (result.success) {
        alert("Child added successfully!");
        loadChildren();
        loadChildDropdown();
        document.getElementById("childrenForm").reset();
    } else {
        alert("Failed to add child.");
    }
}

/* ---------------------------------------------------------
   SEARCH BAR
--------------------------------------------------------- */
searchInput.addEventListener("input", () => {
    const text = searchInput.value.toLowerCase();

    sidebarItems.forEach(item => {
        item.style.background = item.innerText.toLowerCase().includes(text)
            ? "#ffe3f4"
            : "transparent";
    });

    document.querySelectorAll(".app-card").forEach(card => {
        const label = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = label.includes(text) ? "block" : "none";
    });

    document.querySelectorAll(".task-card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(text)
            ? "block"
            : "none";
    });

    document.querySelectorAll(".child-card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(text)
            ? "block"
            : "none";
    });
});

/* ---------------------------------------------------------
   CATEGORY FILTER
--------------------------------------------------------- */
function filterTasksByCategory(category) {
    document.querySelectorAll(".task-card").forEach(card => {
        const cardCategory = card.dataset.category;
        card.style.display = (cardCategory === category) ? "block" : "none";
    });
}

/* ---------------------------------------------------------
   DOM READY
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {

    loadChildDropdown();
    loadChildren();
    loadTasks();

    document.getElementById("childrenForm").addEventListener("submit", addChild);

    /* Bottom Navigation */
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            switchScreen(item.dataset.screen);

            if (item.dataset.screen === "planner") loadTasks();
        });
    });

    /* Sidebar Toggle */
    sidebarToggle.addEventListener("click", () => {
        sidebar.style.left = sidebar.style.left === "0px" ? "-260px" : "0px";
    });

    /* Sidebar Navigation */
    sidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            sidebar.style.left = "-260px";

            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const screen = item.dataset.screen;
            switchScreen(screen);

            const bottomItem = document.querySelector(`.nav-item[data-screen="${screen}"]`);
            if (bottomItem) bottomItem.classList.add("active");

            if (screen === "planner") loadTasks();
        });
    });

    /* Header Buttons */
    headerBell.addEventListener("click", () => switchScreen("notifications"));
    headerProfile.addEventListener("click", () => switchScreen("account"));

    /* TOP CARDS → PLANNER */
    document.querySelectorAll(".app-card").forEach(card => {
        card.addEventListener("click", () => {
            const category = card.dataset.category;

            switchScreen("planner");

            document.querySelectorAll(".planner-card").forEach(box => {
                box.classList.remove("highlight");
            });

            const targetBox = document.querySelector(`#${category}Tasks`).parentElement;
            if (targetBox) targetBox.classList.add("highlight");

            filterTasksByCategory(category);
        });
    });

});
