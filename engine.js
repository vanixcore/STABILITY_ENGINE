let habitNodes = JSON.parse(localStorage.getItem('savedNodes')) || [];

document.addEventListener('DOMContentLoaded', () => {

    const savedAlias = localStorage.getItem('userAlias');
    const aliasInput = document.getElementById('alias-input');
    if (savedAlias && aliasInput) {
        aliasInput.value = savedAlias;
    }

    const lastTime = localStorage.getItem('lastSync') || 'NEVER';
    const syncDisplay = document.getElementById('sync-clock');
    if (syncDisplay) syncDisplay.innerText = lastTime;

    if (aliasInput) {
        aliasInput.addEventListener('change', () => {
            localStorage.setItem('userAlias', aliasInput.value);
            postLog(`IDENTITY_UPDATED: Welcome, ${aliasInput.value || 'ARCHITECT'}.`);
        });
    }

    renderNodes();
    postLog("SYSTEM_READY: Awaiting user protocol...");
});

function postLog(message) {
    const logElement = document.getElementById('log-text');
    if (logElement) {
        logElement.innerText = message;
    }
}

function updateSyncTime() {
    const now = new Date();
    const timestamp = now.getHours().toString().padStart(2, '0') + ":" + 
                      now.getMinutes().toString().padStart(2, '0') + ":" + 
                      now.getSeconds().toString().padStart(2, '0');
    
    const syncDisplay = document.getElementById('sync-clock');
    if (syncDisplay) syncDisplay.innerText = timestamp;
    localStorage.setItem('lastSync', timestamp);
}

function addHabit() {
    const input = document.getElementById('habit-name');
    const name = input.value.trim();

    if (name) {
        const newNode = {
            id: Date.now(),
            name: name,
            completed: false
        };

        habitNodes.push(newNode);
        input.value = ''; 
        
        postLog(`INITIALIZED: Node "${name}" registered in local memory.`);
        saveToVault();
        renderNodes();
    } else {
        postLog("ERROR: Protocol name required for initialization.");
    }
}

function toggleNode(id) {
    const node = habitNodes.find(n => n.id === id);
    if (node) {
        node.completed = !node.completed;
        
        if (node.completed) {
            postLog(`SYNC_COMPLETE: Protocol "${node.name}" is now online.`);
            updateSyncTime();
        } else {
            postLog(`WARNING: Protocol "${node.name}" disconnected.`);
        }
        
        saveToVault();
        renderNodes();
    }
}

function saveToVault() {
    localStorage.setItem('savedNodes', JSON.stringify(habitNodes));
}

function renderNodes() {
    const list = document.getElementById('habit-list');
    if (!list) return;
    
    list.innerHTML = '';

    habitNodes.forEach(node => {
        const li = document.createElement('li');
        li.className = node.completed ? "habit-item completed" : "habit-item";
        
        li.innerHTML = `
            <div class="node-container" onclick="toggleNode(${node.id})">
                <div class="node-content">
                    <span class="status-icon">${node.completed ? '●' : '○'}</span>
                    <span class="node-name">${node.name}</span>
                </div>
                </div>
        `;
        list.appendChild(li);
    });

    updateStability();
}

function updateStability() {
    const total = habitNodes.length;
    const completed = habitNodes.filter(n => n.completed).length;
    
    let healthRatio = total > 0 ? (completed / total) * 100 : 100;
    let finalVal = Math.floor(healthRatio);
    
    const valDisplay = document.getElementById('stability-val');
    const bar = document.getElementById('stability-bar');
    const wrapper = document.querySelector('.sandbox-wrapper');

    if (valDisplay) valDisplay.innerText = `${finalVal}%`;
    
    if (bar) {
        bar.style.width = `${finalVal}%`;
        
        if (finalVal === 100 && total > 0) {
            bar.classList.add('stability-full');
            postLog("CRITICAL_SUCCESS: System fully stabilized. All nodes online.");
            
            if (wrapper) {
                wrapper.classList.add('level-up-flash');
                setTimeout(() => wrapper.classList.remove('level-up-flash'), 500);
            }
        } else {
            bar.classList.remove('stability-full');
            
            if (finalVal < 50) {
                bar.style.background = "#ff5555";
                bar.style.boxShadow = "0 0 15px rgba(255, 85, 85, 0.6)";
            } else {
                bar.style.background = "linear-gradient(90deg, #5a189a, #9d4edd)";
                bar.style.boxShadow = "0 0 15px rgba(157, 78, 221, 0.4)";
            }
        }
    }
}

function systemReset() {
    if (confirm("CRITICAL_WARNING: This will reset the entire system. Proceed?")) {
        habitNodes = [];
        localStorage.clear(); 
        
        const syncDisplay = document.getElementById('sync-clock');
        if (syncDisplay) syncDisplay.innerText = 'NEVER';
        
        const aliasInput = document.getElementById('alias-input');
        if (aliasInput) aliasInput.value = '';
        
        postLog("SYSTEM_PURGE_COMPLETE: Environment reset to factory defaults.");
        renderNodes();
    }
}