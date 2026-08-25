/**
 * Result HTML - Marksheet & PDF Dispatch Engine
 */

import { generateSVGQRCode } from './qrcode-standalone.js';

export function renderOfficialMarksheetHTML(student, config) {
    if (!student) return '<div class="marksheet-view-card"><p>No student record found.</p></div>';

    const instConfig = config || {
        name: "CENTRALISED EXAMINATION BOARD",
        subHeading: "Centralised Examination Result",
        accreditation: "Secondary School Examination (Class IX & Class X)",
        address: "Central Examination Building, Education Zone - 110001",
        signatoryTitle: "Controller of Examinations",
        signatoryName: "Dr. S. K. Mukherjee"
    };

    const qrSvg = generateSVGQRCode(`${student.rollNo}|${student.dob}|${student.resultStatus}`);

    const subjectRows = (student.subjects || []).map(sub => `
        <tr class="${sub.grade === 'E/F' ? 'failing-row' : ''}">
            <td style="font-family: 'JetBrains Mono', monospace;">${sub.code}</td>
            <td class="subject-name">${sub.name}</td>
            <td>${sub.theoryMarks || '-'}</td>
            <td>${sub.internalMarks || '-'}</td>
            <td style="font-weight: 700;">${sub.totalMarks}</td>
            <td><span class="grade-badge grade-${sub.grade.replace('+', '\\+')}">${sub.grade}</span></td>
        </tr>
    `).join('');

    return `
        <div class="marksheet-view-card">
            <div class="marksheet-action-bar">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-check-circle" style="color: var(--accent-emerald); font-size: 1.5rem;"></i>
                    <div>
                        <h3 style="font-size: 1.1rem; margin: 0;">Official Result Record Verified</h3>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Roll No: ${student.rollNo} | DOB: ${student.dob} (${student.classLevel || 'Class X'})</span>
                    </div>
                </div>
                <div class="action-btns">
                    <button class="btn-secondary btn-emerald" onclick="window.downloadOfficialPDF()">
                        <i class="fas fa-file-pdf"></i> Download Official PDF
                    </button>
                    <button class="btn-secondary" onclick="window.printMarksheet()">
                        <i class="fas fa-print"></i> Print Marksheet
                    </button>
                </div>
            </div>

            <div id="printableMarksheet" class="official-marksheet-document">
                <div class="watermark-overlay">${instConfig.watermarkText || 'CENTRALISED RESULT'}</div>

                <header class="marksheet-header">
                    <div class="header-branding">
                        <img src="${instConfig.logoUrl || 'https://cdn-icons-png.flaticon.com/512/2991/2991108.png'}" alt="Logo" class="institute-logo">
                        <div class="institute-title-group">
                            <h1 class="institute-name">${instConfig.name}</h1>
                            <div class="institute-accreditation">${instConfig.accreditation}</div>
                            <div class="institute-address">${instConfig.address}</div>
                        </div>
                    </div>
                    <div class="doc-badge">
                        <span class="transcript-tag">OFFICIAL TRANSCRIPT</span>
                        <span class="session-tag">SESSION: ${student.session || '2023-2024'}</span>
                    </div>
                </header>

                <hr class="header-divider">

                <div class="student-info-grid">
                    <div class="info-cell">
                        <span class="info-label">CANDIDATE NAME</span>
                        <span class="info-value highlight">${student.name}</span>
                    </div>
                    <div class="info-cell">
                        <span class="info-label">ROLL NUMBER</span>
                        <span class="info-value" style="font-family: 'JetBrains Mono', monospace;">${student.rollNo}</span>
                    </div>
                    <div class="info-cell">
                        <span class="info-label">DATE OF BIRTH (DOB)</span>
                        <span class="info-value">${student.dob}</span>
                    </div>
                    <div class="info-cell">
                        <span class="info-label">MOTHER'S NAME</span>
                        <span class="info-value">${student.motherName || 'N/A'}</span>
                    </div>
                    <div class="info-cell">
                        <span class="info-label">FATHER'S NAME</span>
                        <span class="info-value">${student.fatherName || 'N/A'}</span>
                    </div>
                    <div class="info-cell">
                        <span class="info-label">EXAMINATION CLASS</span>
                        <span class="info-value">${student.classLevel || 'Secondary Education'}</span>
                    </div>
                </div>

                <div class="marks-table-section">
                    <table class="marksheet-table">
                        <thead>
                            <tr>
                                <th style="width: 10%;">CODE</th>
                                <th style="width: 42%; text-align: left;">SUBJECT NAME</th>
                                <th style="width: 12%;">THEORY (80)</th>
                                <th style="width: 12%;">INTERNAL (20)</th>
                                <th style="width: 12%;">TOTAL (100)</th>
                                <th style="width: 12%;">GRADE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectRows}
                        </tbody>
                    </table>
                </div>

                <div class="performance-summary-container">
                    <div class="summary-box">
                        <div class="metric-card">
                            <span class="metric-label">TOTAL MARKS</span>
                            <span class="metric-val">${student.totalMarksObtained} / ${student.totalMaxMarks}</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-label">PERCENTAGE</span>
                            <span class="metric-val">${student.percentage}%</span>
                        </div>
                        <div class="metric-card highlight-box">
                            <span class="metric-label">CUMULATIVE GPA</span>
                            <span class="metric-val big">${student.cgpa}</span>
                        </div>
                        <div class="metric-card status-${student.resultStatus}">
                            <span class="metric-label">RESULT STATUS</span>
                            <span class="metric-val"><span class="badge-status">${student.resultStatus}</span></span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-label">QUALIFYING DIVISION</span>
                            <span class="metric-val" style="font-size: 0.85rem; font-weight: 600;">${student.division}</span>
                        </div>
                    </div>
                    <div class="remarks-row">
                        <strong>Remarks:</strong> ${student.remarks || 'Qualified for Secondary Certification.'}
                    </div>
                </div>

                <footer class="marksheet-footer">
                    <div class="qr-verification-box">
                        <div class="qr-code-canvas">${qrSvg}</div>
                        <div class="qr-meta">
                            <span class="qr-title">DIGITAL VERIFICATION</span>
                            <span class="qr-sub">Scan QR Code to verify certificate</span>
                            <span class="qr-code-id">VERIFIED-ID: ${student.rollNo}-${student.dob.replace(/\//g, '')}</span>
                        </div>
                    </div>

                    <div class="date-issue-box">
                        <strong>Date of Issue:</strong> ${student.issueDate || '20/05/2024'}
                    </div>

                    <div class="signatory-box">
                        <div class="sig-line"></div>
                        <div class="sig-name">${instConfig.signatoryName}</div>
                        <div class="sig-title">${instConfig.signatoryTitle}</div>
                    </div>
                </footer>
            </div>
        </div>
    `;
}

export function downloadStudentHostedPDF(student) {
    if (!student) return;

    if (student.pdfUrl) {
        // Open the target GitHub hosted PDF URL directly in a new tab
        const win = window.open(student.pdfUrl, '_blank');
        if (!win) {
            window.location.href = student.pdfUrl;
        }
    } else {
        window.print();
    }
}
