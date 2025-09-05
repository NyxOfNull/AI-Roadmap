// --- Markdown rendering helper ---
window.renderMarkdown = function(md) {
    // Basic replacements for bold, italics, headers, lists, hr, and code
    let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\n---+\n/g, '<hr>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    // Lists
    html = html.replace(/^\s*[-*] (.*)$/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/\n<ul>/g, '<ul>');
    html = html.replace(/<\/li><\/ul>\n<ul><li>/g, '</li><li>');
    // Ordered lists
    html = html.replace(/^\s*\d+\. (.*)$/gim, '<ol><li>$1</li></ol>');
    html = html.replace(/\n<ol>/g, '<ol>');
    html = html.replace(/<\/li><\/ol>\n<ol><li>/g, '</li><li>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
};

document.addEventListener('DOMContentLoaded', function() {
     const saveBtn = document.getElementById('save-roadmap');

     // Save Roadmap logic (attach once)
     saveBtn.addEventListener('click', function() {
         const skill = document.getElementById('skill').value;
         const level = document.getElementById('level').value;
         const roadmap = window.generatedRoadmap;
         if (!roadmap) return;
         // Retrieve saved roadmaps from localStorage
         let saved = JSON.parse(localStorage.getItem('roadmaps') || '[]');
         // Add new roadmap
         saved.push({ skill, level, roadmap, date: new Date().toISOString() });
         localStorage.setItem('roadmaps', JSON.stringify(saved));
         saveBtn.innerText = 'Saved!';
         setTimeout(() => { saveBtn.innerText = 'Save Roadmap'; }, 1500);
     });

     document.getElementById('generate').addEventListener('click', async () => {
    const skill = document.getElementById('skill').value;
    const level = document.getElementById('level').value;
    const duration = document.getElementById('duration').value;
    const durationUnit = document.getElementById('duration-unit').value;
    const hours = document.getElementById('hours').value;
        const loadingDiv = document.getElementById('loading');
        const resultDiv = document.getElementById('result');
        // Show loading
        loadingDiv.style.display = 'block';
        resultDiv.innerHTML = '';
        document.getElementById('save-roadmap').style.display = 'none';
        try {
            const response = await fetch('/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill, level, duration, durationUnit, hours })
            });
            console.log('Raw response:', response);
            const data = await response.json();
            console.log('Parsed response data:', data);
            if (!data.roadmap) {
                resultDiv.innerHTML = '<span style="color:#e57373">No roadmap received from server.</span>';
                return;
            }
            // Format roadmap as HTML with markdown support
            resultDiv.innerHTML = window.renderMarkdown(data.roadmap);
            // Store the roadmap for chatbot context
            window.generatedRoadmap = data.roadmap;
             // Show save button
             saveBtn.style.display = 'block';
        } catch (err) {
            console.error('Error in roadmap generation:', err);
            resultDiv.innerHTML = '<span style="color:#e57373">Failed to generate roadmap. Please try again.</span>';
        } finally {
            loadingDiv.style.display = 'none';
        }
    });
    // Chatbot logic
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = sender === 'user' ? 'chat-user' : 'chat-bot';
        msgDiv.innerText = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Track chat history for context
    let chatHistory = [];

    async function sendChat() {
        const message = chatInput.value.trim();
        if (!message) return;
        appendMessage('user', message);
        chatInput.value = '';
        chatHistory.push({ sender: 'user', text: message });

        // Send chat to backend with history
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                roadmap: window.generatedRoadmap || '',
                history: chatHistory
            })
        });
        const data = await response.json();
        appendMessage('bot', data.reply);
        chatHistory.push({ sender: 'bot', text: data.reply });
    }
if (sendChatBtn && chatInput) {
    sendChatBtn.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendChat();
    });
}

    // Hide save button initially
    document.getElementById('save-roadmap').style.display = 'none';

if (sendChatBtn && chatInput) {
    // Reset chat history when a new roadmap is generated
    document.getElementById('generate').addEventListener('click', function() {
        chatHistory = [];
        chatWindow.innerHTML = '';
    });
}
});
