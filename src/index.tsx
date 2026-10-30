import {
  ButtonItem,
  DialogButton,
  Dropdown,
  Field,
  Focusable,
  PanelSection,
  PanelSectionRow,
  ToggleField,
  staticClasses,
} from "@decky/ui";
import { callable, definePlugin } from "@decky/api";
import { useState } from "react";
import { FaClock } from "react-icons/fa";
import { activeRule, DEFAULT_RULES, fmt, Rule, sanitize, STATUSES } from "./schedule";

const LABELS = { online: "Online", away: "Away", invisible: "Invisible", dnd: "Do Not Disturb", offline: "Offline" };
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => ({ data: i * 15, label: fmt(i * 15) }));
const STATUS_OPTIONS = STATUSES.map((s) => ({ data: s, label: LABELS[s] }));

const minutesNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

type Settings = { rules: Rule[]; enabled: boolean };
const loadSettings = callable<[], Partial<Settings> | null>("load");
const saveSettings = callable<[Settings], void>("save");
const store = () => saveSettings({ rules, enabled }).catch((e) => console.error("auto-offline: save failed", e));

let rules: Rule[] = DEFAULT_RULES;
let enabled = true;
let loaded = false;
let applied: string | undefined; // only switch when the rule changes so manual status stays untill the next one

function tick() {
  const r = loaded && enabled ? activeRule(rules, minutesNow()) : undefined;
  const key = r && `${r.at}:${r.status}`;
  if (!r || key === applied) return;
  // friends load after the UI, setting DND to early wipes the friend settings
  const friends = (window as any).friendStore?.m_FriendsUIFriendStore;
  if (!friends?.self?.persona || typeof (window as any).settingsStore?.m_FriendSettings?.bDoNotDisturbMode !== "boolean") return;
  // steam://friends/status/dnd does nothing, DND is it's own flag
  const dnd = r.status === "dnd";
  if (friends.GetUserDoNotDisturb() !== dnd) friends.SetUserDoNotDisturb(dnd);
  (SteamClient.URL as unknown as { ExecuteSteamURL(url: string): void }).ExecuteSteamURL(
    `steam://friends/status/${dnd ? "online" : r.status}`,
  );
  applied = key;
}

function Content() {
  const [list, setList] = useState(rules);
  const [on, setOn] = useState(enabled);

  const saveRules = (next: Rule[]) => {
    rules = [...next].sort((a, b) => a.at - b.at);
    store();
    setList(rules);
    tick();
  };
  const now = activeRule(list, minutesNow());

  return (
    <PanelSection title="Schedule">
      <PanelSectionRow>
        <ToggleField
          label="Enabled"
          description={now ? `Now: ${LABELS[now.status]} (since ${fmt(now.at)})` : "No rules"}
          checked={on}
          onChange={(v) => {
            enabled = v;
            applied = undefined;
            store();
            setOn(v);
            tick();
          }}
        />
      </PanelSectionRow>
      {list.map((r, i) => (
        <PanelSectionRow key={`${i}:${r.at}`}>
          <Field padding="compact" childrenContainerWidth="max">
            <Focusable style={{ display: "flex", gap: 6, width: "100%" }}>
              <div style={{ flex: 2 }}>
                <Dropdown
                  rgOptions={TIME_OPTIONS}
                  selectedOption={r.at}
                  onChange={(o) => saveRules(list.map((x, j) => (j === i ? { ...x, at: o.data } : x)))}
                />
              </div>
              <div style={{ flex: 3 }}>
                <Dropdown
                  rgOptions={STATUS_OPTIONS}
                  selectedOption={r.status}
                  onChange={(o) => saveRules(list.map((x, j) => (j === i ? { ...x, status: o.data } : x)))}
                />
              </div>
              <DialogButton
                style={{ minWidth: 0, width: 40, padding: 0 }}
                onClick={() => saveRules(list.filter((_, j) => j !== i))}
              >
                ✕
              </DialogButton>
            </Focusable>
          </Field>
        </PanelSectionRow>
      ))}
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => saveRules([...list, { at: 12 * 60, status: "online" }])}>
          Add rule
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => {
  loadSettings()
    .then((s) => {
      rules = sanitize(s?.rules) ?? DEFAULT_RULES;
      if (typeof s?.enabled === "boolean") enabled = s.enabled;
    })
    .catch((e) => console.error("auto-offline: load failed, using defaults", e))
    .finally(() => {
      loaded = true;
      tick();
    });
  // poll instead of timers so it catches up after sleep
  const timer = setInterval(tick, 30_000);
  return {
    name: "Auto Offline",
    titleView: <div className={staticClasses.Title}>Auto Offline</div>,
    content: <Content />,
    icon: <FaClock />,
    onDismount() {
      clearInterval(timer);
    },
  };
});
