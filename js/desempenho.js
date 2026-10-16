/* EDUGEST — MÓDULO DE DESEMPENHO
   Ficheiro: js/desempenho.js
   Esta versão controla apenas a interface demonstrativa.
*/

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const el = {
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("mobileOverlay"),
    menuButton: document.getElementById("mobileMenuButton"),
    closeSidebar: document.getElementById("closeSidebar"),
    logout: document.getElementById("logoutButton"),
    schoolYear: document.getElementById("schoolYear"),
    trimester: document.getElementById("trimester"),
    course: document.getElementById("courseFilter"),
    classFilter: document.getElementById("classFilter"),
    applyFilters: document.getElementById("applyFilters"),
    periodLabel: document.getElementById("periodLabel"),
    shortcutFeedback: document.getElementById("shortcutFeedback"),
    rankingButton: document.getElementById("rankingButton"),
    progressButton: document.getElementById("progressButton")
  };

  function openMobileMenu() {
    if (!el.sidebar || !el.overlay) return;

    el.sidebar.classList.add("open");
    el.overlay.classList.add("show");
    document.body.classList.add("menu-open");

    if (el.menuButton) {
      el.menuButton.setAttribute("aria-expanded", "true");
      el.menuButton.setAttribute("aria-label", "Fechar menu");
    }
  }

  function closeMobileMenu() {
    if (!el.sidebar || !el.overlay) return;

    el.sidebar.classList.remove("open");
    el.overlay.classList.remove("show");
    document.body.classList.remove("menu-open");

    if (el.menuButton) {
      el.menuButton.setAttribute("aria-expanded", "false");
      el.menuButton.setAttribute("aria-label", "Abrir menu");
    }
  }

  function toggleMobileMenu() {
    if (el.sidebar && el.sidebar.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (el.menuButton) {
    el.menuButton.addEventListener("click", toggleMobileMenu);
  }

  if (el.closeSidebar) {
    el.closeSidebar.addEventListener("click", closeMobileMenu);
  }

  if (el.overlay) {
    el.overlay.addEventListener("click", closeMobileMenu);
  }

  if (el.sidebar) {
    el.sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileMenu();
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 850) {
      closeMobileMenu();
    }
  });

  function updatePeriodLabel() {
    if (!el.trimester || !el.periodLabel) return;

    const periods = {
      "1": "1.º trimestre",
      "2": "2.º trimestre",
      "3": "3.º trimestre"
    };

    el.periodLabel.textContent =
      periods[el.trimester.value] || "Trimestre";
  }

  function applyDemoFilters() {
    updatePeriodLabel();

    const year = el.schoolYear ? el.schoolYear.value : "";
    const trimester = el.trimester ? el.trimester.value : "";
    const course = el.course
      ? el.course.options[el.course.selectedIndex].text
      : "Todos os cursos";
    const className = el.classFilter
      ? el.classFilter.options[el.classFilter.selectedIndex].text
      : "Todas as turmas";

    const yearPill = document.querySelector(".year-pill");

    if (yearPill && year) {
      yearPill.textContent = year;
    }

    /*
      Os indicadores ainda são demonstrativos.
      Não alteramos os valores académicos com base nos filtros
      até existir ligação aos registos reais.
    */
    const notice = document.getElementById("demoNotice");

    if (notice) {
      const message = notice.querySelector("p");

      if (message) {
        message.textContent =
          "Modo de demonstração: filtros selecionados — " +
          year + ", " +
          (el.periodLabel ? el.periodLabel.textContent : trimester) +
          ", " + course + ", " + className +
          ". Os indicadores ainda não estão ligados a notas reais.";
      }
    }

    if (el.shortcutFeedback) {
      el.shortcutFeedback.textContent =
        "Filtros aplicados à seleção visual. Os valores apresentados continuam a ser exemplos.";
    }
  }

  if (el.applyFilters) {
    el.applyFilters.addEventListener("click", applyDemoFilters);
  }

  if (el.trimester) {
    el.trimester.addEventListener("change", updatePeriodLabel);
  }

  if (el.rankingButton && el.shortcutFeedback) {
    el.rankingButton.addEventListener("click", function () {
      el.shortcutFeedback.textContent =
        "O ranking será implementado numa próxima etapa, com cálculo das médias e confirmação da Direção antes da publicação.";
    });
  }

  if (el.progressButton && el.shortcutFeedback) {
    el.progressButton.addEventListener("click", function () {
      el.shortcutFeedback.textContent =
        "O histórico individual será implementado numa próxima etapa, respeitando as permissões de cada professor e da Direção.";
    });
  }

  if (el.logout) {
    el.logout.addEventListener("click", function () {
      const confirmed = window.confirm(
        "Queres terminar a sessão?"
      );

      if (confirmed) {
        /*
          A autenticação ainda não está ligada.
          Não apagamos dados nem simulamos uma sessão terminada.
        */
        window.alert(
          "A saída real será ligada ao sistema de autenticação quando essa funcionalidade estiver implementada."
        );
      }
    });
  }

  updatePeriodLabel();

  console.log("EduGest: módulo de desempenho carregado.");
});