const FILTER_PROPERTIES = ["department", "level", "credits", "instructor", "semester"];
const NUMERIC_PROPERTIES = ["level", "credits"];

let allCourses = [];
let selectedCourse = null;

const fileInput = document.getElementById("file-input");
const errorMessage = document.getElementById("error-message");
const courseList = document.getElementById("course-list");
const courseCount = document.getElementById("course-count");
const courseDetails = document.getElementById("course-details");
const sortSelect = document.getElementById("sort-select");

function getFilterSelect(property) {
    return document.getElementById(`${property}-filter`);
}

// ---------- Loading ----------

function handleFileSelected(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = () => loadCourses(reader.result);
    reader.onerror = () => showError("The file could not be read.");
    reader.readAsText(file);
}

function loadCourses(fileText) {
    try {
        const data = parseCourseData(fileText);
        allCourses = data
            .filter((item) => item !== null && typeof item === "object" && !Array.isArray(item))
            .map((item) => new Course(item));
        if (allCourses.length === 0) {
            throw new Error("The file does not contain any valid course objects.");
        }
        hideError();
        selectedCourse = null;
        showPlaceholderDetails();
        populateFilters();
        updateCourseList();
    } catch (error) {
        allCourses = [];
        populateFilters();
        updateCourseList();
        showPlaceholderDetails();
        showError(`Error loading file: ${error.message}`);
    }
}

function parseCourseData(fileText) {
    if (fileText.trim() === "") {
        throw new Error("The file is empty.");
    }
    let data;
    try {
        data = JSON.parse(fileText);
    } catch {
        throw new Error("The file is not valid JSON.");
    }
    if (!Array.isArray(data)) {
        throw new Error("Expected a list (array) of courses.");
    }
    return data;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}

// ---------- Filters ----------

function populateFilters() {
    FILTER_PROPERTIES.forEach((property) => {
        const select = getFilterSelect(property);
        const values = getUniqueValues(property);
        select.innerHTML = "";
        select.appendChild(createOption("all", "All"));
        values.forEach((value) => select.appendChild(createOption(value, value)));
    });
}

function getUniqueValues(property) {
    const values = [...new Set(allCourses.map((course) => String(course[property])))];
    if (NUMERIC_PROPERTIES.includes(property)) {
        return values.sort((a, b) => toSortableNumber(a) - toSortableNumber(b));
    }
    if (property === "semester") {
        return values.sort((a, b) => semesterValueOf(a) - semesterValueOf(b));
    }
    return values.sort((a, b) => a.localeCompare(b));
}

function toSortableNumber(text) {
    const number = Number(text);
    return Number.isFinite(number) ? number : Infinity;
}

function semesterValueOf(semesterText) {
    return new Course({ semester: semesterText }).semesterSortValue;
}

function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
}

function getSelectedFilters() {
    const filters = {};
    FILTER_PROPERTIES.forEach((property) => {
        filters[property] = getFilterSelect(property).value;
    });
    return filters;
}

// ---------- Sorting ----------

function compareText(a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
}

function compareSemester(a, b) {
    const difference = a.semesterSortValue - b.semesterSortValue;
    // Infinity - Infinity is NaN, so treat two missing semesters as equal
    return Number.isNaN(difference) ? 0 : difference;
}

function sortCourses(courses, sortKey) {
    if (sortKey === "id") {
        return courses.sort((a, b) => compareText(a.id, b.id));
    }
    if (sortKey === "title") {
        return courses.sort((a, b) => compareText(a.title, b.title));
    }
    if (sortKey === "semester") {
        return courses.sort(compareSemester);
    }
    return courses;
}

// ---------- Display ----------

function updateCourseList() {
    const filters = getSelectedFilters();
    const visibleCourses = allCourses.filter((course) => course.matchesFilters(filters));
    sortCourses(visibleCourses, sortSelect.value);
    renderCourseList(visibleCourses);
}

function renderCourseList(courses) {
    courseList.innerHTML = "";
    courseCount.textContent = `(${courses.length})`;
    courses.forEach((course) => {
        const item = document.createElement("li");
        item.textContent = course.getListLabel();
        if (course === selectedCourse) {
            item.classList.add("selected");
        }
        item.addEventListener("click", () => selectCourse(course, item));
        courseList.appendChild(item);
    });
}

function selectCourse(course, listItem) {
    selectedCourse = course;
    courseList.querySelectorAll("li").forEach((item) => item.classList.remove("selected"));
    listItem.classList.add("selected");
    renderCourseDetails(course);
}

function renderCourseDetails(course) {
    courseDetails.innerHTML = "";
    course.getDetails().forEach(([label, value]) => {
        const line = document.createElement("p");
        const labelElement = document.createElement("strong");
        labelElement.textContent = `${label}: `;
        line.appendChild(labelElement);
        line.appendChild(document.createTextNode(value));
        courseDetails.appendChild(line);
    });
}

function showPlaceholderDetails() {
    courseDetails.innerHTML = '<p class="placeholder">Select a course to see its details.</p>';
}

// ---------- Event listeners ----------

fileInput.addEventListener("change", handleFileSelected);
sortSelect.addEventListener("change", updateCourseList);
FILTER_PROPERTIES.forEach((property) => {
    getFilterSelect(property).addEventListener("change", updateCourseList);
});
