
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import { ARCANE_BOX_ID, DAILY_MODE_GAME_IDS_BY_HOME_MODE } from "../../shared/config/gameRules";
import { getEligibleCollectionCards } from "../../shared/packs/packOpening";
import {
  COLLECTION_UPDATED_EVENT,
  getOwnedCardCount,
  getTotalOwnedCopies,
} from "../../shared/collection/collectionStore";
import { DAILY_CHALLENGE_STATES, getTodayKey, DAILY_PROGRESS_UPDATED_EVENT, getDailyChallengeState } from "../../shared/progress/dailyProgress";
import { getArcaneBoxCount, REWARDS_UPDATED_EVENT } from "../../shared/rewards/rewardStore";
import {
  createEmptyPlayerDataSnapshot,
  getPlayerDataSnapshot,
  importPlayerDataSnapshot,
  getPlayerDataForFutureBackend,
  getPlayerProfile,
  PLAYER_PROFILE_UPDATED_EVENT,
  setPlayerDisplayName,
} from "../../shared/player";
import "./PlayerProfile.css";

const COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    title: "Perfil local",
    eyebrow: "Datos de jugador",
    subtitle: "Panel provisional para revisar, exportar y resetear tu progreso mientras desarrollamos el sistema de cuentas.",
    guest: "Invitado",
    displayName: "Nombre visible",
    saveName: "Guardar nombre",
    playerId: "ID local",
    createdAt: "Creado",
    updatedAt: "Actualizado",
    arcaneBoxes: "Cajas arcanas",
    uniqueCards: "Cartas únicas",
    totalCopies: "Copias totales",
    collectionProgress: "Colección",
    dailyToday: "Retos de hoy",
    dailyWon: "Completados",
    dailyLost: "Fallados",
    dailyPending: "Pendientes",
    storageTitle: "Datos guardados",
    storageSubtitle: "Todo vive en localStorage por ahora. Esta sección nos servirá para migrar a login/backend más adelante.",
    exportData: "Exportar datos",
    copyJson: "Copiar JSON",
    downloadJson: "Descargar JSON",
    importData: "Importar datos",
    importPlaceholder: "Pega aquí un JSON exportado del perfil...",
    importButton: "Importar",
    resetData: "Resetear progreso",
    resetWarning: "Borra retos, cajas y colección del navegador. Úsalo solo para pruebas.",
    resetButton: "Resetear todo",
    backendPreview: "Vista futura backend",
    backendPreviewHint: "Estructura preparada para enviar a una base de datos cuando añadamos login.",
    copied: "Copiado al portapapeles.",
    exported: "Snapshot actualizado.",
    imported: "Datos importados correctamente.",
    importError: "No he podido importar ese JSON.",
    resetDone: "Progreso reseteado.",
    noData: "Sin datos",
    done: "Hecho",
    failed: "Fallado",
    pending: "Pendiente",
    guessMana: "Adivina el coste",
    impostor: "Encuentra el impostor",
    grid: "Grid de cartas",
    pyramid: "La Pirámide",
    higherLower: "Mayor o menor",
    hiddenCard: "La Carta Oculta",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    title: "Local profile",
    eyebrow: "Player data",
    subtitle: "Temporary panel to review, export, and reset your progress while we build the account system.",
    guest: "Guest",
    displayName: "Display name",
    saveName: "Save name",
    playerId: "Local ID",
    createdAt: "Created",
    updatedAt: "Updated",
    arcaneBoxes: "Arcane boxes",
    uniqueCards: "Unique cards",
    totalCopies: "Total copies",
    collectionProgress: "Collection",
    dailyToday: "Today’s challenges",
    dailyWon: "Completed",
    dailyLost: "Failed",
    dailyPending: "Pending",
    storageTitle: "Saved data",
    storageSubtitle: "Everything lives in localStorage for now. This section will help us migrate to login/backend later.",
    exportData: "Export data",
    copyJson: "Copy JSON",
    downloadJson: "Download JSON",
    importData: "Import data",
    importPlaceholder: "Paste an exported profile JSON here...",
    importButton: "Import",
    resetData: "Reset progress",
    resetWarning: "Deletes challenges, boxes, and collection from this browser. Use it for testing only.",
    resetButton: "Reset all",
    backendPreview: "Future backend view",
    backendPreviewHint: "Structure ready to send to a database when we add login.",
    copied: "Copied to clipboard.",
    exported: "Snapshot refreshed.",
    imported: "Data imported successfully.",
    importError: "I could not import that JSON.",
    resetDone: "Progress reset.",
    noData: "No data",
    done: "Done",
    failed: "Failed",
    pending: "Pending",
    guessMana: "Guess the Cost",
    impostor: "Find the Impostor",
    grid: "Card Grid",
    pyramid: "The Pyramid",
    higherLower: "Higher or Lower",
    hiddenCard: "The Hidden Card",
  },
};

