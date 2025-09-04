// progress.js
// Show all saved roadmaps and allow user to check off steps as progress

document.addEventListener('DOMContentLoaded', function() {
    const progressList = document.getElementById('progress-list');
    let saved = JSON.parse(localStorage.getItem('roadmaps') || '[]');
    if (saved.length === 0) {
        progressList.innerHTML = '<p>No saved roadmaps yet.</p>';
        return;
    }
    saved.forEach((item, idx) => {
        // Try to extract steps from the roadmap (look for lines starting with - or *)
        const steps = (item.roadmap.match(/^(?:-|\*) (.+)$/gim) || []).map(s => s.replace(/^(?:-|\*) /, ''));
        // Load progress from localStorage
        let progress = JSON.parse(localStorage.getItem('progress_' + item.date) || '[]');
        const wrapper = document.createElement('div');
        wrapper.className = 'output-section';
        wrapper.style.marginBottom = '32px';
        wrapper.innerHTML = `<strong>${item.skill} (${item.level})</strong> - <span style="font-size:0.95em;">${new Date(item.date).toLocaleString()}</span>`;
        if (steps.length === 0) {
            wrapper.innerHTML += '<br><em>No step-by-step tasks found in this roadmap.</em>';
        } else {
            const ul = document.createElement('ul');
            steps.forEach((step, sidx) => {
                const li = document.createElement('li');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = progress.includes(sidx);
                checkbox.onchange = function() {
                    if (checkbox.checked) {
                        progress.push(sidx);
                    } else {
                        progress = progress.filter(i => i !== sidx);
                    }
                    localStorage.setItem('progress_' + item.date, JSON.stringify(progress));
                };
                li.appendChild(checkbox);
                li.appendChild(document.createTextNode(' ' + step));
                ul.appendChild(li);
            });
            wrapper.appendChild(ul);
        }
        progressList.appendChild(wrapper);
    });
});
