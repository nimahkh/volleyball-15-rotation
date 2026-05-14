import { useEffect, useState } from "react";
import { ROLES, type TabKey } from "../constants/roles";
import { CoachStrategyPage } from "./coach/CoachStrategyPage";
import { Court } from "./court/Court";
import { ChipOnboarding } from "./onboarding/ChipOnboarding";
import { MobileBottomSheet } from "./receive/MobileBottomSheet";
import { PlayerInsightChooser } from "./receive/PlayerInsightChooser";
import { Button } from "./ui/Button";
import { useChipOnboarding } from "../hooks/useChipOnboarding";
import { useLineupForm } from "../hooks/useLineupForm";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePlaybackControls } from "../hooks/usePlaybackControls";
import { useReceiveModeInsights } from "../hooks/useReceiveModeInsights";
import { Rotation } from "../providers/Rotation";
import { useTheme } from "../providers/useTheme";

function getCurrentPage() {
  return window.location.pathname.startsWith("/coach") ? "coach" : "rotation";
}

export function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = useState<"rotation" | "coach">(getCurrentPage);
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
  const isDark = theme === "dark";
  const phaseText = receivePhase === "before" ? "Before Play" : "After Play";
  const { isOpen: showChipOnboarding, close: closeChipOnboarding } =
    useChipOnboarding(ready && tab === "receive");

  useEffect(() => {
    const onPopState = () => setPage(getCurrentPage());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const insightPanel =
    selectedToken && tab === "receive" ? (
      <PlayerInsightChooser
        role={selectedToken.role}
        name={selectedToken.name}
        selectedInsight={selectedInsight}
        onChooseInsight={chooseInsight}
      />
    ) : null;

  if (page === "coach") {
    return (
      <CoachStrategyPage
        isDark={isDark}
        onBack={() => {
          const url = new URL(window.location.href);
          url.pathname = "/";
          url.searchParams.delete("drill");
          window.history.pushState({}, "", url.toString());
          setPage("rotation");
        }}
      />
    );
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center transition-colors sm:p-4 ${
        isDark
          ? "bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_32%),linear-gradient(180deg,_#09090b,_#111827)] text-zinc-100"
          : "bg-zinc-100 text-zinc-900"
      }`}
    >
      <div className="mx-auto w-full max-w-[560px] px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1
            className={`text-xl font-extrabold ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            Volleyball 5-1 Rotation Helper
          </h1>
          <Button
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            onClick={toggleTheme}
            isDark={isDark}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            {isDark ? "Light" : "Dark"}
          </Button>
        </div>

        <Button
          aria-label="Open Coach Board"
          onClick={() => {
            const url = new URL(window.location.href);
            url.pathname = "/coach";
            window.history.pushState({}, "", url.toString());
            setPage("coach");
          }}
          isDark={isDark}
          variant="outline"
          className={`mb-4 w-full rounded-3xl text-left shadow-sm transition-transform hover:-translate-y-0.5 ${
            isDark
              ? "border-sky-500/30 bg-sky-500/10 text-sky-100 shadow-black/20"
              : "border-sky-100 bg-white text-slate-900 shadow-sky-100"
          }`}
        >
          <span className="block text-[11px] font-black uppercase tracking-[0.24em] text-sky-500">
            New
          </span>
          <span className="block text-base font-black">Open Coach Board</span>
          <span
            className={`block text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Build tactical setups with movable players and court annotations.
          </span>
        </Button>

        {!ready && (
          <form
            onSubmit={submitForm}
            className={`space-y-4 rounded-2xl border p-4 shadow-sm transition-colors ${
              isDark
                ? "border-zinc-800 bg-zinc-900/80 shadow-black/30"
                : "border-zinc-200 bg-white"
            }`}
          >
            <p
              className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
            >
              Enter your lineup. Long names are truncated automatically.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label
                    htmlFor={`lineup-${key}`}
                    className={`text-sm font-medium ${
                      isDark ? "text-zinc-200" : "text-zinc-700"
                    }`}
                  >
                    {label}
                  </label>
                  <input
                    id={`lineup-${key}`}
                    className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition-[box-shadow,border-color,background-color,color] focus:ring-2 focus:ring-indigo-400 ${
                      isDark
                        ? "border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
                        : "border-zinc-300 bg-white text-zinc-900"
                    }`}
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
              <Button
                type="submit"
                variant="primary"
                isDark={isDark}
                className="rounded-full px-4"
              >
                Start
              </Button>
            </div>
          </form>
        )}

        {ready && players && (
          <div className="mt-4 space-y-4">
            <div
              className={`rounded-xl border p-2 shadow-sm sm:flex sm:items-center sm:justify-between ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/80 shadow-black/30"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <div
                className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:pb-0"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {[
                  { key: "receive", label: "Receive" },
                  { key: "serve", label: "Serve" },
                  { key: "base", label: "Rotation Position" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    onClick={() => setTab(key as TabKey)}
                    isDark={isDark}
                    active={tab === key}
                    className={`shrink-0 snap-center rounded-full sm:text-base ${
                      tab === key
                        ? "border-blue-500 bg-blue-600 text-white shadow-md"
                        : isDark
                          ? "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                          : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div
                className={`mt-2 text-center text-sm font-semibold sm:mt-0 sm:text-right sm:text-base ${
                  isDark ? "text-zinc-300" : "text-zinc-700"
                }`}
              >
                Rotation <span className="text-indigo-700">{rotation}</span>
              </div>
            </div>

            {tab === "receive" && (
              <div
                className={`mt-0 flex flex-wrap items-center justify-center gap-2 rounded-md p-2 shadow-md ${
                  isDark ? "bg-zinc-900/80 shadow-black/30" : "bg-white"
                }`}
              >
                <Button
                  onClick={playDemo}
                  disabled={isPlaying || resetPosition}
                  isDark={isDark}
                  variant="primary"
                  className={`rounded-full px-6 ${
                    isPlaying || resetPosition
                      ? "bg-gray-400"
                      : "bg-yellow-500 hover:bg-yellow-400"
                  }`}
                >
                  {isPlaying ? "Playing..." : "Play"}
                </Button>

                <Button
                  onClick={handleResetPositions}
                  disabled={resetPosition || isPlaying}
                  isDark={isDark}
                  variant="primary"
                  className={`rounded-full px-6 ${
                    resetPosition || isPlaying
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-400"
                  }`}
                >
                  {resetPosition ? "Resetting..." : "Reset"}
                </Button>

                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isDark
                      ? "bg-emerald-950/60 text-emerald-300"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {phaseText}
                </div>
              </div>
            )}

            <div
              className={`rounded-2xl border p-3 shadow-sm ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/80 shadow-black/30"
                  : "border-zinc-200 bg-white"
              }`}
            >
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
                disablePlayerClicks={isPlaying}
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
              <Button
                onClick={prevRotation}
                isDark={isDark}
                variant="outline"
                className="rounded-full px-4"
              >
                Prev
              </Button>
              <div
                className={`text-center text-xs ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Pick a player, choose zone or movement, then watch the
                animation.
              </div>
              <Button
                onClick={nextRotation}
                variant="primary"
                isDark={isDark}
                className="rounded-full px-4"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <footer
          className={`mt-6 text-center text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
        >
          Made with ❤️ for Volleyball lovers
          <br />
          Author:{" "}
          <span className="font-bold">
            <a href="mailto:nima.2004hkh@gmail.com">Nima</a>
          </span>
        </footer>
      </div>

      {showChipOnboarding && <ChipOnboarding onClose={closeChipOnboarding} />}
    </div>
  );
}
