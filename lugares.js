let MASTER = localStorage.getItem('lug_master') || "Black";
let BRAND = localStorage.getItem('lug_brand') || "LUGARES";

function initApp() {
    applyBrand();
    showSection('staff');
    setTheme(localStorage.getItem('lug_theme') || 'default');
    logSecurity("SYSTEM REBOOT: worker.0 Initialized");
}

function logSecurity(action) {
    let logs = JSON.parse(localStorage.getItem('lug_security_logs')) || [];
    logs.unshift(`[${new Date().toLocaleString()}] ${action}`);
    localStorage.setItem('lug_security_logs', JSON.stringify(logs.slice(0, 100)));
}

function applyBrand() {
    document.getElementById('displayBrand').innerText = BRAND;
    document.getElementById('siteTitle').innerText = BRAND + " | Portal";
}

function showSection(id) {
    document.querySelectorAll('.content-window').forEach(w => w.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('win-' + id).style.display = 'block';
    document.getElementById('btn-' + id).classList.add('active');
    render();
}

function unlockFin() {
    if (document.getElementById('finPass').value === MASTER) {
        document.getElementById('fin-lock').style.display = 'none';
        document.getElementById('fin-content').style.display = 'block';
        logSecurity("ACCESS GRANTED: Bank Ledger Viewed");
        render();
    } else {
        logSecurity("FAILED ACCESS: Unauthorized Ledger Attempt");
        alert("Unauthorized.");
    }
}

function savePersonnel() {
    const n = document.getElementById('regN').value;
    const r = document.getElementById('regR').value;
    if (document.getElementById('regP').value !== MASTER) return alert("Wrong Password");
    const key = r.toLowerCase().includes('executive') ? 'lug_execs' : 'lug_staff_v2';
    let list = JSON.parse(localStorage.getItem(key)) || [];
    list.push({ name: n, role: r, lastActive: new Date().toLocaleString() });
    localStorage.setItem(key, JSON.stringify(list));
    logSecurity(`REGISTERED: ${n} (${r})`);
    render();
}

function deleteEntry(key, index) {
    if (prompt("Enter Master Password to delete:") === MASTER) {
        let list = JSON.parse(localStorage.getItem(key)) || [];
        logSecurity(`DELETED: ${list[index].name}`);
        list.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(list));
        render();
    }
}

function changePass() {
    if (document.getElementById('oldP').value === MASTER) {
        MASTER = document.getElementById('newP').value;
        localStorage.setItem('lug_master', MASTER);
        logSecurity("CRITICAL: Master Password Changed");
        alert("Success.");
        closeSettings();
    } else {
        alert("Failed.");
    }
}

function clearAuditLogs() {
    if (prompt("Master Password required to wipe audit trail:") === MASTER) {
        localStorage.setItem('lug_security_logs', JSON.stringify([]));
        logSecurity("AUDIT TRAIL WIPED BY ADMIN");
        render();
    }
}

function setTheme(t) {
    document.body.classList.remove('theme-gold', 'theme-light');
    if (t !== 'default') document.body.classList.add('theme-' + t);
    localStorage.setItem('lug_theme', t);
}

function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }

function renderLogs() {
    const logs = JSON.parse(localStorage.getItem('lug_security_logs')) || [];
    const query = document.getElementById('logSearch').value.toLowerCase();
    document.getElementById('auditLogList').innerHTML = logs
        .filter(l => l.toLowerCase().includes(query))
        .map(l => `<div class="log-entry">${l}</div>`).join('');
}

function render() {
    const staff = JSON.parse(localStorage.getItem('lug_staff_v2')) || [];
    document.getElementById('staffList').innerHTML = staff.map((s, i) => `<div class="data-card"><b>${s.name}</b><br>${s.role}<span class="status-tag">Last Active: ${s.lastActive}</span><div class="del-btn" onclick="deleteEntry('lug_staff_v2', ${i})">REMOVE</div></div>`).join('');
    const execs = JSON.parse(localStorage.getItem('lug_execs')) || [];
    document.getElementById('execList').innerHTML = execs.map((e, i) => `<div class="data-card" style="border-left-color:var(--gold)"><b>${e.name}</b><br>${e.role}<span class="status-tag">Board Activity: ${e.lastActive}</span><div class="del-btn" onclick="deleteEntry('lug_execs', ${i})">REMOVE</div></div>`).join('');
    const reqs = JSON.parse(localStorage.getItem('lug_requests')) || [];
    document.getElementById('reqList').innerHTML = reqs.map(r => `<div class="data-card"><b>${r.name}</b>: ${r.msg}</div>`).reverse().join('');
    renderLogs();
}
