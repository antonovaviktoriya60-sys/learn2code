/************************************
 * НАСТРОЙКИ
 ************************************/
const lessons = [
    'lessons/lesson1.json',
    'lessons/lesson2.json',
    'lessons/lesson3.json'
];

const tests = [
    'tests/test1.json',
    'tests/test2.json',
    'tests/test5.json'
];

let currentLesson = 0;
let currentAnswer = null;

/************************************
 * ЗАРЕЖДАНЕ НА УРОК
 ************************************/
function loadLesson(index) {
    fetch(lessons[index])
        .then(res => res.json())
        .then(data => {
            document.getElementById('lesson-title').innerText = data.title;
            document.getElementById('lesson-text').innerText = data.text;
            document.getElementById('lesson-image').src = data.image;
            document.getElementById('lesson-audio').src = data.audio;
        });

    loadTest(index);
}

/************************************
 * ЗАРЕЖДАНЕ НА ТЕСТ
 ************************************/
function loadTest(index) {
    fetch(tests[index])
        .then(res => res.json())
        .then(data => {

            const testSection = document.getElementById('test-section');
            testSection.style.borderLeft = "6px solid #667eea";
            testSection.innerHTML = `
                <h2>Тест</h2>
                <p>${data.question}</p>
                <div id="test-options"></div>
                <button id="check-answer">Проверка</button>
                <p id="test-result"></p>
            `;

            const optionsDiv = document.getElementById('test-options');
            const result = document.getElementById('test-result');

            /******** MULTIPLE CHOICE ********/
        if (data.type === "multiple") {
    optionsDiv.innerHTML = ""; // чистим предишните опции

    // проверяваме дали очакваме един или няколко верни отговора
    const multiple = Array.isArray(data.answer);

    const inputs = [];

    data.options.forEach((opt, i) => {
        const label = document.createElement('label');
        label.className = "checkbox-label";

        const input = document.createElement('input');
        input.type = multiple ? "checkbox" : "radio";
        input.name = "option"; // за радио е важно да е еднакво име
        input.value = i;

        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + opt));
        optionsDiv.appendChild(label);

        inputs.push(input);
    });

    document.getElementById('check-answer').onclick = () => {
        const selected = Array.from(inputs)
                              .filter(inp => inp.checked)
                              .map(inp => parseInt(inp.value))
                              .sort();

        if (selected.length === 0) {
            result.innerText = "Избери поне един отговор!";
            return;
        }

        let isCorrect = false;

        if (multiple) {
            // сравняваме масиви
            const correct = data.answer.slice().sort();
            isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
        } else {
            // само един отговор
            isCorrect = selected[0] === data.answer;
        }

        isCorrect ? success(result, testSection, index)
                  : fail(result, testSection, index);
    };
}
            /******** КОДОВА ЗАДАЧА ********/
            if (data.type === "code") {
                const textarea = document.createElement('textarea');
                textarea.rows = 7;
                optionsDiv.appendChild(textarea);

                document.getElementById('check-answer').onclick = () => {
                    if (textarea.value.trim() === data.answer) {
                        success(result, testSection, index);
                    } else {
                        fail(result, testSection, index);
                    }
                };
            }

            /******** DRAG & DROP ********/
            if (data.type === "drag-drop") {
                data.options.forEach((opt, i) => {
                    const div = document.createElement('div');
                    div.className = "draggable";
                    div.draggable = true;
                    div.innerText = opt;
                    div.dataset.index = i;
                    optionsDiv.appendChild(div);
                });

                let dragged = null;

                optionsDiv.addEventListener('dragstart', e => dragged = e.target);
                optionsDiv.addEventListener('dragover', e => e.preventDefault());
                optionsDiv.addEventListener('drop', e => {
                    if (e.target.className === "draggable") {
                        const tmp = e.target.innerText;
                        e.target.innerText = dragged.innerText;
                        dragged.innerText = tmp;
                    }
                });

      document.getElementById('check-answer').onclick = () => {
    const order = Array.from(optionsDiv.children).map(el => el.innerText.trim());

    let correct = true;
    for (let i = 0; i < data.answer.length; i++) {
        if (order[i] !== data.answer[i]) correct = false;
    }

    correct ? success(result, testSection, index)
            : fail(result, testSection, index);
};
            }

            /******** ПОКАЗВАНЕ НА СТАР РЕЗУЛТАТ ********/
            const progress = getProgress(index);
            if (progress !== null) {
                if (progress) {
                    result.innerText = "Тестът вече е минат успешно";
                    testSection.style.borderLeft = "6px solid green";
                } else {
                    result.innerText = "Тестът е минат с грешки";
                    testSection.style.borderLeft = "6px solid red";
                }
            }
        });
}

/************************************
 * УСПЕХ / ГРЕШКА
 ************************************/
function success(result, section, index) {
    result.innerText = "Правилен отговор!";
    result.style.color = "green";
    section.style.borderLeft = "6px solid green";
    saveProgress(index, true);
}

function fail(result, section, index) {
    result.innerText = "Грешен отговор!";
    result.style.color = "red";
    section.style.borderLeft = "6px solid red";
    saveProgress(index, false);
}

/************************************
 * LOCAL STORAGE
 ************************************/
function saveProgress(index, passed) {
    let progress = JSON.parse(localStorage.getItem('selfTutorProgress')) || {};
    progress[index] = passed;
    localStorage.setItem('selfTutorProgress', JSON.stringify(progress));
    updateProgressBar();
}

function getProgress(index) {
    let progress = JSON.parse(localStorage.getItem('selfTutorProgress')) || {};
    return progress[index] !== undefined ? progress[index] : null;
}

