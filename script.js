let rowToDelete = null;
const STORAGE_KEY = 'biodataProData';
const WELCOME_KEY = 'biodataProWelcomeShown';

// =====================
// FUNGSI PRINT
// =====================
window.onbeforeprint = () => {


    // 2. Ekspor Nama dan Role/Status ke tampilan Print
    // Kita ambil dari ID editor (table-name dan table-role)
    const currentName = document.getElementById('table-name').innerText;
    const currentRole = document.getElementById('table-role').innerText;

    // Masukkan ke dalam elemen visual print
    document.getElementById('print-nama-val').innerText = currentName;
    document.getElementById('print-status-val').innerText = currentRole;

    // 3. Fungsi untuk mengambil baris tabel lainnya
    const exportAllData = (tableId, targetPrintId) => {
        const tableRows = document.querySelectorAll(`#${tableId} tr`);
        const printContainer = document.getElementById(targetPrintId);

        printContainer.innerHTML = '';

        tableRows.forEach(row => {
            const label = row.querySelector('.label') ? row.querySelector('.label').innerText : '';
            const value = row.querySelector('.value') ? row.querySelector('.value').innerText : '';

            if (label || value) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'print-row';
                itemDiv.innerHTML = `
                    <span class="print-label">${label}</span>
                    <span class="print-separator">:</span>
                    <span class="print-value">${value}</span>
                `;
                printContainer.appendChild(itemDiv);
            }
        });
    };

    // 4. Eksekusi untuk tabel (Profil di-skip karena Nama & Status sudah di atas)
    // Jika Anda ingin data lain di tabel profil tetap muncul, jalankan ini:
    exportAllData('table-profil', 'print-profil-list');
    exportAllData('table-pendidikan', 'print-pendidikan-list');
    exportAllData('table-keahlian', 'print-keahlian-list');
    exportAllData('table-kontak', 'print-kontak-list');
};

// =====================
// FUNGSI WELCOME POPUP
// =====================

function showWelcome() {
    // Cek apakah sudah pernah ditampilkan
    if (!sessionStorage.getItem(WELCOME_KEY)) {
        document.getElementById('welcomeModal').classList.add('show');
    }
}

function closeWelcome() {
    document.getElementById('welcomeModal').classList.remove('show');
    sessionStorage.setItem(WELCOME_KEY, 'true');
}

// =====================
// FUNGSI LOCAL STORAGE
// =====================

function saveToLocalStorage() {
    const data = {
        name: document.getElementById('table-name').innerText,
        role: document.getElementById('table-role').innerText,
        theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
        tables: {}
    };

    const tableIds = ['table-profil', 'table-pendidikan', 'table-keahlian', 'table-kontak'];
    tableIds.forEach(tableId => {
        const table = document.getElementById(tableId);
        const rows = [];
        table.querySelectorAll('tr').forEach(row => {
            const label = row.querySelector('.label');
            const value = row.querySelector('.value');
            if (label && value) {
                rows.push({
                    label: label.innerText,
                    value: value.innerText
                });
            }
        });
        data.tables[tableId] = rows;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showSaveIndicator();
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        if (data.name) document.getElementById('table-name').innerText = data.name;
        if (data.role) document.getElementById('table-role').innerText = data.role;

        if (data.theme === 'light') {
            document.body.classList.remove('dark-mode');
            document.querySelector('.theme-btn').innerText = "🌙 Gelap";
        } else {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-btn').innerText = "☀️ Terang";
        }

        if (data.tables) {
            Object.keys(data.tables).forEach(tableId => {
                const table = document.getElementById(tableId);
                if (table && data.tables[tableId].length > 0) {
                    table.innerHTML = '';
                    data.tables[tableId].forEach(rowData => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                                    <td class="label" contenteditable="true">${rowData.label}</td>
                                    <td class="label" contenteditable="false">:</td>

                                    <td class="value" contenteditable="true">${rowData.value}</td>
                                    <button class="del-btn" onclick="removeRow(this)">✕</button>
                                `;
                        table.appendChild(row);
                        addAutoSaveListeners(row);
                    });
                }
            });
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

function showSaveIndicator() {
    let indicator = document.getElementById('saveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 13px;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
                    z-index: 9999;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                `;
        document.body.appendChild(indicator);
    }
    indicator.innerText = '✓ Tersimpan';
    indicator.style.opacity = '1';
    indicator.style.transform = 'translateY(0)';

    setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(20px)';
    }, 1500);
}

function addAutoSaveListeners(element) {
    const editables = element.querySelectorAll('[contenteditable="true"]');
    const debouncedSave = debounce(saveToLocalStorage, 1000);
    editables.forEach(el => {
        el.addEventListener('blur', saveToLocalStorage);
        el.addEventListener('input', () => {
            if (el.innerText.trim() === '') {
                el.innerHTML = '';
            }
            debouncedSave();
        });
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =====================
// FUNGSI UTAMA
// =====================

function addRow(tableId) {
    const table = document.getElementById(tableId);
    const row = document.createElement('tr');

    row.innerHTML = `
                <td class="label" contenteditable="true"></td>
                <td class="label" contenteditable="false">:</td>
                <td class="value" contenteditable="true"></td>
                <button class="del-btn" onclick="removeRow(this)">✕</button>
            `;

    table.appendChild(row);
    addAutoSaveListeners(row);
    saveToLocalStorage();
}

function removeRow(btn) {
    rowToDelete = btn.parentElement;
    document.getElementById('deleteModal').classList.add('show');
}

function closeModal() {
    document.getElementById('deleteModal').classList.remove('show');
    rowToDelete = null;
}

function confirmDelete() {
    if (rowToDelete) {
        rowToDelete.remove();
        rowToDelete = null;
        saveToLocalStorage();
    }
    closeModal();
}

document.getElementById('deleteModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

function openTab(evt, tabName) {
    let i, tabContent, navItems;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) tabContent[i].classList.remove("active");

    navItems = document.getElementsByClassName("nav-item");
    for (i = 0; i < navItems.length; i++) navItems[i].classList.remove("active");

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const btn = document.querySelector('.theme-btn');
    btn.innerText = document.body.classList.contains('dark-mode') ? "☀️ Terang" : "🌙 Gelap";
    saveToLocalStorage();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.getAttribute('contenteditable')) {
        e.preventDefault();
        e.target.blur();
    }
    if (e.key === 'Escape') {
        closeModal();
        closeWelcome();
    }
});

// =====================
// INISIALISASI
// =====================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        const debouncedSave = debounce(saveToLocalStorage, 1000);
        el.addEventListener('blur', saveToLocalStorage);
        el.addEventListener('input', () => {
            if (el.innerText.trim() === '') {
                el.innerHTML = '';
            }
            debouncedSave();
        });
    });

    // Tampilkan popup selamat datang
    setTimeout(showWelcome, 300);
});