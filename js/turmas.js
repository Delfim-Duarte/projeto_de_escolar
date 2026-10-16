/* =========================================
   EDUGEST — GESTÃO DE TURMAS
   Ficheiro: js/turmas.js
========================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const CLASS_KEY = "sistemaEscolarTurmas";
    const COURSE_KEY = "sistemaEscolarCursos";

    const el = {
        total: $("totalClasses"),
        active: $("activeClasses"),
        inactive: $("inactiveClasses"),
        table: $("classesTableBody"),
        count: $("classesCount"),
        search: $("classSearch"),
        filter: $("classStatusFilter"),
        modal: $("classModal"),
        backdrop: $("classModalBackdrop"),
        form: $("classForm"),
        modalTitle: $("classModalTitle"),
        message: $("classFormMessage"),
        id: $("classId"),
        code: $("classCode"),
        name: $("className"),
        course: $("classCourse"),
        year: $("classYear"),
        room: $("classRoom"),
        status: $("classStatus"),
        add: $("addClassButton"),
        close: $("closeClassModal"),
        cancel: $("cancelClassButton"),
        menuButton: $("mobileMenuButton"),
        sidebar: $("sidebar"),
        overlay: $("mobileOverlay"),
        logout: $("logoutButton")
    };

    const demoCourses = [
        {
            id: "curso-demo-1",
            code: "CUR001",
            name: "Informática",
            duration: "3 anos",
            status: "Ativo",
            description: "Formação em informática."
        },
        {
            id: "curso-demo-2",
            code: "CUR002",
            name: "Gestão Empresarial",
            duration: "4 anos",
            status: "Ativo",
            description: "Formação em gestão."
        },
        {
            id: "curso-demo-3",
            code: "CUR003",
            name: "Contabilidade",
            duration: "4 anos",
            status: "Inativo",
            description: "Formação em contabilidade."
        }
    ];

    const demoClasses = [
        {
            id: "turma-demo-1",
            code: "TUR001",
            name: "10.ª Informática A",
            courseCode: "CUR001",
            courseName: "Informática",
            year: "2026/2027",
            room: "Bloco A, Sala 1",
            status: "Ativo"
        },
        {
            id: "turma-demo-2",
            code: "TUR002",
            name: "11.ª Gestão A",
            courseCode: "CUR002",
            courseName: "Gestão Empresarial",
            year: "2026/2027",
            room: "Bloco B, Sala 3",
            status: "Ativo"
        },
        {
            id: "turma-demo-3",
            code: "TUR003",
            name: "12.ª Contabilidade B",
            courseCode: "CUR003",
            courseName: "Contabilidade",
            year: "2025/2026",
            room: "Bloco A, Sala 5",
            status: "Inativo"
        }
    ];

    function readStorage(key, fallback) {
        try {
            const saved = localStorage.getItem(key);

            if (saved === null) {
                localStorage.setItem(key, JSON.stringify(fallback));
                return [...fallback];
            }

            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [...fallback];
        } catch (error) {
            console.error(`Erro ao ler ${key}:`, error);
            return [...fallback];
        }
    }

    let courses = readStorage(COURSE_KEY, demoCourses);
    let classes = readStorage(CLASS_KEY, demoClasses);

    function saveClasses() {
        try {
            localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
            return true;
        } catch (error) {
            console.error("Erro ao guardar turmas:", error);
            alert("Não foi possível guardar as turmas neste navegador.");
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function getCourseName(courseCode) {
        const course = courses.find((item) => item.code === courseCode);
        return course ? course.name : "";
    }

    function refreshCourseOptions(selectedCode = "") {
        const availableCourses = courses.filter(
            (course) => course.status !== "Inativo" || course.code === selectedCode
        );

        el.course.innerHTML = '<option value="">Seleciona um curso</option>';

        availableCourses.forEach((course) => {
            const option = document.createElement("option");
            option.value = course.code;
            option.textContent = `${course.code} — ${course.name}`;
            el.course.appendChild(option);
        });

        if (selectedCode && !availableCourses.some((course) => course.code === selectedCode)) {
            const option = document.createElement("option");
            option.value = selectedCode;
            option.textContent = `${selectedCode} — Curso já não disponível`;
            el.course.appendChild(option);
        }

        el.course.value = selectedCode;
    }

    function updateStatistics() {
        el.total.textContent = classes.length;
        el.active.textContent =
            classes.filter((item) => item.status === "Ativo").length;
        el.inactive.textContent =
            classes.filter((item) => item.status === "Inativo").length;
    }

    function renderClasses() {
        const term = el.search.value.trim().toLowerCase();
        const selectedStatus = el.filter.value;

        const filtered = classes.filter((item) => {
            const courseName = item.courseName || getCourseName(item.courseCode);

            const searchText = [
                item.code,
                item.name,
                item.courseCode,
                courseName,
                item.year,
                item.room,
                item.status
            ].join(" ").toLowerCase();

            const matchesSearch = searchText.includes(term);
            const matchesStatus =
                selectedStatus === "all" || item.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            el.table.innerHTML = `
                <tr>
                    <td colspan="7" class="class-empty-state">
                        Não foram encontradas turmas. Altera a pesquisa
                        ou regista uma nova turma.
                    </td>
                </tr>
            `;
        } else {
            el.table.innerHTML = filtered.map((item) => {
                const courseName = item.courseName || getCourseName(item.courseCode);
                const statusClass =
                    item.status === "Ativo" ? "status-active" : "status-inactive";

                return `
                    <tr>
                        <td>
                            <span class="class-code">${escapeHTML(item.code)}</span>
                        </td>
                        <td>
                            <span class="class-name-cell">${escapeHTML(item.name)}</span>
                        </td>
                        <td>${escapeHTML(courseName || item.courseCode || "—")}</td>
                        <td>${escapeHTML(item.year)}</td>
                        <td>${escapeHTML(item.room || "—")}</td>
                        <td>
                            <span class="status-badge ${statusClass}">
                                ${escapeHTML(item.status)}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button
                                    class="action-button edit-button"
                                    type="button"
                                    data-action="edit"
                                    data-id="${escapeHTML(item.id)}"
                                    aria-label="Editar ${escapeHTML(item.name)}"
                                    title="Editar"
                                >✎</button>
                                <button
                                    class="action-button delete-button"
                                    type="button"
                                    data-action="delete"
                                    data-id="${escapeHTML(item.id)}"
                                    aria-label="Eliminar ${escapeHTML(item.name)}"
                                    title="Eliminar"
                                >🗑</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        updateStatistics();

        el.count.textContent =
            `${filtered.length} ${filtered.length === 1 ? "turma encontrada" : "turmas encontradas"}`;
    }

    function showMessage(message, type = "error") {
        el.message.textContent = message;
        el.message.className = `form-message ${type}`;
    }

    function clearMessage() {
        el.message.textContent = "";
        el.message.className = "form-message";
    }

    function openModal(item = null) {
        el.form.reset();
        clearMessage();

        el.id.value = item ? item.id : "";
        el.code.value = item ? item.code : "";
        el.name.value = item ? item.name : "";
        el.year.value = item ? item.year : "2026/2027";
        el.room.value = item ? item.room || "" : "";
        el.status.value = item ? item.status : "Ativo";

        refreshCourseOptions(item ? item.courseCode : "");

        el.modalTitle.textContent = item ? "Editar turma" : "Nova turma";
        el.modal.classList.add("show");
        el.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        window.setTimeout(() => el.code.focus(), 50);
    }

    function closeModal() {
        el.modal.classList.remove("show");
        el.modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        el.form.reset();
        clearMessage();
    }

    function handleSubmit(event) {
        event.preventDefault();
        clearMessage();

        const id = el.id.value;
        const code = el.code.value.trim().toUpperCase();
        const name = el.name.value.trim();
        const courseCode = el.course.value;
        const courseName = getCourseName(courseCode);
        const year = el.year.value.trim();
        const room = el.room.value.trim();
        const status = el.status.value;

        if (!code || !name || !courseCode || !year || !status) {
            showMessage("Preenche todos os campos obrigatórios.");
            return;
        }

        if (!courseName) {
            showMessage("O curso selecionado já não está disponível. Escolhe outro.");
            return;
        }

        const duplicate = classes.some((item) =>
            item.code.toLowerCase() === code.toLowerCase() && item.id !== id
        );

        if (duplicate) {
            showMessage("Já existe uma turma com esse código. Escolhe outro.");
            el.code.focus();
            return;
        }

        const classData = {
            id: id || `turma-${Date.now()}`,
            code,
            name,
            courseCode,
            courseName,
            year,
            room,
            status
        };

        const previousClasses = [...classes];

        if (id) {
            classes = classes.map((item) => item.id === id ? classData : item);
        } else {
            classes.unshift(classData);
        }

        if (!saveClasses()) {
            classes = previousClasses;
            return;
        }

        renderClasses();
        closeModal();
    }

    function editClass(id) {
        const item = classes.find((entry) => entry.id === id);
        if (item) openModal(item);
    }

    function deleteClass(id) {
        const item = classes.find((entry) => entry.id === id);
        if (!item) return;

        if (!window.confirm(`Queres eliminar a turma "${item.name}"?`)) {
            return;
        }

        const previousClasses = [...classes];
        classes = classes.filter((entry) => entry.id !== id);

        if (!saveClasses()) {
            classes = previousClasses;
            return;
        }

        renderClasses();
    }

    el.table.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        if (button.dataset.action === "edit") {
            editClass(button.dataset.id);
        } else if (button.dataset.action === "delete") {
            deleteClass(button.dataset.id);
        }
    });

    el.add.addEventListener("click", () => openModal());
    el.close.addEventListener("click", closeModal);
    el.cancel.addEventListener("click", closeModal);
    el.backdrop.addEventListener("click", closeModal);
    el.form.addEventListener("submit", handleSubmit);
    el.search.addEventListener("input", renderClasses);
    el.filter.addEventListener("change", renderClasses);

    function closeMobileMenu() {
        el.sidebar?.classList.remove("open");
        el.overlay?.classList.remove("show");
        document.body.classList.remove("menu-open");
    }

    if (el.menuButton && el.sidebar && el.overlay) {
        el.menuButton.addEventListener("click", () => {
            el.sidebar.classList.toggle("open");
            el.overlay.classList.toggle("show");

            document.body.classList.toggle(
                "menu-open",
                el.sidebar.classList.contains("open")
            );
        });

        el.overlay.addEventListener("click", closeMobileMenu);

        el.sidebar.querySelectorAll(".nav-item").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });
    }

    if (el.logout) {
        el.logout.addEventListener("click", () => {
            if (window.confirm("Queres terminar a sessão?")) {
                window.location.href = "index.html";
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
            closeMobileMenu();
        }
    });

    renderClasses();
});