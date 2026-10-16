"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const SUBJECT_KEY = "sistemaEscolarDisciplinas";
    const COURSE_KEY = "sistemaEscolarCursos";
    const TEACHER_KEY = "sistemaEscolarProfessores";

    const $ = (id) => document.getElementById(id);

    const el = {
        total: $("totalSubjects"),
        active: $("activeSubjects"),
        inactive: $("inactiveSubjects"),
        table: $("subjectsTableBody"),
        count: $("subjectsCount"),

        search: $("subjectSearch"),
        statusFilter: $("subjectStatusFilter"),
        courseFilter: $("subjectCourseFilter"),

        addButton: $("addSubjectButton"),
        modal: $("subjectModal"),
        backdrop: $("subjectModalBackdrop"),
        form: $("subjectForm"),
        modalTitle: $("subjectModalTitle"),
        message: $("subjectFormMessage"),
        saveButton: $("saveSubjectButton"),
        closeButton: $("closeSubjectModal"),
        cancelButton: $("cancelSubjectModal"),

        id: $("subjectId"),
        code: $("subjectCode"),
        name: $("subjectName"),
        course: $("subjectCourse"),
        teacher: $("subjectTeacher"),
        hours: $("subjectHours"),
        status: $("subjectStatus"),
        description: $("subjectDescription"),

        menuButton: $("mobileMenuButton"),
        sidebar: $("sidebar"),
        overlay: $("mobileOverlay"),
        logout: $("logoutButton")
    };

    let subjects = [];
    let courses = [];
    let teachers = [];

    function readStorage(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.error("Não foi possível ler os dados:", key, error);
            return [];
        }
    }

    function saveSubjects() {
        try {
            localStorage.setItem(SUBJECT_KEY, JSON.stringify(subjects));
            return true;
        } catch (error) {
            console.error("Não foi possível guardar as disciplinas.", error);
            showMessage("Não foi possível guardar. Verifica o armazenamento do navegador.", "error");
            return false;
        }
    }

    function createDemoDataIfNeeded() {
        courses = readStorage(COURSE_KEY);

        if (courses.length === 0) {
            courses = [
                {
                    id: "CUR001",
                    code: "CUR001",
                    name: "Informática",
                    duration: "3 anos",
                    status: "Ativo",
                    description: "Formação em informática."
                },
                {
                    id: "CUR002",
                    code: "CUR002",
                    name: "Gestão Empresarial",
                    duration: "4 anos",
                    status: "Ativo",
                    description: "Formação em gestão."
                },
                {
                    id: "CUR003",
                    code: "CUR003",
                    name: "Contabilidade",
                    duration: "4 anos",
                    status: "Inativo",
                    description: "Formação em contabilidade."
                }
            ];

            try {
                localStorage.setItem(COURSE_KEY, JSON.stringify(courses));
            } catch (error) {
                console.warn("Os cursos de demonstração não puderam ser guardados.", error);
            }
        }

        teachers = readStorage(TEACHER_KEY);
        subjects = readStorage(SUBJECT_KEY);

        if (subjects.length === 0) {
            const activeCourses = courses.filter(
                (course) => String(course.status || "Ativo").toLowerCase() === "ativo"
            );

            if (activeCourses.length > 0) {
                const course1 = activeCourses[0];
                const course2 = activeCourses[1] || activeCourses[0];

                subjects = [
                    {
                        id: "DISC001",
                        code: "DISC001",
                        name: "Matemática",
                        courseId: course1.id,
                        courseName: course1.name,
                        teacherId: "",
                        teacherName: "",
                        hours: 120,
                        status: "Ativo",
                        description: "Estudo de conceitos matemáticos."
                    },
                    {
                        id: "DISC002",
                        code: "DISC002",
                        name: "Informática Aplicada",
                        courseId: course2.id,
                        courseName: course2.name,
                        teacherId: "",
                        teacherName: "",
                        hours: 100,
                        status: "Ativo",
                        description: "Fundamentos e aplicações da informática."
                    }
                ];

                try {
                    localStorage.setItem(SUBJECT_KEY, JSON.stringify(subjects));
                } catch (error) {
                    console.warn("Os dados de demonstração não puderam ser guardados.", error);
                }
            }
        }
    }

    function getCourseId(course) {
        return String(course.id ?? course.code ?? "");
    }

    function getCourseName(course) {
        return String(course.name ?? course.nome ?? course.courseName ?? "Curso sem nome");
    }

    function getTeacherId(teacher) {
        return String(teacher.id ?? teacher.code ?? teacher.number ?? "");
    }

    function getTeacherName(teacher) {
        const firstName = teacher.firstName ?? teacher.primeiroNome ?? "";
        const lastName = teacher.lastName ?? teacher.apelido ?? "";

        return String(
            teacher.name ??
            teacher.nome ??
            teacher.fullName ??
            teacher.fullname ??
            `${firstName} ${lastName}`.trim() ??
            "Professor sem nome"
        ) || "Professor sem nome";
    }

    function getCourseById(id) {
        return courses.find((course) => getCourseId(course) === String(id));
    }

    function getTeacherById(id) {
        return teachers.find((teacher) => getTeacherId(teacher) === String(id));
    }

    function addOption(select, value, label) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = String(label);
        select.appendChild(option);
    }

    function refreshCourseOptions(selectedId = "") {
        const previousFilter = el.courseFilter.value || "all";

        el.course.innerHTML = "";
        addOption(el.course, "", "Seleciona um curso");

        el.courseFilter.innerHTML = "";
        addOption(el.courseFilter, "all", "Todos os cursos");

        courses.forEach((course) => {
            const id = getCourseId(course);
            const name = getCourseName(course);

            if (!id) return;

            addOption(el.courseFilter, id, name);

            const isInactive = String(course.status || "Ativo").toLowerCase() === "inativo";

            if (!isInactive || id === String(selectedId)) {
                addOption(
                    el.course,
                    id,
                    isInactive ? `${name} (Inativo)` : name
                );
            }
        });

        if (selectedId && !Array.from(el.course.options).some(
            (option) => option.value === String(selectedId)
        )) {
            addOption(el.course, selectedId, "Curso anteriormente associado");
        }

        el.courseFilter.value = Array.from(el.courseFilter.options).some(
            (option) => option.value === previousFilter
        ) ? previousFilter : "all";
    }

    function refreshTeacherOptions(selectedId = "") {
        el.teacher.innerHTML = "";
        addOption(el.teacher, "", "Sem professor atribuído");

        teachers.forEach((teacher) => {
            const id = getTeacherId(teacher);
            if (!id) return;

            const status = String(teacher.status ?? "Ativo").toLowerCase();

            if (status === "inativo" && id !== String(selectedId)) {
                return;
            }

            addOption(
                el.teacher,
                id,
                getTeacherName(teacher) + (status === "inativo" ? " (Inativo)" : "")
            );
        });

        if (selectedId && !Array.from(el.teacher.options).some(
            (option) => option.value === String(selectedId)
        )) {
            addOption(el.teacher, selectedId, "Professor anteriormente associado");
        }
    }

    function showMessage(message, type = "") {
        el.message.textContent = message;
        el.message.className = "form-message";

        if (type) {
            el.message.classList.add(type);
        }
    }

    function createCell(text, className = "") {
        const cell = document.createElement("td");
        cell.textContent = text ?? "";

        if (className) {
            cell.className = className;
        }

        return cell;
    }

    function renderStats() {
        const active = subjects.filter(
            (subject) => String(subject.status).toLowerCase() === "ativo"
        ).length;

        el.total.textContent = String(subjects.length);
        el.active.textContent = String(active);
        el.inactive.textContent = String(subjects.length - active);
    }

    function renderSubjects() {
        const query = el.search.value.trim().toLowerCase();
        const status = el.statusFilter.value;
        const courseId = el.courseFilter.value;

        const filtered = subjects.filter((subject) => {
            const course = getCourseById(subject.courseId);

            const courseName = course
                ? getCourseName(course)
                : String(subject.courseName || "");

            const teacher = getTeacherById(subject.teacherId);
            const teacherName = teacher
                ? getTeacherName(teacher)
                : String(subject.teacherName || "");

            const searchable = [
                subject.code,
                subject.name,
                courseName,
                teacherName,
                subject.description
            ].join(" ").toLowerCase();

            const matchesQuery = searchable.includes(query);
            const matchesStatus = status === "all" || subject.status === status;
            const matchesCourse = courseId === "all" ||
                String(subject.courseId) === String(courseId);

            return matchesQuery && matchesStatus && matchesCourse;
        });

        el.table.replaceChildren();

        if (filtered.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.className = "subject-empty-state";
            cell.textContent = subjects.length === 0
                ? "Ainda não existem disciplinas registadas."
                : "Nenhuma disciplina corresponde à pesquisa.";

            row.appendChild(cell);
            el.table.appendChild(row);
        } else {
            filtered.forEach((subject) => {
                const row = document.createElement("tr");
                const course = getCourseById(subject.courseId);
                const teacher = getTeacherById(subject.teacherId);

                const courseName = course
                    ? getCourseName(course)
                    : String(subject.courseName || "Curso não encontrado");

                const teacherName = teacher
                    ? getTeacherName(teacher)
                    : String(subject.teacherName || "Não atribuído");

                const codeCell = createCell();
                const codeBadge = document.createElement("span");
                codeBadge.className = "subject-code";
                codeBadge.textContent = String(subject.code || "—");
                codeCell.appendChild(codeBadge);

                const nameCell = createCell();
                const nameWrapper = document.createElement("div");
                nameWrapper.className = "subject-name-cell";
                nameWrapper.textContent = String(subject.name || "Sem nome");
                nameCell.appendChild(nameWrapper);

                if (subject.description) {
                    const description = document.createElement("span");
                    description.className = "subject-description";
                    description.textContent = String(subject.description);
                    description.title = String(subject.description);
                    nameCell.appendChild(description);
                }

                const statusCell = createCell();
                const statusBadge = document.createElement("span");
                const isActive = String(subject.status).toLowerCase() === "ativo";

                statusBadge.className = "status-badge " +
                    (isActive ? "status-active" : "status-inactive");
                statusBadge.textContent = isActive ? "Ativa" : "Inativa";
                statusCell.appendChild(statusBadge);

                row.appendChild(codeCell);
                row.appendChild(nameCell);
                row.appendChild(createCell(courseName));
                row.appendChild(createCell(teacherName));
                row.appendChild(createCell(`${Number(subject.hours) || 0} h`));
                row.appendChild(statusCell);

                const actionsCell = createCell();
                const actions = document.createElement("div");
                actions.className = "action-buttons";

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.className = "action-button";
                editButton.textContent = "Editar";
                editButton.setAttribute("aria-label", `Editar ${subject.name}`);
                editButton.addEventListener("click", () => openModal(subject.id));

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "action-button";
                deleteButton.textContent = "Eliminar";
                deleteButton.setAttribute("aria-label", `Eliminar ${subject.name}`);
                deleteButton.addEventListener("click", () => deleteSubject(subject.id));

                actions.append(editButton, deleteButton);
                actionsCell.appendChild(actions);
                row.appendChild(actionsCell);

                el.table.appendChild(row);
            });
        }

        el.count.textContent = `${filtered.length} ${
            filtered.length === 1 ? "disciplina" : "disciplinas"
        }`;

        renderStats();
    }

    function openModal(subjectId = "") {
        el.form.reset();
        el.id.value = "";
        el.status.value = "Ativo";
        showMessage("");

        const subject = subjects.find(
            (item) => String(item.id) === String(subjectId)
        );

        refreshCourseOptions(subject ? subject.courseId : "");
        refreshTeacherOptions(subject ? subject.teacherId : "");

        if (subject) {
            el.modalTitle.textContent = "Editar disciplina";
            el.saveButton.textContent = "Guardar alterações";

            el.id.value = subject.id;
            el.code.value = subject.code || "";
            el.name.value = subject.name || "";
            el.course.value = String(subject.courseId || "");
            el.teacher.value = String(subject.teacherId || "");
            el.hours.value = subject.hours ?? "";
            el.status.value = subject.status || "Ativo";
            el.description.value = subject.description || "";
        } else {
            el.modalTitle.textContent = "Nova disciplina";
            el.saveButton.textContent = "Guardar disciplina";
        }

        el.modal.classList.add("show");
        el.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        window.setTimeout(() => el.code.focus(), 50);
    }

    function closeModal() {
        el.modal.classList.remove("show");
        el.modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        showMessage("");
    }

    function handleSubmit(event) {
        event.preventDefault();
        showMessage("");

        const id = el.id.value.trim();
        const code = el.code.value.trim();
        const name = el.name.value.trim();
        const courseId = el.course.value;
        const teacherId = el.teacher.value;
        const hours = Number(el.hours.value);
        const status = el.status.value;
        const description = el.description.value.trim();

        if (!code || !name || !courseId || !el.hours.value) {
            showMessage("Preenche todos os campos obrigatórios.", "error");
            return;
        }

        if (!Number.isInteger(hours) || hours < 1 || hours > 10000) {
            showMessage("A carga horária deve ser um número inteiro entre 1 e 10000.", "error");
            return;
        }

        if (!["Ativo", "Inativo"].includes(status)) {
            showMessage("Seleciona um estado válido.", "error");
            return;
        }

        const duplicate = subjects.some((subject) =>
            String(subject.code).toLowerCase() === code.toLowerCase() &&
            String(subject.id) !== String(id)
        );

        if (duplicate) {
            showMessage("Já existe uma disciplina com esse código.", "error");
            el.code.focus();
            return;
        }

        const course = getCourseById(courseId);

        if (!course) {
            showMessage("Seleciona um curso válido.", "error");
            return;
        }

        const teacher = teacherId ? getTeacherById(teacherId) : null;

        const record = {
            id: id || `disc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            code,
            name,
            courseId: String(courseId),
            courseName: getCourseName(course),
            teacherId: teacher ? getTeacherId(teacher) : "",
            teacherName: teacher ? getTeacherName(teacher) : "",
            hours,
            status,
            description
        };

        const previousSubjects = [...subjects];

        if (id) {
            const index = subjects.findIndex(
                (subject) => String(subject.id) === String(id)
            );

            if (index === -1) {
                showMessage("Não foi possível encontrar a disciplina para editar.", "error");
                return;
            }

            subjects[index] = record;
        } else {
            subjects.push(record);
        }

        if (!saveSubjects()) {
            subjects = previousSubjects;
            return;
        }

        renderSubjects();
        closeModal();
    }

    function deleteSubject(subjectId) {
        const subject = subjects.find(
            (item) => String(item.id) === String(subjectId)
        );

        if (!subject) return;

        const confirmed = window.confirm(
            `Tens a certeza de que queres eliminar a disciplina "${subject.name}"?`
        );

        if (!confirmed) return;

        const previousSubjects = [...subjects];

        subjects = subjects.filter(
            (item) => String(item.id) !== String(subjectId)
        );

        if (!saveSubjects()) {
            subjects = previousSubjects;
            renderSubjects();
            return;
        }

        renderSubjects();
    }

    function closeMobileMenu() {
        if (el.sidebar) el.sidebar.classList.remove("open");
        if (el.overlay) el.overlay.classList.remove("show");
        if (el.menuButton) {
            el.menuButton.setAttribute("aria-expanded", "false");
            el.menuButton.setAttribute("aria-label", "Abrir menu");
        }
        document.body.classList.remove("menu-open");
    }

    function toggleMobileMenu() {
        if (!el.sidebar || !el.overlay) return;

        const isOpen = el.sidebar.classList.toggle("open");
        el.overlay.classList.toggle("show", isOpen);
        document.body.classList.toggle("menu-open", isOpen);

        if (el.menuButton) {
            el.menuButton.setAttribute("aria-expanded", String(isOpen));
            el.menuButton.setAttribute(
                "aria-label",
                isOpen ? "Fechar menu" : "Abrir menu"
            );
        }
    }

    function setupEvents() {
        el.addButton.addEventListener("click", () => openModal());
        el.form.addEventListener("submit", handleSubmit);

        el.closeButton.addEventListener("click", closeModal);
        el.cancelButton.addEventListener("click", closeModal);
        el.backdrop.addEventListener("click", closeModal);

        el.search.addEventListener("input", renderSubjects);
        el.statusFilter.addEventListener("change", renderSubjects);
        el.courseFilter.addEventListener("change", renderSubjects);

        if (el.menuButton) {
            el.menuButton.addEventListener("click", toggleMobileMenu);
        }

        if (el.overlay) {
            el.overlay.addEventListener("click", closeMobileMenu);
        }

        if (el.sidebar) {
            el.sidebar.querySelectorAll("a").forEach((link) => {
                link.addEventListener("click", closeMobileMenu);
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (el.modal.classList.contains("show")) {
                    closeModal();
                }
                closeMobileMenu();
            }
        });

        if (el.logout) {
            el.logout.addEventListener("click", () => {
                const confirmed = window.confirm("Queres terminar a sessão?");

                if (confirmed) {
                    window.location.href = "index.html";
                }
            });
        }
    }

    function init() {
        createDemoDataIfNeeded();
        refreshCourseOptions();
        refreshTeacherOptions();
        setupEvents();
        renderSubjects();

        console.log("EduGest: gestão de disciplinas iniciada com sucesso.");
    }

    init();
});