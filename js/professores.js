document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "sistemaEscolarProfessores";
    const $ = (id) => document.getElementById(id);

    const form = $("teacherForm");
    const modal = $("teacherModal");
    const tableBody = $("teachersTableBody");

    let teachers = [];
    let editingId = null;

    function saveTeachers() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
            return true;
        } catch (error) {
            console.error("Erro ao guardar professores:", error);
            alert("Não foi possível guardar os dados neste navegador.");
            return false;
        }
    }

    function loadTeachers() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);
                teachers = Array.isArray(parsed) ? parsed : [];
                return;
            }

            teachers = [
                {
                    id: "demo-prof-1",
                    number: "PROF001",
                    name: "João Manuel",
                    subject: "Matemática",
                    phone: "923100001",
                    email: "joao@escola.ao",
                    status: "Ativo"
                },
                {
                    id: "demo-prof-2",
                    number: "PROF002",
                    name: "Ana Catarina",
                    subject: "Língua Portuguesa",
                    phone: "923100002",
                    email: "ana@escola.ao",
                    status: "Ativo"
                },
                {
                    id: "demo-prof-3",
                    number: "PROF003",
                    name: "Pedro António",
                    subject: "Física",
                    phone: "923100003",
                    email: "pedro@escola.ao",
                    status: "Inativo"
                }
            ];

            saveTeachers();
        } catch (error) {
            console.error("Erro ao carregar professores:", error);
            teachers = [];
            alert("Não foi possível ler os professores guardados.");
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function updateSubjectFilter() {
        const filter = $("subjectFilter");
        const current = filter.value;

        const subjects = [...new Set(
            teachers.map((teacher) => teacher.subject).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, "pt"));

        filter.innerHTML = '<option value="">Todas as disciplinas</option>';

        subjects.forEach((subject) => {
            const option = document.createElement("option");
            option.value = subject;
            option.textContent = subject;
            filter.appendChild(option);
        });

        if (subjects.includes(current)) {
            filter.value = current;
        }
    }

    function renderTeachers() {
        const search = $("teacherSearch").value.trim().toLowerCase();
        const subject = $("subjectFilter").value;
        const status = $("teacherStatusFilter").value;

        const filtered = teachers.filter((teacher) => {
            const matchesSearch = [
                teacher.number,
                teacher.name,
                teacher.subject,
                teacher.phone,
                teacher.email
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(search)
            );

            return matchesSearch &&
                (!subject || teacher.subject === subject) &&
                (!status || teacher.status === status);
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="teacher-empty">
                        Nenhum professor encontrado.
                    </td>
                </tr>`;
        } else {
            tableBody.innerHTML = filtered.map((teacher) => `
                <tr>
                    <td>${escapeHTML(teacher.number)}</td>
                    <td>
                        <div class="student-name-cell">
                            ${escapeHTML(teacher.name)}
                        </div>
                        ${teacher.email
                            ? `<span class="teacher-email">${escapeHTML(teacher.email)}</span>`
                            : ""}
                    </td>
                    <td>${escapeHTML(teacher.subject)}</td>
                    <td>${escapeHTML(teacher.phone || "—")}</td>
                    <td>
                        <span class="status-badge ${
                            teacher.status === "Ativo"
                                ? "status-active"
                                : "status-inactive"
                        }">${escapeHTML(teacher.status)}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button type="button" class="action-button"
                                data-action="edit"
                                data-id="${escapeHTML(teacher.id)}">
                                Editar
                            </button>
                            <button type="button"
                                class="action-button delete"
                                data-action="delete"
                                data-id="${escapeHTML(teacher.id)}">
                                Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        $("totalTeachers").textContent = teachers.length;
        $("activeTeachers").textContent =
            teachers.filter((teacher) => teacher.status === "Ativo").length;
        $("inactiveTeachers").textContent =
            teachers.filter((teacher) => teacher.status === "Inativo").length;

        $("teacherCount").textContent =
            `A mostrar ${filtered.length} de ${teachers.length} professor(es).`;

        updateSubjectFilter();
    }

    function openModal(teacher = null) {
        form.reset();
        $("teacherFormMessage").textContent = "";
        editingId = teacher ? teacher.id : null;

        $("teacherModalTitle").textContent =
            teacher ? "Editar professor" : "Novo professor";

        $("teacherNumber").value = teacher?.number ?? "";
        $("teacherName").value = teacher?.name ?? "";
        $("teacherSubject").value = teacher?.subject ?? "";
        $("teacherPhone").value = teacher?.phone ?? "";
        $("teacherEmail").value = teacher?.email ?? "";
        $("teacherStatus").value = teacher?.status ?? "Ativo";

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        $("teacherNumber").focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
        form.reset();
        editingId = null;
        $("teacherFormMessage").textContent = "";
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const number = $("teacherNumber").value.trim();
        const name = $("teacherName").value.trim();
        const subject = $("teacherSubject").value.trim();
        const phone = $("teacherPhone").value.trim();
        const email = $("teacherEmail").value.trim();
        const status = $("teacherStatus").value;
        const message = $("teacherFormMessage");

        if (!number || !name || !subject) {
            message.textContent =
                "Preenche os campos obrigatórios assinalados com *.";
            return;
        }

        const duplicate = teachers.some((teacher) =>
            teacher.number.toLowerCase() === number.toLowerCase() &&
            teacher.id !== editingId
        );

        if (duplicate) {
            message.textContent =
                "Já existe um professor com esse número.";
            return;
        }

        const previousTeachers = [...teachers];

        if (editingId) {
            teachers = teachers.map((teacher) =>
                teacher.id === editingId
                    ? {
                        ...teacher,
                        number,
                        name,
                        subject,
                        phone,
                        email,
                        status
                    }
                    : teacher
            );
        } else {
            teachers.push({
                id: window.crypto?.randomUUID?.() ??
                    `prof-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                number,
                name,
                subject,
                phone,
                email,
                status
            });
        }

        if (!saveTeachers()) {
            teachers = previousTeachers;
            return;
        }

        closeModal();
        renderTeachers();
    });

    $("addTeacherButton").addEventListener("click", () => openModal());

    $("closeTeacherModal").addEventListener("click", closeModal);
    $("cancelTeacherButton").addEventListener("click", closeModal);
    $("teacherModalBackdrop").addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const teacher = teachers.find(
            (item) => item.id === button.dataset.id
        );

        if (!teacher) return;

        if (button.dataset.action === "edit") {
            openModal(teacher);
            return;
        }

        if (button.dataset.action === "delete") {
            const confirmed = confirm(
                `Tens a certeza de que queres eliminar o professor ${teacher.name}?`
            );

            if (!confirmed) return;

            const previousTeachers = [...teachers];
            teachers = teachers.filter((item) => item.id !== teacher.id);

            if (!saveTeachers()) {
                teachers = previousTeachers;
                return;
            }

            renderTeachers();
        }
    });

    $("teacherSearch").addEventListener("input", renderTeachers);
    $("subjectFilter").addEventListener("change", renderTeachers);
    $("teacherStatusFilter").addEventListener("change", renderTeachers);

// Menu lateral em dispositivos móveis
    const sidebar = $("sidebar");
    const overlay = $("mobileOverlay");
    const menuButton = $("mobileMenuButton");

    function closeMobileMenu() {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
        menuButton?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    }

    function toggleMobileMenu() {
        if (!sidebar) {
            console.error("EduGest: barra lateral não encontrada.");
            return;
        }

        const isOpen = !sidebar.classList.contains("open");

        sidebar.classList.toggle("open", isOpen);
        overlay?.classList.toggle("show", isOpen);
        document.body.classList.toggle("menu-open", isOpen);

        menuButton?.setAttribute("aria-expanded", String(isOpen));
        menuButton?.setAttribute(
            "aria-label",
            isOpen ? "Fechar menu" : "Abrir menu"
        );
    }

    menuButton?.addEventListener("click", (event) => {
        event.preventDefault();
        toggleMobileMenu();
    });

    overlay?.addEventListener("click", closeMobileMenu);

    sidebar?.querySelectorAll(".nav-item").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    loadTeachers();
    renderTeachers();
});