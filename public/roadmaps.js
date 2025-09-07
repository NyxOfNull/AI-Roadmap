const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : ""; // empty string = same origin when deployed
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
        downloadOpt.textContent = 'Download';
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
                <div style="color:#f5e9da;font-size:1.18rem;margin-bottom:28px;font-weight:500;">Choose download format:</div>
                <div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;">
                    <button id="download-html-light" class="luxury-btn" style="min-width:110px;padding:12px 24px;">HTML (Light)</button>
                    <button id="download-html-dark" class="luxury-btn" style="min-width:110px;padding:12px 24px;">HTML (Dark)</button>
                    <button id="download-txt" class="luxury-btn" style="min-width:110px;padding:12px 24px;">TXT</button>
                    <button id="download-md" class="luxury-btn" style="min-width:110px;padding:12px 24px;">MD</button>
                    <button id="download-cancel" class="luxury-btn" style="min-width:110px;padding:12px 24px;background:linear-gradient(90deg,#e57373 0%,#bfa181 100%);color:#fff;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(downloadModal);
    }

    function showDownloadModal(item) {
        downloadModal.style.display = 'flex';
        
        const htmlLightBtn = document.getElementById('download-html-light');
        const htmlDarkBtn = document.getElementById('download-html-dark');
        const txtBtn = document.getElementById('download-txt');
        const mdBtn = document.getElementById('download-md');
        const cancelBtn = document.getElementById('download-cancel');

        const generateHTML = (isDark) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.skill} Learning Roadmap</title>
    <style>
        body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: ${isDark ? '#121212' : '#ffffff'};
            color: ${isDark ? '#e0e0e0' : '#2d3748'};
        }
        h1, h2, h3 { 
            color: ${isDark ? '#818cf8' : '#6366f1'};
            margin-top: 1.5em;
        }
        ul, ol { 
            margin-left: 20px;
            color: ${isDark ? '#d1d5db' : '#4a5568'};
        }
        li { margin-bottom: 10px; }
        code {
            background: ${isDark ? '#2d3748' : '#f1f5f9'};
            color: ${isDark ? '#e0e0e0' : '#2d3748'};
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .header {
            background: ${isDark ? '#1a1a1a' : '#6366f1'};
            color: ${isDark ? '#e0e0e0' : '#ffffff'};
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(99,102,241,0.2)'};
        }
        .header h1 {
            color: ${isDark ? '#818cf8' : '#ffffff'};
            margin: 0 0 1rem 0;
            font-size: 2.2rem;
        }
        .header p {
            margin: 0.5rem 0;
            opacity: 0.9;
        }
        .content {
            background: ${isDark ? '#1a1a1a' : '#ffffff'};
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'};
            border: 1px solid ${isDark ? '#2d3748' : '#e2e8f0'};
        }
        strong {
            color: ${isDark ? '#818cf8' : '#6366f1'};
            font-weight: 600;
        }
        em {
            color: ${isDark ? '#9ca3af' : '#64748b'};
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${item.skill} Learning Roadmap</h1>
        <p>Level: ${item.level}</p>
        <p>Generated: ${new Date(item.date).toLocaleString()}</p>
    </div>
    <div class="content">
        ${renderMarkdownWithLinks(item.roadmap)}
    </div>
</body>
</html>`;
            
            htmlLightBtn.onclick = () => {
                downloadModal.style.display = 'none';
                const blob = new Blob([generateHTML(false)], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${item.skill}_roadmap_light.html`;
                a.click();
                URL.revokeObjectURL(url);
            };

            htmlDarkBtn.onclick = () => {
                downloadModal.style.display = 'none';
                const blob = new Blob([generateHTML(true)], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${item.skill}_roadmap_dark.html`;
                a.click();
                URL.revokeObjectURL(url);
            };

            txtBtn.onclick = () => {
                downloadModal.style.display = 'none';
                const blob = new Blob([item.roadmap], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${item.skill}_roadmap.txt`;
                a.click();
                URL.revokeObjectURL(url);
            };

            mdBtn.onclick = () => {
                downloadModal.style.display = 'none';
                const blob = new Blob([item.roadmap], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${item.skill}_roadmap.md`;
                a.click();
                URL.revokeObjectURL(url);
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

function renderMarkdownWithLinks(md) {
    let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\n---+\n/g, '<hr>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Add clickable links with target="_blank"
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>');

    // Handle lists
    html = html.replace(/^\s*[-*] (.*)$/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/\n<ul>/g, '<ul>');
    html = html.replace(/<\/li><\/ul>\n<ul><li>/g, '</li><li>');
    html = html.replace(/^\s*\d+\. (.*)$/gim, '<ol><li>$1</li></ol>');
    html = html.replace(/\n<ol>/g, '<ol>');
    html = html.replace(/<\/li><\/ol>\n<ol><li>/g, '</li><li>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

async function sendChat() {
    const message = chatInput.value.trim();
    if (!message || !selectedRoadmap) return;

    appendMessage('user', message);
    chatInput.value = '';
    chatHistory.push({ sender: 'user', text: message });

    // Get progress for this roadmap
    let progress = JSON.parse(localStorage.getItem('progress_' + selectedRoadmap.date) || '[]');

    try {
        const response = await fetch(`${API_BASE}/chat`, {
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

    } catch (err) {
        console.error("Chat request failed:", err);
        appendMessage('system', "⚠️ Failed to reach server. Please try again.");
    }
}

    sendChatBtn.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendChat();
    });
});
