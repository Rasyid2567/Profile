// =====================
// KONFIGURASI
// =====================

const STORAGE_KEY = "biodataData";
let rowToDelete = null;

// =====================
// SAVE DATA (JSON)
// =====================

function saveData() {
    const data = {
        name: document.getElementById("table-name").innerText,
        role: document.getElementById("table-role").innerText,
        theme: document.body.classList.contains("dark-mode") ? "dark" : "light",
        photo: document.getElementById("profileImage").src,
        tables: {}
    };
    
    const tableIds = [
        "table-profil",
        "table-pendidikan",
        "table-keahlian",
        "table-kontak"
    ];
    
    tableIds.forEach(id => {
        const rows = [];
        document.querySelectorAll(`#${id} tr`).forEach(row => {
            const label = row.querySelector(".label");
            const value = row.querySelector(".value");
            
            if (label && value) {
                rows.push({
                    label: label.innerText,
                    value: value.innerText
                });
            }
        });
        data.tables[id] = rows;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// =====================
// LOAD DATA
// =====================

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    
    const data = JSON.parse(saved);
    
    document.getElementById("table-name").innerText = data.name || "";
    document.getElementById("table-role").innerText = data.role || "";
    
    if (data.photo) {
        document.getElementById("profileImage").src = data.photo;
    }
    
    if (data.theme === "light") {
        document.body.classList.remove("dark-mode");
        document.querySelector(".theme-btn").innerText = "🌙 Gelap";
    } else {
        document.body.classList.add("dark-mode");
        document.querySelector(".theme-btn").innerText = "☀️ Terang";
    }
    
    if (data.tables) {
        Object.keys(data.tables).forEach(id => {
            const table = document.getElementById(id);
            table.innerHTML = "";
            
            data.tables[id].forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="label" contenteditable="true">${item.label}</td>
                    <td>:</td>
                    <td class="value" contenteditable="true">${item.value}</td>
                    <td><button class="del-btn" onclick="removeRow(this)">✕</button></td>
                `;
                table.appendChild(row);
            });
        });
    }
}

// =====================
// FOTO PROFIL
// =====================

function changePhoto() {
    document.getElementById("photoInput").click();
}

function previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function() {
        document.getElementById("profileImage").src = reader.result;
        saveData();
    };
    
    reader.readAsDataURL(file);
}

// =====================
// TAMBAH & HAPUS ROW
// =====================

function addRow(tableId) {
    const table = document.getElementById(tableId);
    const row = document.createElement("tr");
    
    row.innerHTML = `
        <td class="label" contenteditable="true"></td>
        <td>:</td>
        <td class="value" contenteditable="true"></td>
        <td><button class="del-btn" onclick="removeRow(this)">✕</button></td>
    `;
    
    table.appendChild(row);
    saveData();
}

function removeRow(btn) {
    rowToDelete = btn.closest("tr");
    document.getElementById("deleteModal").classList.add("show");
}

function confirmDelete() {
    if (rowToDelete) {
        rowToDelete.remove();
        saveData();
        rowToDelete = null;
    }
    closeModal();
}

function closeModal() {
    document.getElementById("deleteModal").classList.remove("show");
}

// =====================
// TAB NAVIGATION
// =====================

function openTab(evt, tabName) {
    const tabContent = document.getElementsByClassName("tab-content");
    const navItems = document.getElementsByClassName("nav-item");
    
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("active");
    }
    
    for (let i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove("active");
    }
    
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// =====================
// TOGGLE THEME
// =====================

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const btn = document.querySelector(".theme-btn");
    btn.innerText = document.body.classList.contains("dark-mode") ?
        "☀️ Terang" :
        "🌙 Gelap";
    
    saveData();
}

// =====================
// PRINT SUPPORT
// =====================

window.onbeforeprint = () => {
    document.getElementById("print-nama-val").innerText =
        document.getElementById("table-name").innerText;
    
    document.getElementById("print-status-val").innerText =
        document.getElementById("table-role").innerText;
    
    const exportData = (tableId, targetId) => {
        const rows = document.querySelectorAll(`#${tableId} tr`);
        const container = document.getElementById(targetId);
        container.innerHTML = "";
        
        rows.forEach(row => {
            const label = row.querySelector(".label")?.innerText || "";
            const value = row.querySelector(".value")?.innerText || "";
            
            if (label || value) {
                const div = document.createElement("div");
                div.className = "print-row";
                div.innerHTML = `
                    <span class="print-label">${label}</span>
                    <span class="print-separator">:</span>
                    <span class="print-value">${value}</span>
                `;
                container.appendChild(div);
            }
        });
    };
    
    exportData("table-profil", "print-profil-list");
    exportData("table-pendidikan", "print-pendidikan-list");
    exportData("table-keahlian", "print-keahlian-list");
    exportData("table-kontak", "print-kontak-list");
};

// =====================
// AUTO SAVE
// =====================

document.addEventListener("input", function() {
    saveData();
});

// =====================
// INIT
// =====================

document.addEventListener("DOMContentLoaded", function() {
    loadData();
});

function lihatJSON() {
    const data = localStorage.getItem("biodataData");
    console.log(JSON.parse(data));
}