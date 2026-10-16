/* =========================================
   SISTEMA ESCOLAR — APLICAÇÃO PRINCIPAL
   Etapa 1: interações do ecrã de entrada
========================================= */

(function () {
  "use strict";

  const DEMO_USERNAME = "admin";
  const DEMO_PASSWORD = "1234";

  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePasswordButton = document.getElementById("togglePassword");
  const fillDemoButton = document.getElementById("fillDemo");
  const loginMessage = document.getElementById("loginMessage");
  const currentYear = document.getElementById("currentYear");

  function showMessage(message, type) {
    if (!loginMessage) return;

    loginMessage.textContent = message;
    loginMessage.className = "form-message is-visible";

    if (type === "error") {
      loginMessage.classList.add("is-error");
    } else if (type === "success") {
      loginMessage.classList.add("is-success");
    }
  }

  function clearMessage() {
    if (!loginMessage) return;

    loginMessage.textContent = "";
    loginMessage.className = "form-message";
  }

  function togglePasswordVisibility() {
    if (!passwordInput || !togglePasswordButton) return;

    const shouldShow = passwordInput.type === "password";

    passwordInput.type = shouldShow ? "text" : "password";
    togglePasswordButton.textContent = shouldShow ? "Ocultar" : "Mostrar";
    togglePasswordButton.setAttribute("aria-pressed", String(shouldShow));
    togglePasswordButton.setAttribute(
      "aria-label",
      shouldShow ? "Ocultar palavra-passe" : "Mostrar palavra-passe"
    );
  }

  function fillDemoCredentials() {
    if (!usernameInput || !passwordInput) return;

    usernameInput.value = DEMO_USERNAME;
    passwordInput.value = DEMO_PASSWORD;

    clearMessage();
    usernameInput.focus();
  }

  function handleLogin(event) {
    event.preventDefault();
    clearMessage();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (!username || !password) {
      showMessage(
        "Preencha o utilizador e a palavra-passe para continuar.",
        "error"
      );
      return;
    }

    /*
      ATENÇÃO:
      Estas credenciais são apenas para demonstração visual.
      A validação acontece no navegador e não protege uma conta real.
      A autenticação verdadeira será feita no servidor numa etapa futura.
    */

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {

      showMessage(
        "Login efetuado com sucesso! A entrar no sistema... ",
        "success"
      );

      setTimeout(() => {
      window.location.href ="dashboard.html"
      }, 1000);
      
      return;
    }

    showMessage(
      "Os dados não correspondem à conta. " +
      "error"
    );
  }

  function initializeApp() {
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }

    if (togglePasswordButton) {
      togglePasswordButton.addEventListener(
        "click",
        togglePasswordVisibility
      );
    }

    if (fillDemoButton) {
      fillDemoButton.addEventListener("click", fillDemoCredentials);
    }

    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin);
    }

    [usernameInput, passwordInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", clearMessage);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();