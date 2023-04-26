function css(name) {
    return "rgb(" + getComputedStyle(document.documentElement).getPropertyValue(name) + ")";
  }
  

  function getPreferredColorScheme() {
    if (window.matchMedia) {
      if(window.matchMedia('(prefers-color-scheme: dark)').matches){
        return "dark";
      } else {
        return "default";
      }
    }
    return "dark";
  }

  mermaid.initialize({
    theme: getPreferredColorScheme(),
    themeVariables: {
      background: css("--color-neutral"),
      primaryColor: css("--color-primary-200"),
      secondaryColor: css("--color-secondary-200"),
      tertiaryColor: css("--color-neutral-100"),
      primaryBorderColor: css("--color-primary-400"),
      secondaryBorderColor: css("--color-secondary-400"),
      tertiaryBorderColor: css("--color-neutral-400"),
      //lineColor: "#fff",
      fontFamily:
        "ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,segoe ui,Roboto,helvetica neue,Arial,noto sans,sans-serif",
      fontSize: "16px",
    },
  });