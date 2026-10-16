/* =========================================
   EDUGEST — GESTÃO DE CURSOS
   Ficheiro: js/cursos.js
========================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const STORAGE_KEY = "sistemaEscolarCursos";

    const elements = {
        total: $("totalCourses"),
        active: $("activeCourses"),
        inactive: $("inactiveCourses"),
        tableBody: $("coursesTableBody"),
        count: $("coursesCount"),
        search: $("courseSearch"),
        statusFilter: $("courseStatusFilter"),
        modal: $("courseModal"),
        form: $("courseForm"),
        modalTitle: $("courseModalTitle"),
        formMessage: $("courseFormMessage"),
        id: $("courseId"),
        code: $("courseCode"),
        name: $("courseName"),
        duration: $("courseDuration"),
        status: $("courseStatus"),
        description: $("courseDescription"),
        addButton: $("addCourseButton"),
        closeButton: $("closeCourseModal"),
        cancelButton: $("cancelCourseButton"),
        backdrop: $("courseModalBackdrop"),
        menuButton: $("mobileMenuButton"),
        sidebar: $("sidebar"),
        overlay: $("mobileOverlay"),
        logoutButton: $("logoutButton")
    };

    const demoCourses = [
        {
            id: "curso-demo-1",
            code: "CUR001",
            name: "Informática",
            duration: "3 anos",
            status: "Ativo",
            description: "Formação em informática, programação e tecnologias digitais."
        },
        {
            id: "curso-demo-2",
            code: "CUR002",
            name: "Gestão Empresarial",
            duration: "4 anos",
            status: "Ativo",
            description: "Formação em gestão, administração e organização de empresas."
        },
        {
            id: "curso-demo-3",
            code: "CUR003",
            name: "Contabilidade",
            duration: "4 anos",
            status: "Inativo",
            description: "Formação em contabilidade, finanças e gestão de contas."
        }
    ];

    let courses = loadCourses();

    function loadCourses() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved === null) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCourses));
                return [...demoCourses];
            }

            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [...demoCourses];
        } catch (error) {
            console.error("Não foi possível carregar os cursos:", error);
            return [...demoCourses];
        }
    }

    function saveCourses() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
            return true;
        } catch (error) {
            console.error("Não foi possível guardar os cursos:", error);
            alert("Não foi possível guardar os cursos neste navegador.");
            return false;
        }
    }

    // Evita que os dados introduzidos sejam interpretados como HTML.
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

    function renderCourses() {
        const searchTerm = elements.search.value.trim().toLowerCase();
        const selectedStatus = elements.statusFilter.value;

        const filteredCourses = courses.filter((course) => {
            const searchableText = [
                course.code,
                course.name,
                course.duration,
                course.description,
                course.status
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);
            const matchesStatus =
                selectedStatus === "all" || course.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        elements.tableBody.innerHTML = "";

        if (filteredCourses.length === 0) {
            elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="course-empty-state">
                        Não foram encontrados cursos. Experimenta alterar a pesquisa
                        ou registar um novo curso.
                    </td>
                </tr>
            `;
        } else {
            elements.tableBody.innerHTML = filteredCourses.map((course) => {
                const statusClass =
                    course.status === "Ativo" ? "status-active" : "status-inactive";

                const description = course.description
                    ? `<span class="course-description-preview"
                             title="${escapeHTML(course.description)}">
                            ${escapeHTML(course.description)}
                       </span>`
                    : "";

                return `
                    <tr>
                        <td>
                            <span class="course-code">${escapeHTML(course.code)}</span>
                        </td>
                        <td>
                            <div class="course-name-cell">${escapeHTML(course.name)}</div>
                            ${description}
                        </td>
                        <td>
                            <span class="course-duration">
                                ${escapeHTML(course.duration)}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge ${statusClass}">
                                ${escapeHTML(course.status)}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button
                                    class="action-button edit-button"
                                    type="button"
                                    data-action="edit"
                                    data-id="${escapeHTML(course.id)}"
                                    aria-label="Editar ${escapeHTML(course.name)}"
                                    title="Editar"
                                >✎</button>
                                <button
                                    class="action-button delete-button"
                                    type="button"
                                    data-action="delete"
                                    data-id="${escapeHTML(course.id)}"
                                    aria-label="Eliminar ${escapeHTML(course.name)}"
                                    title="Eliminar"
                                >🗑</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        updateStatistics();

        const totalFiltered = filteredCourses.length;
        elements.count.textContent =
            `${totalFiltered} ${totalFiltered === 1 ? "curso encontrado" : "cursos encontrados"}`;
    }

    function updateStatistics() {
        elements.total.textContent = courses.length;
        elements.active.textContent =
            courses.filter((course) => course.status === "Ativo").length;
        elements.inactive.textContent =
            courses.filter((course) => course.status === "Inativo").length;
    }

    function showFormMessage(message, type = "error") {
        elements.formMessage.textContent = message;
        elements.formMessage.className = `form-message ${type}`;
    }

    function clearFormMessage() {
        elements.formMessage.textContent = "";
        elements.formMessage.className = "form-message";
    }

    function openModal(course = null) {
        elements.form.reset();
        clearFormMessage();

        elements.id.value = course ? course.id : "";
        elements.code.value = course ? course.code : "";
        elements.name.value = course ? course.name : "";
        elements.duration.value = course ? course.duration : "";
        elements.status.value = course ? course.status : "Ativo";
        elements.description.value = course ? course.description || "" : "";

        elements.modalTitle.textContent = course ? "Editar curso" : "Novo curso";

        elements.modal.classList.add("show");
        elements.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        window.setTimeout(() => elements.code.focus(), 50);
    }

    function closeModal() {
        elements.modal.classList.remove("show");
        elements.modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        elements.form.reset();
        clearFormMessage();
    }

    function handleSubmit(event) {
        event.preventDefault();
        clearFormMessage();

        const id = elements.id.value;
        const code = elements.code.value.trim().toUpperCase();
        const name = elements.name.value.trim();
        const duration = elements.duration.value.trim();
        const status = elements.status.value;
        const description = elements.description.value.trim();

        if (!code || !name || !duration || !status) {
            showFormMessage("Preenche todos os campos obrigatórios.");
            return;
        }

        const duplicateCode = courses.some((course) =>
            course.code.toLowerCase() === code.toLowerCase() &&
            course.id !== id
        );

        if (duplicateCode) {
            showFormMessage("Já existe um curso com esse código. Escolhe outro código.");
            elements.code.focus();
            return;
        }

        const courseData = {
            id: id || `curso-${Date.now()}`,
            code,
            name,
            duration,
            status,
            description
        };

        const previousCourses = [...courses];

        if (id) {
            courses = courses.map((course) =>
                course.id === id ? courseData : course
            );
        } else {
            courses.unshift(courseData);
        }

        if (!saveCourses()) {
            courses = previousCourses;
            return;
        }

        renderCourses();
        closeModal();
    }

    function editCourse(id) {
        const course = courses.find((item) => item.id === id);

        if (course) {
            openModal(course);
        }
    }

    function deleteCourse(id) {
        const course = courses.find((item) => item.id === id);
        if (!course) return;

        const confirmed = window.confirm(
            `Tens a certeza de que pretendes eliminar o curso "${course.name}"?`
        );

        if (!confirmed) return;

        const previousCourses = [...courses];
        courses = courses.filter((item) => item.id !== id);

        if (!saveCourses()) {
            courses = previousCourses;
            return;
        }

        renderCourses();
    }

    // Os botões de editar e eliminar são tratados pela tabela.
    elements.tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.action === "edit") {
            editCourse(id);
        } else if (button.dataset.action === "delete") {
            deleteCourse(id);
        }
    });

    elements.addButton.addEventListener("click", () => openModal());
    elements.closeButton.addEventListener("click", closeModal);
    elements.cancelButton.addEventListener("click", closeModal);
    elements.backdrop.addEventListener("click", closeModal);
    elements.form.addEventListener("submit", handleSubmit);

    elements.search.addEventListener("input", renderCourses);
    elements.statusFilter.addEventListener("change", renderCourses);

    // Menu lateral para dispositivos móveis.
    function closeMobileMenu() {
        elements.sidebar.classList.remove("open");
        elements.overlay.classList.remove("show");
        document.body.classList.remove("menu-open");
    }

    if (elements.menuButton && elements.sidebar && elements.overlay) {
        elements.menuButton.addEventListener("click", () => {
            elements.sidebar.classList.toggle("open");
            elements.overlay.classList.toggle("show");

            const isOpen = elements.sidebar.classList.contains("open");
            document.body.classList.toggle("menu-open", isOpen);
        });

        elements.overlay.addEventListener("click", closeMobileMenu);

        elements.sidebar.querySelectorAll(".nav-item").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });
    }

    // Terminar sessão na demonstração.
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener("click", () => {
            const confirmed = window.confirm("Queres terminar a sessão?");

            if (confirmed) {
                window.location.href = "index.html";
            }
        });
    }

    // Fechar o modal com a tecla Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
            closeMobileMenu();
        }
    });

    renderCourses();
});