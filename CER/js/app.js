/**
 * Result HTML - Application Controller Module
 */

import { storage } from './storage.js';
import { validateNumericRoll, formatDateToDDMMYYYY } from './calculator.js';
import { renderOfficialMarksheetHTML, downloadStudentHostedPDF } from './pdf-generator.js';

let currentSearchedStudent = null;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupSearchForm();
    checkURLHashSearch();
});

/* ==========================================================================
   THEME TOGGLE SYSTEM
   ========================================================================== */
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

/* ==========================================================================
   SEARCH FORM CONTROLLER & PDF REDIRECTION
   ========================================================================== */
function setupSearchForm() {
    const searchForm = document.getElementById('resultSearchForm');
    const rollInput = document.getElementById('rollSearchInput');
    const dobInput = document.getElementById('dobSearchInput');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rollQuery = rollInput.value.trim();
            const dobQuery = dobInput ? dobInput.value : '';

            if (!validateNumericRoll(rollQuery)) {
                showToast("Invalid Roll Number! Roll Number must contain digits only (e.g. 2224865).", "error");
                rollInput.focus();
                return;
            }

            performResultSearch(rollQuery, dobQuery);
        });
    }
}

function performResultSearch(rollQuery, dobQuery = '') {
    const student = storage.getStudentByRollAndDob(rollQuery, dobQuery);

    if (!student) {
        showToast(`No student record found matching Roll No. "${rollQuery}" and DOB. Please check your credentials.`, "error");
        const displayContainer = document.getElementById('marksheetResultDisplay');
        if (displayContainer) {
            displayContainer.innerHTML = `
                <div class="marksheet-view-card" style="text-align: center; padding: 3rem 1.5rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-rose); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">Result Not Found</h3>
                    <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">No examination record matched Roll No. <strong>${rollQuery}</strong>. Please ensure the Roll Number contains digits only and Date of Birth is correct.</p>
                </div>
            `;
        }
        return;
    }

    currentSearchedStudent = student;
    const config = storage.getInstituteConfig();

    const displayContainer = document.getElementById('marksheetResultDisplay');
    if (displayContainer) {
        displayContainer.innerHTML = renderOfficialMarksheetHTML(student, config);
        displayContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Bind action methods
    window.downloadOfficialPDF = () => {
        downloadStudentHostedPDF(currentSearchedStudent);
    };

    window.printMarksheet = () => {
        window.print();
    };

    // Auto open corresponding raw GitHub PDF URL
    if (student.pdfUrl) {
        showToast(`Record Found! Opening official PDF certificate for Roll ${student.rollNo}...`, "success");
        setTimeout(() => {
            downloadStudentHostedPDF(student);
        }, 600);
    } else {
        showToast(`Result record loaded successfully for ${student.name}!`, "success");
    }

    // Update URL hash for deep linking
    const dobFormatted = formatDateToDDMMYYYY(dobQuery);
    window.location.hash = `#result?roll=${encodeURIComponent(rollQuery)}&dob=${encodeURIComponent(dobFormatted)}`;
}

function checkURLHashSearch() {
    const hash = window.location.hash;
    if (hash && hash.includes('roll=')) {
        const params = new URLSearchParams(hash.replace('#result?', ''));
        const roll = params.get('roll');
        const dob = params.get('dob');

        if (roll) {
            const rollInput = document.getElementById('rollSearchInput');
            const dobInput = document.getElementById('dobSearchInput');
            if (rollInput) rollInput.value = roll;

            if (dobInput && dob) {
                const parts = dob.split('/');
                if (parts.length === 3) {
                    dobInput.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
            performResultSearch(roll, dob || '');
        }
    }
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */
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
