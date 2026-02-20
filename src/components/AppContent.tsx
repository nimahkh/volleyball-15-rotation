import { ROLES, type TabKey } from "../constants/roles";
import { Court } from "./court/Court";
import { MobileBottomSheet } from "./receive/MobileBottomSheet";
import { PlayerInsightChooser } from "./receive/PlayerInsightChooser";
import { useLineupForm } from "../hooks/useLineupForm";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePlaybackControls } from "../hooks/usePlaybackControls";
import { useReceiveModeInsights } from "../hooks/useReceiveModeInsights";
import { Rotation } from "../providers/Rotation";

export function AppContent() {
  const {
    tab,
    setTab,
    rotation,
    players,
    setPlayers,
    nextRotation,
    prevRotation,
  } = Rotation.useRotation();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const {
    receivePhase,
    selectedToken,
    selectedInsight,
    focusedRole,
    zoneAnimation,
    movementAnimation,
    choosePlayer,
    chooseInsight,
    closeInsights,
    onPlayPressed,
    onResetPressed,
  } = useReceiveModeInsights({ tab, rotation });

  const { isPlaying, resetPosition, playDemo, handleResetPositions } =
    usePlaybackControls({
      onPlayPressed,
      onResetPressed,
    });

  const { form, setForm, submitForm } = useLineupForm((lineup) =>
    setPlayers(lineup),
  );

  const ready = !!players;
  const phaseText = receivePhase === "before" ? "Before Play" : "After Play";

  const insightPanel =
    selectedToken && tab === "receive" ? (
      <PlayerInsightChooser
        role={selectedToken.role}
        name={selectedToken.name}
        selectedInsight={selectedInsight}
        onChooseInsight={chooseInsight}
      />
    ) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 sm:p-4">
      <div className="mx-auto w-full max-w-[560px] px-4 py-6">
        <h1 className="mb-4 text-center text-xl font-extrabold text-zinc-900">
          Volleyball 5-1 Rotation Helper
        </h1>

        {!ready && (
          <form
            onSubmit={submitForm}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-zinc-600">
              Enter your lineup. Long names are truncated automatically.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700">
                    {label}
                  </label>
                  <input
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-400"
                    placeholder={`Type ${label} name...`}
                    value={form[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end pt-2">
              <button className="rounded-full bg-indigo-600 px-4 py-2 font-semibold text-white shadow hover:shadow-md">
                Start
              </button>
            </div>
          </form>
        )}

        {ready && players && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm sm:flex sm:items-center sm:justify-between">
              <div
                className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:pb-0"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {[
                  { key: "receive", label: "Receive" },
                  { key: "serve", label: "Serve" },
                  { key: "base", label: "Rotation Position" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key as TabKey)}
                    className={`shrink-0 snap-center rounded-full border px-4 py-2 text-sm font-semibold transition-all sm:text-base ${
                      tab === key
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-2 text-center text-sm font-semibold text-zinc-700 sm:mt-0 sm:text-right sm:text-base">
                Rotation <span className="text-indigo-700">{rotation}</span>
              </div>
            </div>

            {tab === "receive" && (
              <div className="mt-0 flex flex-wrap items-center justify-center gap-2 rounded-md bg-white p-2 shadow-md">
                <button
                  onClick={playDemo}
                  disabled={isPlaying || resetPosition}
                  className={`rounded-full px-6 py-2 font-semibold text-white shadow ${
                    isPlaying || resetPosition
                      ? "bg-gray-400"
                      : "bg-yellow-500 hover:bg-yellow-400"
                  }`}
                >
                  {isPlaying ? "Playing..." : "Play"}
                </button>

                <button
                  onClick={handleResetPositions}
                  disabled={resetPosition || isPlaying}
                  className={`rounded-full px-6 py-2 font-semibold text-white shadow ${
                    resetPosition || isPlaying
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-400"
                  }`}
                >
                  {resetPosition ? "Resetting..." : "Reset"}
                </button>

                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {phaseText}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Court
                tab={tab}
                rotation={rotation}
                players={players}
                isPlaying={isPlaying}
                resetPosition={resetPosition}
                selectedToken={selectedToken}
                choosePlayer={choosePlayer}
                zoneAnimation={zoneAnimation}
                movementAnimation={movementAnimation}
                focusedRole={focusedRole}
                isDesktop={isDesktop}
                onCloseSelected={closeInsights}
                insightPanel={insightPanel}
              />
            </div>

            {tab === "receive" &&
              !isDesktop &&
              selectedToken &&
              insightPanel && (
                <MobileBottomSheet
                  selectedToken={selectedToken}
                  onClose={closeInsights}
                  insightPanel={insightPanel}
                />
              )}

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={prevRotation}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700"
              >
                Prev
              </button>
              <div className="text-center text-xs text-zinc-500">
                Pick a player, choose zone or movement, then watch the
                animation.
              </div>
              <button
                onClick={nextRotation}
                className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <footer className="mt-6 text-center text-xs text-zinc-500">
          Made with ❤️ for Volleyball lovers
          <br />
          Author:{" "}
          <span className="font-bold">
            <a href="mailto:nima.2004hkh@gmail.com">Nima</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
