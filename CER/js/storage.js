/**
 * Result HTML - Storage & State Manager
 */

import { INITIAL_STUDENTS_DATA, DEFAULT_INSTITUTE_CONFIG } from './sample-data.js';

const STORAGE_KEYS = {
    STUDENTS: 'result_html_students_v1',
    INSTITUTE: 'result_html_config_v1'
};

class StorageManager {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS_DATA));
        }
        if (!localStorage.getItem(STORAGE_KEYS.INSTITUTE)) {
            localStorage.setItem(STORAGE_KEYS.INSTITUTE, JSON.stringify(DEFAULT_INSTITUTE_CONFIG));
        }
        this.fetchStaticData();
    }

    async fetchStaticData() {
        try {
            const response = await fetch('./data/students.json');
            if (response.ok) {
                const jsonStudents = await response.json();
                if (jsonStudents && jsonStudents.length > 0) {
                    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(jsonStudents));
                }
            }
        } catch (e) {
            console.log('Using embedded dataset fallback');
        }
    }

    getStudents() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || INITIAL_STUDENTS_DATA;
        } catch (e) {
            return INITIAL_STUDENTS_DATA;
        }
    }

    getStudentByRollNo(rollNo) {
        if (!rollNo) return null;
        const cleanRoll = rollNo.toString().trim();
        const students = this.getStudents();
        return students.find(s => s.rollNo.toString().trim() === cleanRoll) || null;
    }

    getStudentByRollAndDob(rollNo, dobInput) {
        if (!rollNo) return null;
        const cleanRoll = rollNo.toString().trim();
        const students = this.getStudents();
        
        let targetDobFormatted = dobInput ? dobInput.trim() : '';
        if (targetDobFormatted.includes('-')) {
            const parts = targetDobFormatted.split('-');
            if (parts.length === 3) {
                targetDobFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }

        return students.find(s => {
            const matchRoll = s.rollNo.toString().trim() === cleanRoll;
            if (!matchRoll) return false;
            if (!targetDobFormatted) return true;
            
            const studentDob = s.dob.trim();
            return studentDob === targetDobFormatted;
        }) || null;
    }

    getInstituteConfig() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.INSTITUTE)) || DEFAULT_INSTITUTE_CONFIG;
        } catch (e) {
            return DEFAULT_INSTITUTE_CONFIG;
        }
    }
}

export const storage = new StorageManager();
