/**
 * Centralised Examination Result Portal - Lightweight URL Matcher
 */

import { RESULT_URL_MAP } from './url-map.js';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupSearchForm();
});

/* Theme Toggle */
function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('result_html_theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('result_html_theme', isLight ? 'light' : 'dark');
            themeBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }
}

/* Setup Form Handler */
function setupSearchForm() {
    const searchForm = document.getElementById('resultSearchForm');
    const rollInput = document.getElementById('rollSearchInput');
    const dobInput = document.getElementById('dobSearchInput');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rollQuery = rollInput.value.trim();
            const rawDob = dobInput ? dobInput.value : '';

            if (!/^\d+$/.test(rollQuery)) {
                showToast("Roll Number must contain digits only.", "error");
                rollInput.focus();
                return;
            }

            // Convert YYYY-MM-DD to DD/MM/YYYY
            let dobFormatted = rawDob;
            if (rawDob && rawDob.includes('-')) {
                const parts = rawDob.split('-');
                if (parts.length === 3) {
                    dobFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            // Find matching URL in Excel map
            const match = RESULT_URL_MAP.find(item => {
                const rollMatch = item.rollNo === rollQuery;
                if (!rollMatch) return false;
                if (!dobFormatted) return true;
                return item.dob === dobFormatted;
            });

            if (match && match.pdfUrl) {
                showToast(`Record Found! Opening result PDF...`, "success");
                
                // Open corresponding PDF URL immediately
                const win = window.open(match.pdfUrl, '_blank');
                if (!win) {
                    window.location.href = match.pdfUrl;
                }
            } else {
                showToast(`No result file found for Roll No. ${rollQuery} and entered DOB.`, "error");
            }
        });
    }
}

/* Toast System */
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}
