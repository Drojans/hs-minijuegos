import { Component } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import "./AppErrorBoundary.css";

const IS_DEV = import.meta.env.DEV;

function goHome() {
  window.location.assign("/");
}

function reloadPage() {
  window.location.reload();
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    if (IS_DEV) {
      console.error("AppErrorBoundary captured an error", error, errorInfo);
    }
  }

  toggleDetails = () => {
    this.setState((currentState) => ({
      showDetails: !currentState.showDetails,
    }));
  };

  render() {
    const { children } = this.props;
    const { error, errorInfo, showDetails } = this.state;

    if (!error) {
      return children;
    }

    return (
      <main className="app-error-page" role="alert">
        <section className="app-error-card" aria-labelledby="app-error-title">
          <div className="app-error-icon" aria-hidden="true">
            <AlertTriangle size={34} strokeWidth={2.3} />
          </div>

          <p className="app-error-kicker">Error inesperado</p>
          <h1 id="app-error-title">Algo ha fallado</h1>
          <p className="app-error-copy">
            La página se ha detenido para evitar una pantalla negra. Puedes volver al inicio o recargar la página.
          </p>

          <div className="app-error-actions">
            <button className="app-error-button app-error-button--primary" type="button" onClick={goHome}>
              <Home size={18} aria-hidden="true" />
              Volver al inicio
            </button>
            <button className="app-error-button app-error-button--secondary" type="button" onClick={reloadPage}>
              <RotateCcw size={18} aria-hidden="true" />
              Recargar
            </button>
          </div>

          {IS_DEV ? (
            <div className="app-error-devtools">
              <button className="app-error-details-toggle" type="button" onClick={this.toggleDetails}>
                {showDetails ? "Ocultar detalles técnicos" : "Ver detalles técnicos"}
              </button>

              {showDetails ? (
                <pre className="app-error-details">
                  {String(error?.stack || error)}
                  {errorInfo?.componentStack ? `\n\nComponent stack:${errorInfo.componentStack}` : ""}
                </pre>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