function updateProgressBar() {
    const progressData = JSON.parse(localStorage.getItem('selfTutorProgress')) || {};
    const total = lessons.length;
    const passed = Object.values(progressData).filter(v => v === true).length;
    const percent = total === 0 ? 0 : Math.round((passed / total) * 100);

    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    const progressEl = document.getElementById('progress');

    if (fill) fill.style.width = percent + '%';
    if (label) label.innerText = 'Завършено: ' + percent + '%';

    let tooltipText;
    if (passed === 1) {
        tooltipText = `${passed} от ${total} тест е минат`;
    } else {
        tooltipText = `${passed} от ${total} теста са минати`;
    }
    if (progressEl) {
        progressEl.removeAttribute('title');
        progressEl.dataset.tooltip = tooltipText;
        progressEl.setAttribute('aria-label', `Завършено: ${percent}%. ${tooltipText}`);
    }
}

/************************************
 * НАВИГАЦИЯ
 ************************************/
function goToPrevLesson() {
    if (currentLesson > 0) {
        currentLesson--;
        loadLesson(currentLesson);
        updateSidebar();
        updateProgressBar();
    }
}

function goToNextLesson() {
    if (currentLesson < lessons.length - 1) {
        currentLesson++;
        loadLesson(currentLesson);
        updateSidebar();
        updateProgressBar();
    }
}

/************************************
 * РЕЗУЛТАТИ
 ************************************/
function showAllResults() {
    const progress = JSON.parse(localStorage.getItem('selfTutorProgress')) || {};
    let text = "Резултати:\n\n";

    lessons.forEach((_, i) => {
        text += `Урок ${i + 1}: `;
        if (progress[i] === true) text += "Успешно минат\n";
        else if (progress[i] === false) text += "Грешен отговор на теста \n";
        else text += "Не е минат \n";
    });

    alert(text);
}

/************************************
 * SIDEBAR
 ************************************/
function updateSidebar() {
    const lessonItems = document.querySelectorAll('.lesson-item');
    lessonItems.forEach(item => item.classList.remove('active'));
    if (lessonItems[currentLesson]) {
        lessonItems[currentLesson].classList.add('active');
    }
}

function updateSidebarTop() {
    const sidebar = document.querySelector('.sidebar');
    const topbar = document.querySelector('.topbar');
    const container = document.querySelector('.container');
    if (!sidebar) return;

    if (window.innerWidth <= 900) {
        sidebar.style.top = '';
        if (container) container.style.marginLeft = '';
        return;
    }

    const topGap = 8;
    const topbarRect = topbar ? topbar.getBoundingClientRect() : null;

    let sidebarTop;
    if (topbarRect && topbarRect.bottom <= 0) {
        sidebarTop = 24;
    } else {
        sidebarTop = topbarRect ? Math.ceil(topbarRect.bottom + topGap) : 80;
    }

    sidebar.style.top = sidebarTop + 'px';

    if (container) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const gapRight = 16; // намалено разстояние от 4 на 16
        const computedMarginLeft = Math.ceil(sidebarRect.right + gapRight);
        container.style.marginLeft = computedMarginLeft + 'px';
    }
}

/************************************
 * DARK MODE
 ************************************/
function initDarkMode() {
    const toggleDarkBtn = document.getElementById('toggle-dark');
    
    if (toggleDarkBtn) {
        toggleDarkBtn.onclick = () => {
            document.body.classList.toggle('dark-mode');
            
            if(document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'true');
                toggleDarkBtn.innerText = 'Light Mode';
            } else {
                localStorage.setItem('darkMode', 'false');
                toggleDarkBtn.innerText = 'Dark Mode';
            }
        };
    }

    if(localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        if (toggleDarkBtn) {
            toggleDarkBtn.innerText = 'Light Mode';
        }
    }
}

/************************************
 * ИНИЦИАЛИЗАЦИЯ
 ************************************/
function initApp() {
    // Зареди първия урок
    loadLesson(currentLesson);
    updateSidebar();
    updateProgressBar();
    
    // Sidebar clicks
    const lessonItems = document.querySelectorAll('.lesson-item');
    lessonItems.forEach(item => {
        item.onclick = () => {
            currentLesson = parseInt(item.dataset.lesson);
            loadLesson(currentLesson);
            updateSidebar();
        };
    });
    
    // Навигационни бутони - горе
    const prevTop = document.getElementById('prev-lesson-top');
    const nextTop = document.getElementById('next-lesson-top');
    if (prevTop) prevTop.onclick = goToPrevLesson;
    if (nextTop) nextTop.onclick = goToNextLesson;
    
    // Навигационни бутони - долу
    const prevBtn = document.getElementById('prev-lesson');
    const nextBtn = document.getElementById('next-lesson');
    if (prevBtn) prevBtn.onclick = goToPrevLesson;
    if (nextBtn) nextBtn.onclick = goToNextLesson;
    
    // Резултати бутони
    const resultsTop = document.getElementById('show-results-top');
    const resultsBottom = document.getElementById('show-results');
    if (resultsTop) resultsTop.onclick = showAllResults;
    if (resultsBottom) resultsBottom.onclick = showAllResults;
    
    // Dark mode
    initDarkMode();
    
    // Update sidebar position
    updateSidebarTop();
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    updateProgressBar();
});

window.addEventListener('load', () => {
    updateSidebarTop();
    updateProgressBar();
});

window.addEventListener('resize', updateSidebarTop);
window.addEventListener('scroll', updateSidebarTop, { passive: true });