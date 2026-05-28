// ProReply Popup Script — Redesigned v2
const PAYMENT_LINK = "https://flutterwave.com/pay/qcuzf4zks7qu";
const CODE_SALT = "proreply-2026-delia-secret"; // Change before publishing!
const CODE_EXPIRY = 60 * 24 * 60 * 60 * 1000;

// ── STATE ──────────────────────────────────────────────────────────────────
let ST = {
  isActive: false,
  isPro: false,
  templates: [],
  rules: [],
  user: {},
  usage: { messagesCount: 0 },
  activity: [], // [{title, desc, time, color}]
  settings: { cooldown: 30 },
};

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await load();
  renderAll();
  bindAll();

  // Live update when content.js changes storage
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.usage) {
      ST.usage = changes.usage.newValue || { messagesCount: 0 };
      renderDashboard();
    }
    if (changes.activity) {
      ST.activity = changes.activity.newValue || [];
      renderActivity();
    }
    if (changes.isActive) {
      ST.isActive = changes.isActive.newValue;
      renderHeader();
      renderDashboard();
    }
    if (changes.templates) {
      ST.templates = changes.templates.newValue || [];
      renderDashboard();
    }
    if (changes.rules) {
      ST.rules = changes.rules.newValue || [];
      renderDashboard();
    }
  });
});

async function load() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (data) => {
      ST.isActive =
        data.isActive !== undefined
          ? data.isActive
          : data.automationActive || false;
      ST.isPro = data.isPro || false;
      ST.templates = Array.isArray(data.templates) ? data.templates : [];
      ST.rules = Array.isArray(data.rules) ? data.rules : [];
      ST.user = data.user || {};
      ST.usage = data.usage || { messagesCount: 0 };
      ST.activity = Array.isArray(data.activity) ? data.activity : [];
      ST.settings = data.settings || { cooldown: 30 };
      resolve();
    });
  });
}

async function save() {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        isActive: ST.isActive,
        automationActive: ST.isActive,
        isPro: ST.isPro,
        templates: ST.templates,
        rules: ST.rules,
        user: ST.user,
        usage: ST.usage,
        activity: ST.activity,
        settings: ST.settings,
      },
      resolve,
    );
  });
}

// ── RENDER ALL ─────────────────────────────────────────────────────────────
function renderAll() {
  renderHeader();
  renderDashboard();
  renderTemplates();
  renderRules();
  renderProfile();
  renderSettings();
}

function renderHeader() {
  const on = ST.isActive;
  const pill = document.getElementById("status-pill");
  const dot = document.getElementById("dot");
  const txt = document.getElementById("status-text");
  pill.className = "status-pill " + (on ? "on" : "off");
  dot.className = "dot" + (on ? " on" : "");
  txt.textContent = on ? "Active" : "Paused";
  document.getElementById("toggle").checked = on;
}

function renderDashboard() {
  document.getElementById("stat-templates").textContent = ST.templates.length;
  document.getElementById("stat-rules").textContent = ST.rules.length;
  document.getElementById("stat-sent").textContent =
    ST.usage.messagesCount || 0;

  const activeLabel = document.getElementById("stat-active-label");
  activeLabel.textContent = ST.isActive ? "Active" : "Inactive";
  activeLabel.className = "stat-sub " + (ST.isActive ? "active" : "total");

  // Plan card
  const cnt = ST.usage.messagesCount || 0;
  const limit = ST.isPro ? "∞" : 10;
  document.getElementById("plan-badge").textContent = ST.isPro ? "PRO" : "FREE";
  document.getElementById("plan-count").textContent =
    cnt + "/" + limit + " today";
  document.getElementById("plan-label").textContent = ST.isPro
    ? "Unlimited replies active 🎉"
    : "Upgrade for unlimited replies";
  document.getElementById("upgrade-btn").style.display = ST.isPro ? "none" : "";

  renderActivity();
}

