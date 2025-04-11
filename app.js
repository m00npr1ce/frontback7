// Получение DOM-элементов
const notesList = document.getElementById("notesList");
const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const offlineBanner = document.getElementById("offlineBanner");

// app.js

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .then((registration) => {
                console.log("Service Worker зарегистрирован", registration);
            })
            .catch((error) => {
                console.log("Ошибка регистрации Service Worker", error);
            });
    });
}

// Загрузка заметок из localStorage
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.innerHTML = "<li>Нет заметок</li>";
        return;
    }

    notes.forEach(note => {
        const li = document.createElement("li");

        const span = document.createElement("span");
        span.textContent = note.text;
        span.style.flexGrow = "1";
        span.style.cursor = "pointer";

        // Редактирование при клике
        span.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = note.text;
            input.style.flexGrow = "1";

            // Обновление заметки при потере фокуса или нажатии Enter
            function saveEdit() {
                const updatedText = input.value.trim();
                if (updatedText === "") return;

                note.text = updatedText;
                updateNote(note);
                loadNotes();
            }

            input.addEventListener("blur", saveEdit);
            input.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    saveEdit();
                }
            });

            li.replaceChild(input, span);
            input.focus();
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Удалить";
        delBtn.addEventListener("click", () => deleteNote(note.id));

        li.appendChild(span);
        li.appendChild(delBtn);
        notesList.appendChild(li);
    });

}


// Генерация уникального ID (можно упростить)
function generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

function saveNote(text) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const newNote = {
        id: generateId(),
        text: text.trim()
    };
    notes.push(newNote);
    localStorage.setItem("notes", JSON.stringify(notes));
}

function deleteNote(id) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes();
}

function updateNote(updatedNote) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes = notes.map(note => note.id === updatedNote.id ? updatedNote : note);
    localStorage.setItem("notes", JSON.stringify(notes));
}

function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineBanner.style.display = "none";
    } else {
        offlineBanner.style.display = "block";
    }
}

// Добавление новой заметки
addNoteBtn.addEventListener("click", () => {
    const text = noteInput.value;
    if (text.trim() === "") return;

    saveNote(text);
    noteInput.value = "";
    loadNotes();
});
// Подключаем слушатели событий для отслеживания подключения/отключения
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
// Вызываем при старте
loadNotes();
updateOnlineStatus();