const DAILY_LABELS = {
  guessMana: "guessMana",
  impostor: "impostor",
  grid: "grid",
  pyramid: "pyramid",
  higherLower: "higherLower",
  hiddenCard: "hiddenCard",
};

function formatDate(value, locale) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function safeStringify(value) {
  return JSON.stringify(value, null, 2);
}

function StatCard({ label, value, hint }) {
  return (
    <div className="player-profile-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function PlayerProfile({ cards = [], loading = false }) {
  const { locale } = useLanguage();
  const copy = COPY[locale] ?? COPY.es;
  const todayKey = useMemo(() => getTodayKey(), []);
  const [profile, setProfile] = useState(() => getPlayerProfile());
  const [displayName, setDisplayName] = useState(() => getPlayerProfile().displayName);
  const [snapshot, setSnapshot] = useState(() => getPlayerDataSnapshot());
  const [backendPreview, setBackendPreview] = useState(() => getPlayerDataForFutureBackend());
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

  const collectibleCards = useMemo(() => getEligibleCollectionCards(cards), [cards]);

  function refreshAll(nextMessage) {
    const nextProfile = getPlayerProfile();
    setProfile(nextProfile);
    setDisplayName(nextProfile.displayName);
    setSnapshot(getPlayerDataSnapshot());
    setBackendPreview(getPlayerDataForFutureBackend());

    if (nextMessage) {
      setMessage(nextMessage);
    }
  }

  useEffect(() => {
    function sync() {
      refreshAll();
    }

    window.addEventListener(PLAYER_PROFILE_UPDATED_EVENT, sync);
    window.addEventListener(DAILY_PROGRESS_UPDATED_EVENT, sync);
    window.addEventListener(REWARDS_UPDATED_EVENT, sync);
    window.addEventListener(COLLECTION_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener(PLAYER_PROFILE_UPDATED_EVENT, sync);
      window.removeEventListener(DAILY_PROGRESS_UPDATED_EVENT, sync);
      window.removeEventListener(REWARDS_UPDATED_EVENT, sync);
      window.removeEventListener(COLLECTION_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const dailyProgress = snapshot.dailyProgress ?? {};
  const arcaneBoxes = getArcaneBoxCount(ARCANE_BOX_ID);
  const ownedUnique = getOwnedCardCount();
  const totalCopies = getTotalOwnedCopies();

  const dailyRows = Object.entries(DAILY_MODE_GAME_IDS_BY_HOME_MODE).map(([homeModeId, gameId]) => {
    const progress = dailyProgress?.[gameId]?.[todayKey];
    const rawState = getDailyChallengeState(progress);
    const state = rawState === DAILY_CHALLENGE_STATES.WON
      ? "done"
      : rawState === DAILY_CHALLENGE_STATES.LOST
        ? "failed"
        : "pending";

    return {
      homeModeId,
      gameId,
      state,
      label: copy[DAILY_LABELS[homeModeId]] ?? homeModeId,
    };
  });

  const dailyStats = dailyRows.reduce(
    (acc, row) => {
      acc[row.state] += 1;
      return acc;
    },
    { done: 0, failed: 0, pending: 0 },
  );

  function handleSaveName(event) {
    event.preventDefault();
    setPlayerDisplayName(displayName);
    refreshAll(copy.exported);
  }

  async function handleCopyJson() {
    const json = safeStringify(getPlayerDataSnapshot());

    try {
      await navigator.clipboard.writeText(json);
      setMessage(copy.copied);
    } catch {
      setImportText(json);
      setMessage(copy.exported);
    }
  }

  function handleDownloadJson() {
    const json = safeStringify(getPlayerDataSnapshot());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const dateKey = getTodayKey();

    anchor.href = url;
    anchor.download = `hearthdle-player-data-${dateKey}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
    setMessage(copy.exported);
  }

  function handleImportJson() {
    try {
      const parsed = JSON.parse(importText);
      importPlayerDataSnapshot(parsed);
      setImportText("");
      refreshAll(copy.imported);
    } catch {
      setMessage(copy.importError);
    }
  }

  function handleResetAll() {
    const confirmed = window.confirm(`${copy.resetData}\n\n${copy.resetWarning}`);

    if (!confirmed) return;

    importPlayerDataSnapshot(createEmptyPlayerDataSnapshot({ displayName: profile.displayName }));
    refreshAll(copy.resetDone);
  }

  const snapshotText = safeStringify(snapshot);
  const backendPreviewText = safeStringify(backendPreview);
  const collectionProgressText = `${ownedUnique} / ${loading ? "..." : collectibleCards.length || "—"}`;

  return (
    <main className="player-profile-page">
      <div className="player-profile-bg" aria-hidden="true">
        <span className="player-profile-glow player-profile-glow-a" />
        <span className="player-profile-glow player-profile-glow-b" />
      </div>


      <section className="player-profile-shell">
        <section className="player-profile-hero">
          <p>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <span>{copy.subtitle}</span>
        </section>

        {message ? <div className="player-profile-message" role="status">{message}</div> : null}

        <section className="player-profile-grid">
          <article className="player-profile-panel player-profile-main-panel">
            <div className="player-profile-panel-head">
              <div>
                <p>{copy.displayName}</p>
                <h2>{profile.displayName || copy.guest}</h2>
              </div>
              <span className="player-profile-chip">{profile.mode}</span>
            </div>

            <form className="player-profile-name-form" onSubmit={handleSaveName}>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={copy.guest}
                maxLength={32}
              />
              <button type="submit">{copy.saveName}</button>
            </form>

            <dl className="player-profile-meta">
              <div>
                <dt>{copy.playerId}</dt>
                <dd>{profile.playerId}</dd>
              </div>
              <div>
                <dt>{copy.createdAt}</dt>
                <dd>{formatDate(profile.createdAt, locale)}</dd>
              </div>
              <div>
                <dt>{copy.updatedAt}</dt>
                <dd>{formatDate(profile.updatedAt, locale)}</dd>
              </div>
            </dl>
          </article>

          <article className="player-profile-panel">
            <div className="player-profile-panel-head">
              <div>
                <p>{copy.collectionProgress}</p>
                <h2>{collectionProgressText}</h2>
              </div>
            </div>

            <div className="player-profile-stats">
              <StatCard label={copy.arcaneBoxes} value={arcaneBoxes} />
              <StatCard label={copy.uniqueCards} value={ownedUnique} />
              <StatCard label={copy.totalCopies} value={totalCopies} />
            </div>
          </article>

          <article className="player-profile-panel">
            <div className="player-profile-panel-head">
              <div>
                <p>{copy.dailyToday}</p>
                <h2>{todayKey}</h2>
              </div>
            </div>

            <div className="player-profile-daily-stats">
              <StatCard label={copy.dailyWon} value={dailyStats.done} />
              <StatCard label={copy.dailyLost} value={dailyStats.failed} />
              <StatCard label={copy.dailyPending} value={dailyStats.pending} />
            </div>

            <div className="player-profile-daily-list">
              {dailyRows.map((row) => (
                <div key={row.gameId} className={`player-profile-daily-row is-${row.state}`}>
                  <span>{row.label}</span>
                  <strong>{row.state === "done" ? copy.done : row.state === "failed" ? copy.failed : copy.pending}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="player-profile-storage">
          <article className="player-profile-panel player-profile-storage-panel">
            <div className="player-profile-panel-head">
              <div>
                <p>{copy.storageTitle}</p>
                <h2>{copy.exportData}</h2>
              </div>
            </div>
            <p className="player-profile-muted">{copy.storageSubtitle}</p>
            <div className="player-profile-action-row">
              <button type="button" onClick={handleCopyJson}>{copy.copyJson}</button>
              <button type="button" onClick={handleDownloadJson}>{copy.downloadJson}</button>
            </div>
            <textarea readOnly value={snapshotText} aria-label={copy.exportData} />
          </article>

          <article className="player-profile-panel player-profile-storage-panel">
            <div className="player-profile-panel-head">
              <div>
                <p>{copy.importData}</p>
                <h2>{copy.backendPreview}</h2>
              </div>
            </div>
            <p className="player-profile-muted">{copy.backendPreviewHint}</p>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder={copy.importPlaceholder}
              aria-label={copy.importData}
            />
            <div className="player-profile-action-row">
              <button type="button" onClick={handleImportJson} disabled={!importText.trim()}>{copy.importButton}</button>
              <button type="button" className="is-danger" onClick={handleResetAll}>{copy.resetButton}</button>
            </div>
            <details className="player-profile-backend-details">
              <summary>{copy.backendPreview}</summary>
              <pre>{backendPreviewText}</pre>
            </details>
          </article>
        </section>
      </section>
    </main>
  );
}

export default PlayerProfile;
