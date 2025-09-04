document.addEventListener('DOMContentLoaded', function() {
    const roadmapList = document.getElementById('roadmap-list');
    const chatSection = document.getElementById('chat-section');
    const selectedRoadmapDiv = document.getElementById('selected-roadmap');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');

    let selectedRoadmap = null;
    let chatHistory = [];

    // Load saved roadmaps
    let saved = JSON.parse(localStorage.getItem('roadmaps') || '[]');
    if (saved.length === 0) {
        roadmapList.innerHTML = '<p>No saved roadmaps yet.</p>';
        return;
    }
    roadmapList.innerHTML = '<h2>Select a roadmap to chat about:</h2>';
    saved.forEach((item, idx) => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.marginBottom = '10px';
        wrapper.style.position = 'relative';

        const btn = document.createElement('button');
        btn.textContent = `${item.skill} (${item.level}) - ${new Date(item.date).toLocaleString()}`;
        btn.style.flex = '1';
        btn.onclick = () => selectRoadmap(idx);

        // 3-dots menu
        const menuBtn = document.createElement('button');
        menuBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28" style="display:block;"><circle cx="6" cy="14" r="2.5" fill="#bfa181"/><circle cx="14" cy="14" r="2.5" fill="#bfa181"/><circle cx="22" cy="14" r="2.5" fill="#bfa181"/></svg>';
        menuBtn.setAttribute('aria-label', 'Options');
        menuBtn.style.marginLeft = '10px';
        menuBtn.style.width = '40px';
        menuBtn.style.height = '40px';
        menuBtn.style.background = 'transparent';
        menuBtn.style.border = 'none';
        menuBtn.style.cursor = 'pointer';
        menuBtn.style.position = 'relative';
        menuBtn.style.zIndex = '11';

        // Popup menu
        const popup = document.createElement('div');
        popup.className = 'roadmap-popup-menu';
        popup.style.display = 'none';
        popup.style.position = 'absolute';
        popup.style.top = '40px';
        popup.style.right = '0';
        popup.style.background = '#232526';
        popup.style.border = '1.5px solid #bfa181';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 2px 8px #bfa18133';
        popup.style.zIndex = '100';
        popup.style.minWidth = '160px';
        popup.style.pointerEvents = 'auto';

        // Download option
        const downloadOpt = document.createElement('div');
        downloadOpt.textContent = 'Download as PDF';
        downloadOpt.style.padding = '12px 18px';
        downloadOpt.style.cursor = 'pointer';
        downloadOpt.style.color = '#bfa181';
        downloadOpt.onmouseover = () => downloadOpt.style.background = '#181818';
        downloadOpt.onmouseout = () => downloadOpt.style.background = 'transparent';
        downloadOpt.onclick = (e) => {
            e.stopPropagation();
            popup.style.display = 'none';
            showDownloadModal(item);
        };

    // ...existing code...

    // Download confirmation modal logic
    let downloadModal = document.getElementById('download-modal');
    if (!downloadModal) {
        downloadModal = document.createElement('div');
        downloadModal.id = 'download-modal';
        downloadModal.style.position = 'fixed';
        downloadModal.style.top = '0';
        downloadModal.style.left = '0';
        downloadModal.style.width = '100vw';
        downloadModal.style.height = '100vh';
        downloadModal.style.background = 'rgba(34,34,40,0.85)';
        downloadModal.style.display = 'none';
        downloadModal.style.alignItems = 'center';
        downloadModal.style.justifyContent = 'center';
        downloadModal.style.zIndex = '2000';
        downloadModal.innerHTML = `
            <div style="background:#181818;border-radius:18px;padding:40px 32px 28px 32px;box-shadow:0 8px 32px #bfa18155;border:2px solid #bfa181;min-width:320px;max-width:90vw;text-align:center;">
                <div style="color:#f5e9da;font-size:1.18rem;margin-bottom:28px;font-weight:500;">Download this roadmap as PDF?</div>
                <div style="display:flex;gap:24px;justify-content:center;">
                    <button id="download-confirm" class="luxury-btn" style="min-width:110px;padding:12px 24px;">Download</button>
                    <button id="download-cancel" class="luxury-btn" style="min-width:110px;padding:12px 24px;background:linear-gradient(90deg,#e57373 0%,#bfa181 100%);color:#fff;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(downloadModal);
    }

    function showDownloadModal(item) {
        downloadModal.style.display = 'flex';
        const confirmBtn = document.getElementById('download-confirm');
        const cancelBtn = document.getElementById('download-cancel');
        confirmBtn.onclick = () => {
            downloadModal.style.display = 'none';
            // Find the visible roadmap div
            const roadmapDiv = document.getElementById('selected-roadmap');
            if (!roadmapDiv || !roadmapDiv.innerHTML.trim()) {
                alert('Please select a roadmap to download.');
                return;
            }
            // Clone the node to avoid UI flicker
            const clone = roadmapDiv.cloneNode(true);
            // Inline all computed styles recursively
            function inlineAllStyles(element) {
                const computed = window.getComputedStyle(element);
                for (let key of computed) {
                    element.style[key] = computed.getPropertyValue(key);
                }
                Array.from(element.children).forEach(child => inlineAllStyles(child));
            }
            inlineAllStyles(clone);
            clone.style.background = '#fff';
            clone.style.color = '#232526';
            clone.style.padding = '32px';
            clone.style.width = '700px';
            clone.style.maxWidth = '90vw';
            clone.style.border = 'none';
            clone.style.boxShadow = 'none';
            clone.style.position = 'absolute';
            clone.style.left = '50%';
            clone.style.top = window.scrollY + 40 + 'px';
            clone.style.transform = 'translateX(-50%)';
            clone.style.zIndex = '9999';
            document.body.appendChild(clone);
            window.scrollTo(0, 0);
            setTimeout(() => {
                html2pdf().set({
                    margin: 0.5,
                    filename: `${item.skill}_roadmap.pdf`,
                    html2canvas: { scale: 2, backgroundColor: '#fff', useCORS: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                    pagebreak: { mode: ['css', 'legacy'] }
                }).from(clone).save().then(() => {
                    document.body.removeChild(clone);
                });
            }, 300);
        };
        cancelBtn.onclick = () => {
            downloadModal.style.display = 'none';
        };
    }

        // Delete option
        const deleteOpt = document.createElement('div');
        deleteOpt.textContent = 'Delete';
        deleteOpt.style.padding = '12px 18px';
        deleteOpt.style.cursor = 'pointer';
        deleteOpt.style.color = '#e57373';
        deleteOpt.onmouseover = () => deleteOpt.style.background = '#181818';
        deleteOpt.onmouseout = () => deleteOpt.style.background = 'transparent';
        deleteOpt.onclick = (e) => {
            e.stopPropagation();
            popup.style.display = 'none';
            showDeleteModal(idx);
        };

        popup.appendChild(downloadOpt);
        popup.appendChild(deleteOpt);
        wrapper.appendChild(btn);
        wrapper.appendChild(menuBtn);
        wrapper.appendChild(popup);

        menuBtn.onclick = (e) => {
            e.stopPropagation();
            // Hide any other open popups
            document.querySelectorAll('.roadmap-popup-menu').forEach(el => {
                if (el !== popup) el.style.display = 'none';
            });
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        };

        // Hide popup when clicking outside
        document.addEventListener('click', function hideMenu(ev) {
            if (!wrapper.contains(ev.target)) popup.style.display = 'none';
        });

        roadmapList.appendChild(wrapper);
    });

    // Modal logic
    let modalIdxToDelete = null;
    const modal = document.getElementById('delete-modal');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');

    function showDeleteModal(idx) {
        modalIdxToDelete = idx;
        modal.style.display = 'flex';
    }
    function hideDeleteModal() {
        modalIdxToDelete = null;
        modal.style.display = 'none';
    }
    modalConfirm.onclick = function() {
        if (modalIdxToDelete !== null) {
            saved.splice(modalIdxToDelete, 1);
            localStorage.setItem('roadmaps', JSON.stringify(saved));
            location.reload();
        }
        hideDeleteModal();
    };
    modalCancel.onclick = function() {
        hideDeleteModal();
    };

    function selectRoadmap(idx) {
        selectedRoadmap = saved[idx];
        chatHistory = [];
        selectedRoadmapDiv.innerHTML = window.renderMarkdown(selectedRoadmap.roadmap);
        chatWindow.innerHTML = '';
        chatSection.style.display = 'block';
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = sender === 'user' ? 'chat-user' : 'chat-bot';
        msgDiv.innerHTML = window.renderMarkdown(text);
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
// Use the same markdown renderer as main page
if (!window.renderMarkdown) {
    window.renderMarkdown = function(md) {
        let html = md
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\n---+\n/g, '<hr>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/^\s*[-*] (.*)$/gim, '<ul><li>$1</li></ul>');
        html = html.replace(/\n<ul>/g, '<ul>');
        html = html.replace(/<\/li><\/ul>\n<ul><li>/g, '</li><li>');
        html = html.replace(/^\s*\d+\. (.*)$/gim, '<ol><li>$1</li></ol>');
        html = html.replace(/\n<ol>/g, '<ol>');
        html = html.replace(/<\/li><\/ol>\n<ol><li>/g, '</li><li>');
        html = html.replace(/\n/g, '<br>');
        return html;
    };
}

    async function sendChat() {
        const message = chatInput.value.trim();
        if (!message || !selectedRoadmap) return;
        appendMessage('user', message);
        chatInput.value = '';
        chatHistory.push({ sender: 'user', text: message });
        // Get progress for this roadmap
        let progress = JSON.parse(localStorage.getItem('progress_' + selectedRoadmap.date) || '[]');
        // Send chat to backend
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                roadmap: selectedRoadmap.roadmap,
                history: chatHistory,
                progress
            })
        });
        const data = await response.json();
        appendMessage('bot', data.reply);
        chatHistory.push({ sender: 'bot', text: data.reply });
    }

    sendChatBtn.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendChat();
    });
});
