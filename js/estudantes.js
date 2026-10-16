document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "sistemaEscolarEstudantes";

    const $ = (id) => document.getElementById(id);

    const form = $("studentForm");
    const modal = $("studentModal");
    const tableBody = $("studentsTableBody");

    let students = [];
    let editingId = null;

    function loadStudents() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);
                students = Array.isArray(parsed) ? parsed : [];
            } else {
                students = [
                    {
                        id: "demo-1",
                        number: "EST001",
                        name: "Ana Manuel",
                        className: "10.ª A",
                        phone: "923000001",
                        status: "Ativo"
                    },
                    {
                        id: "demo-2",
                        number: "EST002",
                        name: "Carlos João",
                        className: "10.ª B",
                        phone: "923000002",
                        status: "Ativo"
                    },
                    {
                        id: "demo-3",
                        number: "EST003",
                        name: "Maria José",
                        className: "11.ª A",
                        phone: "923000003",
                        status: "Inativo"
                    }
                ];

                saveStudents();
            }
        } catch (error) {
            console.error("Não foi possível carregar os estudantes.", error);
            students = [];
            alert("Não foi possível ler os dados guardados no navegador.");
        }
    }

    function saveStudents() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
            return true;
        } catch (error) {
            console.error("Não foi possível guardar os estudantes.", error);
            alert("Não foi possível guardar os dados. Verifica o espaço disponível no navegador.");
            return false;
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

    function renderStudents() {
        const search = $("studentSearch").value.trim().toLowerCase();
        const selectedClass = $("classFilter").value;
        const selectedStatus = $("statusFilter").value;

        const filtered = students.filter((student) => {
            const matchesSearch = [
                student.name,
                student.number,
                student.className,
                student.phone
            ].some((value) => String(value ?? "").toLowerCase().includes(search));

            const matchesClass =
                !selectedClass || student.className === selectedClass;

            const matchesStatus =
                !selectedStatus || student.status === selectedStatus;

            return matchesSearch && matchesClass && matchesStatus;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">Nenhum estudante encontrado.</td>
                </tr>`;
        } else {
            tableBody.innerHTML = filtered.map((student) => `
                <tr>
                    <td>${escapeHTML(student.number)}</td>
                    <td class="student-name-cell">${escapeHTML(student.name)}</td>
                    <td>${escapeHTML(student.className)}</td>
                    <td>${escapeHTML(student.phone || "—")}</td>
                    <td>
                        <span class="status-badge ${
                            student.status === "Ativo"
                                ? "status-active"
                                : "status-inactive"
                        }">${escapeHTML(student.status)}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button type="button" class="action-button"
                                data-action="edit"
                                data-id="${escapeHTML(student.id)}">
                                Editar
                            </button>
                            <button type="button"
                                class="action-button delete"
                                data-action="delete"
                                data-id="${escapeHTML(student.id)}">
                                Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        $("totalStudents").textContent = students.length;
        $("activeStudents").textContent =
            students.filter((student) => student.status === "Ativo").length;
        $("inactiveStudents").textContent =
            students.filter((student) => student.status === "Inativo").length;

        $("studentCount").textContent =
            `A mostrar ${filtered.length} de ${students.length} estudante(s).`;

        updateClassFilter();
    }

    function updateClassFilter() {
        const filter = $("classFilter");
        const currentValue = filter.value;

        const classes = [...new Set(
            students
                .map((student) => student.className)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, "pt"));

        filter.innerHTML = '<option value="">Todas as turmas</option>';

        classes.forEach((className) => {
            const option = document.createElement("option");
            option.value = className;
            option.textContent = className;
            filter.appendChild(option);
        });

        if (classes.includes(currentValue)) {
            filter.value = currentValue;
        }
    }

    function openModal(student = null) {
        form.reset();
        $("studentFormMessage").textContent = "";
        editingId = student ? student.id : null;

        $("studentModalTitle").textContent =
            student ? "Editar estudante" : "Novo estudante";

        $("studentId").value = student?.id ?? "";
        $("studentNumber").value = student?.number ?? "";
        $("studentName").value = student?.name ?? "";
        $("studentClass").value = student?.className ?? "";
        $("studentPhone").value = student?.phone ?? "";
        $("studentStatus").value = student?.status ?? "Ativo";

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        $("studentNumber").focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
        form.reset();
        editingId = null;
        $("studentFormMessage").textContent = "";
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const number = $("studentNumber").value.trim();
        const name = $("studentName").value.trim();
        const className = $("studentClass").value.trim();
        const phone = $("studentPhone").value.trim();
        const status = $("studentStatus").value;

        const message = $("studentFormMessage");

        if (!number || !name || !className) {
            message.textContent = "Preenche todos os campos obrigatórios.";
            return;
        }

        const duplicate = students.some((student) =>
            student.number.toLowerCase() === number.toLowerCase() &&
            student.id !== editingId
        );

        if (duplicate) {
            message.textContent =
                "Já existe um estudante com esse número.";
            return;
        }

        const previousStudents = [...students];

        if (editingId) {
            students = students.map((student) =>
                student.id === editingId
                    ? { ...student, number, name, className, phone, status }
                    : student
            );
        } else {
            students.push({
                id: window.crypto?.randomUUID?.() ??
                    `student-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                number,
                name,
                className,
                phone,
                status
            });
        }

        if (!saveStudents()) {
            students = previousStudents;
            return;
        }

        closeModal();
        renderStudents();
    });

    $("addStudentButton").addEventListener("click", () => openModal());

    $("closeStudentModal").addEventListener("click", closeModal);
    $("cancelStudentButton").addEventListener("click", closeModal);
    $("modalBackdrop").addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const student = students.find(
            (item) => item.id === button.dataset.id
        );

        if (!student) return;

        if (button.dataset.action === "edit") {
            openModal(student);
        }

        if (button.dataset.action === "delete") {
            const confirmed = confirm(
                `Tens a certeza de que queres eliminar ${student.name}?`
            );

            if (!confirmed) return;

            const previousStudents = [...students];
            students = students.filter((item) => item.id !== student.id);

            if (!saveStudents()) {
                students = previousStudents;
                return;
            }

            renderStudents();
        }
    });

    $("studentSearch").addEventListener("input", renderStudents);
    $("classFilter").addEventListener("change", renderStudents);
    $("statusFilter").addEventListener("change", renderStudents);

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

    // Terminar sessão de demonstração
    $("logoutButton")?.addEventListener("click", () => {
        if (confirm("Queres terminar a sessão?")) {
            window.location.href = "index.html";
        }
    });

    loadStudents();
    renderStudents();
});

