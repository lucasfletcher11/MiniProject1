const MISSING_TEXT = "Not specified";
const SEMESTER_ORDER = ["Winter", "Spring", "Summer", "Fall"];

class Course {
    constructor(data) {
        this._id = Course.cleanText(data.id);
        this._title = Course.cleanText(data.title);
        this._department = Course.cleanText(data.department);
        this._level = Course.cleanNumber(data.level);
        this._credits = Course.cleanNumber(data.credits);
        this._instructor = Course.cleanText(data.instructor);
        this._description = Course.cleanText(data.description);
        this._semester = Course.cleanText(data.semester);
    }

    static cleanText(value) {
        if (typeof value === "string" && value.trim() !== "") {
            return value.trim();
        }
        if (typeof value === "number") {
            return String(value);
        }
        return null;
    }

    static cleanNumber(value) {
        const number = Number(value);
        if (value === null || value === "" || !Number.isFinite(number)) {
            return null;
        }
        return number;
    }

    get id() {
        return this._id ?? MISSING_TEXT;
    }

    get title() {
        return this._title ?? MISSING_TEXT;
    }

    get department() {
        return this._department ?? MISSING_TEXT;
    }

    get level() {
        return this._level ?? MISSING_TEXT;
    }

    get credits() {
        return this._credits ?? MISSING_TEXT;
    }

    get instructor() {
        return this._instructor ?? MISSING_TEXT;
    }

    get description() {
        return this._description ?? "No description available.";
    }

    get semester() {
        return this._semester ?? MISSING_TEXT;
    }

    // Converts "Fall 2025" into a number that sorts chronologically.
    // Missing or invalid semesters return Infinity so they sort to the end.
    get semesterSortValue() {
        if (this._semester === null) {
            return Infinity;
        }
        const parts = this._semester.split(" ");
        const termIndex = SEMESTER_ORDER.indexOf(parts[0]);
        const year = Number(parts[1]);
        if (parts.length !== 2 || termIndex === -1 || !/^\d{4}$/.test(parts[1])) {
            return Infinity;
        }
        return year * 10 + termIndex;
    }

    getListLabel() {
        return `${this.id}: ${this.title}`;
    }

    getDetails() {
        return [
            ["Course ID", this.id],
            ["Title", this.title],
            ["Department", this.department],
            ["Level", this.level],
            ["Credits", this.credits],
            ["Instructor", this.instructor],
            ["Semester", this.semester],
            ["Description", this.description],
        ];
    }

    matchesFilters(filters) {
        return Object.keys(filters).every((property) => {
            const selected = filters[property];
            return selected === "all" || String(this[property]) === selected;
        });
    }
}