function renderActivity() {
  const list = document.getElementById("activity-list");
  if (!ST.activity.length) {
    list.innerHTML =
      '<div class="no-activity">No activity yet. Replies will appear here.</div>';
    return;
  }
  // Show last 5
  const recent = ST.activity.slice(-5).reverse();
  const colors = ["#2563EB", "#059669", "#7C3AED", "#DC2626", "#D97706"];
  list.innerHTML = recent
    .map(
      (a, i) => `
    <div class="activity-item">
      <div class="activity-avatar" style="background:${colors[i % colors.length]}">${(a.chat || "A").charAt(0).toUpperCase()}</div>
      <div class="activity-body">
        <div class="activity-title">${esc(a.title || "Auto reply sent")}</div>
        <div class="activity-desc">${esc(a.desc || "")}</div>
      </div>
      <div class="activity-meta">
        <div class="activity-time">${a.time || ""}</div>
        <span class="activity-check">✓</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderTemplates() {
  const list = document.getElementById("tpl-list");
  if (!ST.templates.length) {
    list.innerHTML =
      '<div class="empty">No templates yet. Add one below.</div>';
    populateRuleSelect();
    return;
  }
  list.innerHTML = ST.templates
    .map(
      (t) => `
    <div class="item">
      <div class="item-body">
        <div class="item-name">${esc(t.name)}</div>
        <div class="item-preview">${esc((t.text || "").substring(0, 65))}…</div>
      </div>
      <button class="del-btn" data-id="${t.id}" title="Delete">×</button>
    </div>
  `,
    )
    .join("");

  list.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      ST.templates = ST.templates.filter((t) => t.id !== btn.dataset.id);
      ST.rules = ST.rules.filter((r) => r.templateId !== btn.dataset.id);
      await save();
      renderAll();
      notify("Template deleted");
    });
  });
  populateRuleSelect();
}

function renderRules() {
  const list = document.getElementById("rule-list");
  if (!ST.rules.length) {
    list.innerHTML = '<div class="empty">No rules yet. Add one below.</div>';
    return;
  }
  list.innerHTML = ST.rules
    .map((r) => {
      const tpl = ST.templates.find((t) => t.id === r.templateId);
      return `
      <div class="item">
        <div class="item-body">
          <div class="item-name">"${esc(r.keyword)}" → ${esc(tpl ? tpl.name : "(deleted)")}</div>
          <div class="item-preview">Match: ${r.matchType || "contains"}</div>
          <span class="item-badge">Active</span>
        </div>
        <button class="del-btn" data-id="${r.id}" title="Delete">×</button>
      </div>
    `;
    })
    .join("");

  list.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      ST.rules = ST.rules.filter((r) => r.id !== btn.dataset.id);
      await save();
      renderRules();
      renderDashboard();
      notify("Rule deleted");
    });
  });
}

function renderProfile() {
  document.getElementById("biz-name").value = ST.user.businessName || "";
  document.getElementById("biz-email").value =
    ST.user.businessEmail || ST.user.ownerEmail || "";
  document.getElementById("biz-phone").value =
    ST.user.phoneNumber || ST.user.ownerPhone || "";
  document.getElementById("biz-sig").value = ST.user.signature || "";
}

function renderSettings() {
  const cd = document.getElementById("setting-cooldown");
  if (cd) cd.value = ST.settings.cooldown || 30;
}

function populateRuleSelect() {
  const sel = document.getElementById("rule-tpl");
  if (!sel) return;
  sel.innerHTML = ST.templates.length
    ? '<option value="">-- Choose template --</option>' +
      ST.templates
        .map((t) => `<option value="${t.id}">${esc(t.name)}</option>`)
        .join("")
    : '<option value="">-- Create a template first --</option>';
}

// ── BIND EVENTS ────────────────────────────────────────────────────────────
function bindAll() {
  // SIDEBAR NAV
  document.querySelectorAll(".nav-item").forEach((nav) => {
    nav.addEventListener("click", () => {
      document
        .querySelectorAll(".nav-item")
        .forEach((n) => n.classList.remove("active"));
      document
        .querySelectorAll(".panel")
        .forEach((p) => p.classList.remove("active"));
      nav.classList.add("active");
      const panel = document.getElementById("tab-" + nav.dataset.tab);
      if (panel) {
        panel.classList.add("active");
      }
      if (nav.dataset.tab === "automation") populateRuleSelect();
    });
  });

  // TOGGLE
  document.getElementById("toggle").addEventListener("change", async (e) => {
    ST.isActive = e.target.checked;
    await save();
    renderHeader();
    renderDashboard();
    notifyWhatsApp();
    notify(ST.isActive ? "✅ Auto-reply ON" : "⏸ Auto-reply paused");
  });

  // UPGRADE
  document
    .getElementById("upgrade-btn")
    .addEventListener("click", () => openPayment());

  // ADD TEMPLATE
  document.getElementById("tpl-add-btn").addEventListener("click", async () => {
    const name = document.getElementById("tpl-name").value.trim();
    const text = document.getElementById("tpl-text").value.trim();
    if (!name) {
      notify("Enter a template name", "error");
      return;
    }
    if (!text) {
      notify("Enter a message", "error");
      return;
    }
    if (!ST.isPro && ST.templates.length >= 3) {
      notify("Free plan: 3 templates max. Upgrade!", "warn");
      openPayment();
      return;
    }
    ST.templates.push({
      id: "tpl_" + Date.now(),
      name,
      text,
      createdAt: Date.now(),
    });
    document.getElementById("tpl-name").value = "";
    document.getElementById("tpl-text").value = "";
    await save();
    renderAll();
    notify("Template saved ✓");
  });

  // ADD RULE
  document
    .getElementById("rule-add-btn")
    .addEventListener("click", async () => {
      const kw = document.getElementById("rule-kw").value.trim();
      const mt = document.getElementById("rule-match").value;
      const tid = document.getElementById("rule-tpl").value;
      if (!kw) {
        notify("Enter a keyword", "error");
        return;
      }
      if (!tid) {
        notify("Select a template first", "error");
        return;
      }
      if (!ST.isPro && ST.rules.length >= 5) {
        notify("Free plan: 5 rules max. Upgrade!", "warn");
        openPayment();
        return;
      }
      ST.rules.push({
        id: "rule_" + Date.now(),
        keyword: kw,
        matchType: mt,
        templateId: tid,
        active: true,
        createdAt: Date.now(),
      });
      document.getElementById("rule-kw").value = "";
      await save();
      renderAll();
      notify("Rule added ✓");
    });

  // SAVE PROFILE
  document
    .getElementById("profile-save-btn")
    .addEventListener("click", async () => {
      const name = document.getElementById("biz-name").value.trim();
      const email = document.getElementById("biz-email").value.trim();
      const phone = document.getElementById("biz-phone").value.trim();
      const sig = document.getElementById("biz-sig").value.trim();
      ST.user.businessName = name;
      ST.user.businessEmail = email;
      ST.user.ownerEmail = email;
      ST.user.phoneNumber = phone;
      ST.user.ownerPhone = phone;
      ST.user.signature =
        sig ||
        (name
          ? "Best regards,\n" +
            name +
            (phone ? "\n" + phone : "") +
            (email ? "\n" + email : "")
          : "");
      await save();
      notifyWhatsApp();
      notify("Profile saved ✓");
    });

  // SAVE SETTINGS
  document
    .getElementById("settings-save-btn")
    .addEventListener("click", async () => {
      const cd =
        parseInt(document.getElementById("setting-cooldown").value) || 30;
      ST.settings.cooldown = Math.max(5, Math.min(300, cd));
      document.getElementById("setting-cooldown").value = ST.settings.cooldown;
      await save();
      notifyWhatsApp();
      notify("Settings saved ✓");
    });

  // ACTIVATE PRO BUTTON (in settings)
  document
    .getElementById("activate-pro-btn")
    .addEventListener("click", () => openPayment());

  // EXPORT
  document.getElementById("export-btn").addEventListener("click", () => {
    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      templates: ST.templates,
      rules: ST.rules,
      user: ST.user,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "proreply-backup.json",
    });
    a.click();
    URL.revokeObjectURL(url);
    notify("Backup downloaded ✓");
  });

  // IMPORT
  document
    .getElementById("import-btn")
    .addEventListener("click", () =>
      document.getElementById("import-file").click(),
    );
  document
    .getElementById("import-file")
    .addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data.templates || !data.rules) {
          notify("Invalid backup file", "error");
          return;
        }
        const eIds = new Set(ST.templates.map((t) => t.id));
        const rIds = new Set(ST.rules.map((r) => r.id));
        ST.templates.push(...data.templates.filter((t) => !eIds.has(t.id)));
        ST.rules.push(...data.rules.filter((r) => !rIds.has(r.id)));
        if (data.user) ST.user = Object.assign({}, data.user, ST.user);
        await save();
        renderAll();
        notify("Restored ✓");
      } catch (_) {
        notify("Failed to read file", "error");
      }
      e.target.value = "";
    });

  // HELP / PRIVACY
  document
    .getElementById("help-btn")
    .addEventListener("click", () =>
      chrome.tabs.create({ url: chrome.runtime.getURL("../help.html") }),
    );
  document
    .getElementById("privacy-btn")
    .addEventListener("click", () =>
      chrome.tabs.create({ url: chrome.runtime.getURL("../privacy.html") }),
    );
  document.getElementById("help-link").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("../help.html") });
  });
  document.getElementById("privacy-link").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("../privacy.html") });
  });
}

// ── PAYMENT / PRO ──────────────────────────────────────────────────────────
function openPayment() {
  chrome.tabs.create({ url: PAYMENT_LINK });
  showCodeEntry();
}

function showCodeEntry() {
  document.getElementById("code-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "code-overlay";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:99999;";
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:22px;width:320px;box-shadow:0 10px 40px rgba(0,0,0,.25);font-family:-apple-system,sans-serif;">
      <div style="text-align:center;margin-bottom:14px;">
        <div style="font-size:28px;margin-bottom:4px;">🔑</div>
        <div style="font-size:15px;font-weight:800;color:#1F2937;">Activate Pro</div>
        <div style="font-size:11px;color:#6B7280;margin-top:4px;">Enter the code sent to you after payment</div>
      </div>
      <label style="font-size:11px;font-weight:600;color:#4B5563;display:block;margin-bottom:3px;">Email used during payment</label>
      <input id="code-email" type="email" placeholder="you@example.com" style="width:100%;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:10px;outline:none;">
      <label style="font-size:11px;font-weight:600;color:#4B5563;display:block;margin-bottom:3px;">Activation Code</label>
      <input id="code-input" type="text" placeholder="PROREPLY-XXXX-XXXX" maxlength="18" style="width:100%;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:8px;font-size:13px;font-family:monospace;letter-spacing:1px;box-sizing:border-box;text-transform:uppercase;margin-bottom:6px;outline:none;">
      <div id="code-err" style="font-size:11px;color:#EF4444;min-height:16px;margin-bottom:10px;"></div>
      <div style="display:flex;gap:8px;">
        <button id="code-cancel" style="flex:1;padding:9px;background:#F3F4F6;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">Cancel</button>
        <button id="code-submit" style="flex:2;padding:9px;background:#2563EB;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Activate Pro</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("code-input").addEventListener("input", function () {
    let v = this.value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (v.length > 8) v = v.slice(0, 8) + "-" + v.slice(8);
    if (v.length > 14) v = v.slice(0, 13) + "-" + v.slice(13);
    if (!v.startsWith("PROREPLY")) v = "PROREPLY" + v;
    this.value = v.slice(0, 18);
  });

  document
    .getElementById("code-cancel")
    .addEventListener("click", () => overlay.remove());
  document.getElementById("code-submit").addEventListener("click", async () => {
    const email = document.getElementById("code-email").value.trim();
    const code = document
      .getElementById("code-input")
      .value.trim()
      .toUpperCase();
    const err = document.getElementById("code-err");
    const btn = document.getElementById("code-submit");
    err.textContent = "";
    if (!email.includes("@")) {
      err.textContent = "Enter the email you used to pay.";
      return;
    }
    if (code.length < 18) {
      err.textContent = "Code must be PROREPLY-XXXX-XXXX format.";
      return;
    }
    btn.textContent = "Verifying…";
    btn.disabled = true;
    const used =
      (await new Promise((r) => chrome.storage.local.get("usedCodes", r)))
        .usedCodes || [];
    if (used.includes(code)) {
      err.textContent = "This code has already been used.";
      btn.textContent = "Activate Pro";
      btn.disabled = false;
      return;
    }
    const valid = await verifyCode(code, email);
    if (!valid) {
      err.textContent = "Invalid code or wrong email.";
      btn.textContent = "Activate Pro";
      btn.disabled = false;
      return;
    }
    used.push(code);
    ST.isPro = true;
    await save();
    await new Promise((r) =>
      chrome.storage.local.set(
        {
          usedCodes: used,
          proActivatedAt: Date.now(),
          proExpiresAt: Date.now() + CODE_EXPIRY,
        },
        r,
      ),
    );
    overlay.remove();
    renderAll();
    notify("🎉 Pro activated! Unlimited replies unlocked.");
    notifyWhatsApp();
  });
}

async function verifyCode(code, email) {
  const step = 24 * 60 * 60 * 1000,
    now = Date.now();
  for (let i = 0; i <= 62; i++) {
    const exp = Math.round((now + i * step) / step) * step;
    const hash = await sha256(
      email.toLowerCase().trim() + ":" + exp + ":" + CODE_SALT,
    );
    const short = hash.slice(0, 8).toUpperCase();
    const check = "PROREPLY-" + short.slice(0, 4) + "-" + short.slice(4, 8);
    if (check === code) return true;
  }
  return false;
}

async function sha256(msg) {
  const buf = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

window.generateCode = async function (email) {
  const exp =
    Math.round((Date.now() + CODE_EXPIRY) / (24 * 60 * 60 * 1000)) *
    (24 * 60 * 60 * 1000);
  const hash = await sha256(
    email.toLowerCase().trim() + ":" + exp + ":" + CODE_SALT,
  );
  const short = hash.slice(0, 8).toUpperCase();
  const code = "PROREPLY-" + short.slice(0, 4) + "-" + short.slice(4, 8);
  console.log(
    "%c" + code,
    "font-size:20px;font-weight:bold;color:#2563EB;background:#EEF2FF;padding:6px 12px;border-radius:6px;",
  );
  console.log("Send to:", email);
  return code;
};

// ── WHATSAPP NOTIFY ────────────────────────────────────────────────────────
async function notifyWhatsApp() {
  try {
    const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
    for (const tab of tabs)
      chrome.tabs
        .sendMessage(tab.id, { action: "updateState" })
        .catch(() => {});
  } catch (_) {}
}

// ── TOAST ──────────────────────────────────────────────────────────────────
function notify(msg, type) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background =
    type === "error" ? "#EF4444" : type === "warn" ? "#F59E0B" : "#059669";
  el.style.display = "block";
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.display = "none";
  }, 3000);
}

// ── UTILS ──────────────────────────────────────────────────────────────────
function esc(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
