/**
 * Result HTML - Secondary School Grading & Date Calculator Engine
 */

export function calculateSubjectGrade(theory, internal) {
    const t = parseFloat(theory) || 0;
    const i = parseFloat(internal) || 0;
    const total = t + i;

    let grade = 'E/F';
    let gradePoint = 0;

    if (total >= 91) { grade = 'A1'; gradePoint = 10; }
    else if (total >= 81) { grade = 'A2'; gradePoint = 9; }
    else if (total >= 71) { grade = 'B1'; gradePoint = 8; }
    else if (total >= 61) { grade = 'B2'; gradePoint = 7; }
    else if (total >= 51) { grade = 'C1'; gradePoint = 6; }
    else if (total >= 41) { grade = 'C2'; gradePoint = 5; }
    else if (total >= 33) { grade = 'D1'; gradePoint = 4; }
    else { grade = 'E/F'; gradePoint = 0; }

    return { totalMarks: total, grade, gradePoint };
}

export function calculateOverallPerformance(subjects) {
    if (!subjects || subjects.length === 0) {
        return {
            totalMarksObtained: 0,
            totalMaxMarks: 0,
            percentage: 0,
            cgpa: 0,
            resultStatus: 'FAIL',
            division: 'N/A'
        };
    }

    let totalObtained = 0;
    let totalMax = 0;
    let totalGradePoints = 0;
    let hasFailedSubject = false;

    subjects.forEach(sub => {
        const total = parseFloat(sub.totalMarks) || 0;
        const max = parseFloat(sub.maxMarks) || 100;
        const gp = parseFloat(sub.gradePoint) || 0;

        totalObtained += total;
        totalMax += max;
        totalGradePoints += gp;

        if (total < 33 || sub.grade === 'E/F') {
            hasFailedSubject = true;
        }
    });

    const percentage = (totalObtained / totalMax) * 100;
    const cgpa = totalGradePoints / subjects.length;

    let resultStatus = hasFailedSubject ? 'FAIL' : 'PASS';
    let division = 'Pass Division';

    if (resultStatus === 'PASS') {
        if (percentage >= 75) division = 'Pass with Distinction';
        else if (percentage >= 60) division = 'First Division';
        else if (percentage >= 50) division = 'Second Division';
        else division = 'Third Division';
    } else {
        division = 'Essential Repeat';
    }

    return {
        totalMarksObtained: Math.round(totalObtained),
        totalMaxMarks: Math.round(totalMax),
        percentage: parseFloat(percentage.toFixed(2)),
        cgpa: parseFloat(cgpa.toFixed(2)),
        resultStatus,
        division
    };
}

export function validateNumericRoll(rollStr) {
    if (!rollStr) return false;
    return /^\d+$/.test(rollStr.trim());
}

export function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString.trim();
    
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}
