import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { emitProfileUpdate } from "../utils/profileEvents";
import {
  FaUser,
  FaLock,
  FaSlidersH,
  FaVideo,
  FaCamera,
  FaCheck,
} from "react-icons/fa";

const API = "http://localhost:7000/api/settings";
const TABS = [
  { id: "profile", label: "Profile", icon: FaUser },
  { id: "security", label: "Security", icon: FaLock },
  { id: "preferences", label: "Preferences", icon: FaSlidersH },
  { id: "meeting", label: "Meeting", icon: FaVideo },
];

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/me`, { withCredentials: true });
      setUser(res.data.user);
    } catch {
      toast.error("Couldn't load your settings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070d] flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-blue-600"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-slate-500 mb-8">
          Manage your profile, security and meeting preferences.
        </p>

        <div className="flex gap-8">
          <nav className="w-52 shrink-0 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-8 min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "profile" && (
                  <ProfileTab user={user} setUser={setUser} />
                )}
                {activeTab === "security" && <SecurityTab />}
                {activeTab === "preferences" && (
                  <PreferencesTab user={user} setUser={setUser} />
                )}
                {activeTab === "meeting" && (
                  <MeetingTab user={user} setUser={setUser} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-600 transition-colors";

function SaveButton({ saving, saved, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
    >
      {saving ? (
        "Saving…"
      ) : saved ? (
        <>
          <FaCheck size={12} /> Saved
        </>
      ) : (
        "Save changes"
      )}
    </button>
  );
}

function ProfileTab({ user, setUser }) {
  const [form, setForm] = useState({
    name: user.name || "",
    username: user.username || "",
    phone: user.phone || "",
    bio: user.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await axios.post(`${API}/avatar`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      emitProfileUpdate(res.data.user);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await axios.put(`${API}/profile`, form, {
        withCredentials: true,
      });
      setUser(res.data.user);
      emitProfileUpdate(res.data.user);
      setSaved(true);
      toast.success("Profile updated");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="relative h-16 w-16">
          {user.avatar ? (
            <img
              src={`http://localhost:7000${user.avatar}`}
              className="h-16 w-16 rounded-full object-cover border border-white/10"
              alt="avatar"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20">
            <FaCamera size={10} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      <Field label="Display name">
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="Username">
        <input
          className={inputClass}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="yourname"
        />
      </Field>
      <Field label="Phone number">
        <input
          className={inputClass}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </Field>
      <Field label="Bio">
        <textarea
          className={inputClass}
          rows={3}
          maxLength={200}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (form.newPassword !== form.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${API}/password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { withCredentials: true },
      );
      toast.success("Password changed");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Change password</h3>
      <Field label="Current password">
        <input
          type="password"
          className={inputClass}
          value={form.currentPassword}
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
        />
      </Field>
      <Field label="New password">
        <input
          type="password"
          className={inputClass}
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
      </Field>
      <Field label="Confirm new password">
        <input
          type="password"
          className={inputClass}
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
      </Field>
      <SaveButton saving={saving} saved={false} onClick={save} />
    </div>
  );
}

function PreferencesTab({ user, setUser }) {
  const [prefs, setPrefs] = useState(user.preferences);
  const [saving, setSaving] = useState(false);

  const update = async (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    try {
      const res = await axios.put(`${API}/preferences`, patch, {
        withCredentials: true,
      });
      setUser({ ...user, preferences: res.data.preferences });
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = (key) => {
    update({
      notifications: {
        ...prefs.notifications,
        [key]: !prefs.notifications[key],
      },
    });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Theme</h3>
      <div className="flex gap-2 mb-8">
        {["light", "dark", "system"].map((t) => (
          <button
            key={t}
            onClick={() => update({ theme: t })}
            className={`px-4 py-2 rounded-lg text-sm capitalize border transition-colors ${
              prefs.theme === t
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <h3 className="text-sm font-semibold mb-4">Notifications</h3>
      <div className="space-y-3">
        {Object.entries(prefs.notifications).map(([key, val]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 cursor-pointer"
          >
            <span className="text-sm capitalize text-slate-300">
              {key.replace(/([A-Z])/g, " $1")}
            </span>
            <input
              type="checkbox"
              checked={val}
              onChange={() => toggleNotif(key)}
              className="h-4 w-4 accent-blue-600"
            />
          </label>
        ))}
      </div>
      {saving && <p className="text-xs text-slate-500 mt-3">Saving…</p>}
    </div>
  );
}

function MeetingTab({ user, setUser }) {
  const [mp, setMp] = useState(user.meetingPreferences);
  const [saving, setSaving] = useState(false);

  const update = async (patch) => {
    const next = { ...mp, ...patch };
    setMp(next);
    setSaving(true);
    try {
      const res = await axios.put(`${API}/meeting-preferences`, patch, {
        withCredentials: true,
      });
      setUser({ ...user, meetingPreferences: res.data.meetingPreferences });
      toast.success("Meeting preferences saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Defaults on join</h3>
      <div className="space-y-3 mb-8">
        <label className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 cursor-pointer">
          <span className="text-sm text-slate-300">Camera on by default</span>
          <input
            type="checkbox"
            checked={mp.defaultCameraOn}
            onChange={() => update({ defaultCameraOn: !mp.defaultCameraOn })}
            className="h-4 w-4 accent-blue-600"
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 cursor-pointer">
          <span className="text-sm text-slate-300">
            Microphone on by default
          </span>
          <input
            type="checkbox"
            checked={mp.defaultMicOn}
            onChange={() => update({ defaultMicOn: !mp.defaultMicOn })}
            className="h-4 w-4 accent-blue-600"
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 cursor-pointer">
          <span className="text-sm text-slate-300">
            Auto-record meetings I host
          </span>
          <input
            type="checkbox"
            checked={mp.autoRecord}
            onChange={() => update({ autoRecord: !mp.autoRecord })}
            className="h-4 w-4 accent-blue-600"
          />
        </label>
      </div>

      <h3 className="text-sm font-semibold mb-4">Participant permissions</h3>
      <div className="space-y-3">
        {Object.entries(mp.defaultPermissions).map(([key, val]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 cursor-pointer"
          >
            <span className="text-sm capitalize text-slate-300">
              {key.replace(/([A-Z])/g, " $1")}
            </span>
            <input
              type="checkbox"
              checked={val}
              onChange={() =>
                update({
                  defaultPermissions: { ...mp.defaultPermissions, [key]: !val },
                })
              }
              className="h-4 w-4 accent-blue-600"
            />
          </label>
        ))}
      </div>
      {saving && <p className="text-xs text-slate-500 mt-3">Saving…</p>}
    </div>
  );
}

export default Settings;
