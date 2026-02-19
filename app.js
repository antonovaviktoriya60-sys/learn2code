/************************************
 * НАСТРОЙКИ
 ************************************/
const lessons = [
    'lessons/lesson1.json',
    'lessons/lesson2.json',
    'lessons/lesson3.json',
    'lessons/lesson4.json',
    'lessons/lesson5.json',
    'lessons/lesson6.json'
];

const tests = [
    'tests/test1.json',
    'tests/test2.json',
    'tests/test3.json',
    'tests/test4.json'
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
            document.getElementById('lesson-secondtitle').innerText = data['lesson-secondtitle'];
            document.getElementById('lesson-text').innerText = data.text;
            
            // Handle main image
            const imageEl = document.getElementById('lesson-image');
            if (imageEl) {
                if (data.image) {
                    imageEl.src = data.image;
                    imageEl.style.display = '';
                } else {
                    imageEl.style.display = 'none';
                }
            }
            
            // Handle lesson-thirdtitle and text3
            const thirdEl = document.getElementById('lesson-thirdtitle');
            const text3El = document.getElementById('lesson-text-3');
            const image3El = document.getElementById('lesson-image3');
            if (thirdEl) {
                if (data['lesson-thirdtitle']) {
                    thirdEl.innerText = data['lesson-thirdtitle'];
                    thirdEl.style.display = '';
                } else {
                    thirdEl.innerText = '';
                    thirdEl.style.display = 'none';
                }
            }
            if (text3El) {
                if (data.text3) {
                    text3El.innerText = data.text3;
                    text3El.style.display = '';
                } else {
                    text3El.innerText = '';
                    text3El.style.display = 'none';
                }
            }
            if (image3El) {
                if (data.image3) {
                    image3El.src = data.image3;
                    image3El.style.display = '';
                } else {
                    image3El.style.display = 'none';
                }
            }
            
            // Handle text2 (backward compatibility)
            const text2El = document.getElementById('lesson-text-2');
            if (text2El) {
                if (data.text2) {
                    text2El.innerText = data.text2;
                    text2El.style.display = '';
                } else {
                    text2El.innerText = '';
                    text2El.style.display = 'none';
                }
            }
            
            // Handle fourthtitle and text4
            const fourthEl = document.getElementById('fourthtitle');
            const text4El = document.getElementById('lesson-text-4');
            const image4El = document.getElementById('lesson-image4');
            if (fourthEl) {
                if (data.fourthtitle) {
                    fourthEl.innerText = data.fourthtitle;
                    fourthEl.style.display = '';
                } else {
                    fourthEl.innerText = '';
                    fourthEl.style.display = 'none';
                }
            }
            if (text4El) {
                if (data.text4) {
                    text4El.innerText = data.text4;
                    text4El.style.display = '';
                } else {
                    text4El.innerText = '';
                    text4El.style.display = 'none';
                }
            }
            if (image4El) {
                if (data.image4) {
                    image4El.src = data.image4;
                    image4El.style.display = '';
                } else {
                    image4El.style.display = 'none';
                }
            }
            
            // Handle fifthtitle and text5
            const fifthEl = document.getElementById('fifthtitle');
            const text5El = document.getElementById('lesson-text-5');
            const image5El = document.getElementById('lesson-image5');
            if (fifthEl) {
                if (data.fifthtitle) {
                    fifthEl.innerText = data.fifthtitle;
                    fifthEl.style.display = '';
                } else {
                    fifthEl.innerText = '';
                    fifthEl.style.display = 'none';
                }
            }
            if (text5El) {
                if (data.text5) {
                    text5El.innerText = data.text5;
                    text5El.style.display = '';
                } else {
                    text5El.innerText = '';
                    text5El.style.display = 'none';
                }
            }
            if (image5El) {
                if (data.image5) {
                    image5El.src = data.image5;
                    image5El.style.display = '';
                } else {
                    image5El.style.display = 'none';
                }
            }
            
            document.getElementById('lesson-audio').src = data.audio;
        });

    // Затвори тестовата секция при смяна на урока
    const testSection = document.getElementById('test-section');
    if (testSection) {
        testSection.style.display = 'none';
    }
    
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
            
            // Проверяваме дали има questions масив (множество въпроси)
            const questions = data.questions || [data];
            
            testSection.innerHTML = `
                <h2>Тест</h2>
                <div id="questions-container"></div>
                <button id="check-answer">Проверка</button>
                <p id="test-result"></p>
            `;
            
            const questionsContainer = document.getElementById('questions-container');
            const result = document.getElementById('test-result');
            
            // Генерира HTML за всеки въпрос
            questions.forEach((question, qIndex) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'test-question';
                questionDiv.innerHTML = `
                    <p><strong>${qIndex + 1}. ${question.question}</strong></p>
                    <div id="test-options-${qIndex}"></div>
                `;
                questionsContainer.appendChild(questionDiv);
            });
            
            // Обработка на отговорите
            document.getElementById('check-answer').onclick = () => {
                let allCorrect = true;
                let feedbackMessage = "";
                
                questions.forEach((question, qIndex) => {
                    const optionsDiv = document.getElementById(`test-options-${qIndex}`);
                    const questionDiv = optionsDiv.closest('.test-question');
                    
                    let isCorrect = false;
                    
                    // MULTIPLE CHOICE или RADIO
                    if (question.type === "multiple" || question.type === "radio") {
                        const inputs = optionsDiv.querySelectorAll('input');
                        const selected = Array.from(inputs)
                            .filter(inp => inp.checked)
                            .map(inp => parseInt(inp.value))
                            .sort();
                        
                        if (Array.isArray(question.answer)) {
                            const correct = question.answer.slice().sort();
                            isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
                        } else {
                            isCorrect = selected[0] === question.answer;
                        }
                    }
                    
                    // CODE
                    else if (question.type === "code") {
                        const textarea = document.getElementById(`code-answer-${qIndex}`);
                        const answer = textarea.value.trim();
                        isCorrect = answer === question.answer;
                    }
                    
                    // DRAG & DROP
                    else if (question.type === "drag-drop") {
                        const dragElements = optionsDiv.querySelectorAll('.draggable');
                        const order = Array.from(dragElements).map(el => el.innerText.trim());
                        
                        isCorrect = true;
                        for (let i = 0; i < question.answer.length; i++) {
                            if (order[i] !== question.answer[i]) {
                                isCorrect = false;
                                break;
                            }
                        }
                    }
                    
                    // Визуален feedback за всяка задача
                    if (isCorrect) {
                        questionDiv.style.borderLeft = "6px solid green";
                        questionDiv.style.backgroundColor = "rgba(34, 197, 94, 0.1)";
                    } else {
                        questionDiv.style.borderLeft = "6px solid red";
                        questionDiv.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                        allCorrect = false;
                        feedbackMessage += `\nЗадача ${qIndex + 1}: Грешен отговор`;
                    }
                });
                
                if (allCorrect) {
                    result.innerText = "Всички отговори са правилни!";
                    result.style.color = "green";
                    testSection.style.borderLeft = "6px solid green";
                    saveProgress(index, true);
                } else {
                    result.innerText = "Някои от отговорите са грешни:" + feedbackMessage;
                    result.style.color = "red";
                    testSection.style.borderLeft = "6px solid red";
                    saveProgress(index, false);
                }
            };
            
            // Добавяме опции за всеки въпрос
            questions.forEach((question, qIndex) => {
                const optionsDiv = document.getElementById(`test-options-${qIndex}`);
                
                if (question.type === "multiple" || question.type === "radio") {
                    const multiple = Array.isArray(question.answer);
                    
                    question.options.forEach((opt, i) => {
                        const label = document.createElement('label');
                        label.className = "checkbox-label";
                        
                        const input = document.createElement('input');
                        input.type = multiple ? "checkbox" : "radio";
                        input.name = `option-${qIndex}`;
                        input.value = i;
                        
                        label.appendChild(input);
                        label.appendChild(document.createTextNode(" " + opt));
                        optionsDiv.appendChild(label);
                    });
                }
                
                if (question.type === "code") {
                    const textarea = document.createElement('textarea');
                    textarea.rows = 5;
                    textarea.id = `code-answer-${qIndex}`;
                    optionsDiv.appendChild(textarea);
                }
                
                if (question.type === "drag-drop") {
                    question.options.forEach((opt) => {
                        const div = document.createElement('div');
                        div.className = "draggable";
                        div.draggable = true;
                        div.innerText = opt;
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
                }
            });
            
            // Показване на предишен резултат ако има
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
    
    // Бутон за начало на тест
    const startTestBtn = document.getElementById('start-test');
    if (startTestBtn) {
        startTestBtn.onclick = () => {
            const testSection = document.getElementById('test-section');
            if (testSection) {
                testSection.style.display = 'block';
                testSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }
    
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