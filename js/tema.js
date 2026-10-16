(function () {
  "use strict";

  const temas = {
    purple: {
      primary: "#6C5CE7",
      hover: "#5948D6",
      soft: "#F0EDFF",
      rgb: "108, 92, 231"
    },
    blue: {
      primary: "#0984E3",
      hover: "#0772C5",
      soft: "#E8F4FF",
      rgb: "9, 132, 227"
    },
    green: {
      primary: "#00B894",
      hover: "#009B7C",
      soft: "#E3FAF4",
      rgb: "0, 184, 148"
    },
    orange: {
      primary: "#E17055",
      hover: "#C95C42",
      soft: "#FFF0EB",
      rgb: "225, 112, 85"
    },
    pink: {
      primary: "#E84393",
      hover: "#CF317E",
      soft: "#FFEAF4",
      rgb: "232, 67, 147"
    }
  };

  const chave = "temaSistemaEscolar";

  function aplicarTema(nome) {
    if (!Object.prototype.hasOwnProperty.call(temas, nome)) {
      nome = "purple";
    }

    const tema = temas[nome];
    const raiz = document.documentElement;

    // Define diretamente as variáveis CSS.
    raiz.style.setProperty("--primary", tema.primary);
    raiz.style.setProperty("--primary-hover", tema.hover);
    raiz.style.setProperty("--primary-soft", tema.soft);
    raiz.style.setProperty("--primary-rgb", tema.rgb);

    // Atualiza a classe do body.
    if (document.body) {
      document.body.classList.remove(
        "theme-purple",
        "theme-blue",
        "theme-green",
        "theme-orange",
        "theme-pink"
      );

      document.body.classList.add("theme-" + nome);
    }

    // Atualiza o seletor.
    const seletor = document.getElementById("themeSelect");
    if (seletor && seletor.value !== nome) {
      seletor.value = nome;
    }

    // Atualiza a cor do navegador.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = tema.primary;
    }

    // Guarda a escolha.
    try {
      localStorage.setItem(chave, nome);
    } catch (erro) {
      console.warn("Não foi possível guardar o tema.", erro);
    }

    console.log("Tema aplicado:", nome, tema.primary);
  }

  function iniciarTemas() {
    const seletor = document.getElementById("themeSelect");

    if (!seletor) {
      console.error(
        'ERRO: não foi encontrado <select id="themeSelect"> no index.html.'
      );
      return;
    }

    let temaGuardado = "purple";

    try {
      temaGuardado = localStorage.getItem(chave) || "purple";
    } catch (erro) {
      console.warn("Não foi possível ler o tema guardado.", erro);
    }

    aplicarTema(temaGuardado);

    // Muda as cores sempre que o utilizador escolhe outra opção.
    seletor.addEventListener("change", function () {
      aplicarTema(seletor.value);
    });

    console.log("Seletor de temas iniciado corretamente.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarTemas);
  } else {
    iniciarTemas();
  }
})();