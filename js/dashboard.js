(function () {
  "use strict";

  function initializeDashboard() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("mobileOverlay");
    const menuButton = document.getElementById("mobileMenuButton");
    const logoutButton = document.getElementById("logoutButton");
    const notificationButton = document.getElementById("notificationButton");
    const todayDate = document.getElementById("todayDate");
    const dashboardYear = document.getElementById("dashboardYear");


    if (todayDate) {
      todayDate.textContent = new Intl.DateTimeFormat("pt-PT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date());
    }

    if (dashboardYear) {
      dashboardYear.textContent = new Date().getFullYear();
    }

    function closeMobileMenu() {
      if (sidebar) sidebar.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-visible");
      if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    }

    function toggleMobileMenu() {
      if (!sidebar || !overlay) return;

      const isOpen = sidebar.classList.toggle("is-open");
      overlay.classList.toggle("is-visible", isOpen);

      if (menuButton) {
        menuButton.setAttribute("aria-expanded", String(isOpen));
      }
    }

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.addEventListener("click", toggleMobileMenu);
    }

    if (overlay) {
      overlay.addEventListener("click", closeMobileMenu);
    }

    if (sidebar) {
      sidebar.querySelectorAll(".nav-item").forEach(function (link) {
        link.addEventListener("click", closeMobileMenu);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    if (notificationButton) {
      notificationButton.addEventListener("click", function () {
        window.alert(
          "A área de notificações será implementada numa próxima etapa."
        );
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        const confirmed = window.confirm(
          "Deseja voltar ao ecrã de entrada?"
        );

        if (confirmed) {
          window.location.href = "index.html";
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDashboard);
  } else {
    initializeDashboard();
  }
})();

