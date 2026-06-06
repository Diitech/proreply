// ProReply Content Script - Final v4
// If you see this in console, injection is working
console.log("[ProReply] ✅ Content script injected successfully");
window.__proreply_loaded = true;

(function () {
  "use strict";

  const SEL = {
    INPUT: 'div[data-testid="conversation-compose-box-input"]',
    MESSAGES: 'div[data-testid^="conv-msg-"]',
    MSG_TEXT: 'span[dir="ltr"]',
    SEND: '[data-testid="send"], [data-icon="send"], button[aria-label="Send"]',
    CHAT_PANEL: '[data-testid="conversation-panel-messages"]',
    CHAT_LIST: '[data-testid="chat-list"]',
    CHAT_ROW: '[data-testid^="list-item-"]',
    UNREAD_BADGE: 'span[aria-label*="unread message"]',
    CHAT_NAME: '[data-testid="conversation-info-header-chat-title"]',
  };

  const s = {
    isSweeping: false,
    isActive: false,
    isPro: false,
    user: {},
    templates: [],
    rules: [],
    settings: {},
    usage: { messagesCount: 0 },
    chatCooldowns: {},
    processedIds: new Set(),
    isTyping: false,
    isInitialized: false,
    panelObserver: null,
  };

  // ── BOOT ──────────────────────────────────────────────────────────────────
  async function boot() {
    log("Boot started");

    // Wait for Chrome storage API
    let tries = 0;
    while (typeof chrome === "undefined" || !chrome.storage) {
      await sleep(200);
      if (++tries > 30) {
        log("ERROR: Chrome API never ready");
        return;
      }
    }
    log("Chrome API ready");

    await loadState();
    listenStorage();
    listenMessages();

    s.isInitialized = true;
    log(
      "Ready | active=" +
        s.isActive +
        " templates=" +
        s.templates.length +
        " rules=" +
        s.rules.length,
    );

    // Show banner once chat list appears
    waitAndBanner();

    // Start scanning
    setInterval(safeSweep, 3000);
    setInterval(setupPanelObserver, 2000);
    setupPanelObserver();

    log("All scan loops started");
  }

  function waitAndBanner() {
    const id = setInterval(() => {
      if (document.querySelector(SEL.CHAT_LIST)) {
        clearInterval(id);
        log("WhatsApp ready");
        if (s.isActive)
          banner("ProReply active — scanning all chats", "success");
        else banner("ProReply loaded — toggle ON in popup to start", "info");
      }
    }, 500);
  }

  // ── PANEL OBSERVER ────────────────────────────────────────────────────────
  function setupPanelObserver() {
    if (s.panelObserver) {
      s.panelObserver.disconnect();
      s.panelObserver = null;
    }
    const panel = document.querySelector(SEL.CHAT_PANEL);
    if (!panel) return;
    s.panelObserver = new MutationObserver(
      debounce(() => {
        if (s.isActive && !s.isTyping) replyInCurrentChat();
      }, 300),
    );
    s.panelObserver.observe(panel, { childList: true, subtree: true });
  }

  // ── SWEEP ALL UNREAD CHATS ────────────────────────────────────────────────
  async function safeSweep() {
    if (s.isSweeping) return;
    s.isSweeping = true;
    try {
      if (!s.isActive || !s.isInitialized || s.isTyping) return;
      if (!s.rules.length || !s.templates.length) return;

      const rows = document.querySelectorAll(SEL.CHAT_ROW);
      const unread = Array.from(rows).filter((r) =>
        r.querySelector(SEL.UNREAD_BADGE),
      );
      if (!unread.length) return;

      log("Found " + unread.length + " unread chats");

      for (const row of unread) {
        if (!s.isActive || s.isTyping) break;

        // Get preview name for logging only
        const previewName =
          (
            row.querySelector('[data-testid="cell-frame-title"] span') ||
            row.querySelector("span[title]") ||
            row.querySelector('span[dir="auto"]')
          )?.textContent?.trim() || "unknown";

        // Click cell-frame-container — confirmed correct click target
        const clickable =
          row.querySelector('[data-testid="cell-frame-container"]') ||
          row.querySelector('div[tabindex="-1"]') ||
          row;
        clickable.click();
        log("Clicked chat: " + previewName);

        // Wait up to 5s for messages to appear
        let waited = 0;
        while (waited < 5000) {
          await sleep(400);
          waited += 400;
          if (document.querySelectorAll(SEL.MESSAGES).length > 0) break;
        }

        if (!document.querySelectorAll(SEL.MESSAGES).length) {
          log("No messages after 5s - skipping: " + previewName);
          continue;
        }

        // Wait for input box ready
        await sleep(500);
        await replyInCurrentChat();
        // After reply, pause 2s before next chat to avoid rate issues
        await sleep(2000);
      }
    } catch (e) {
      log("sweep error: " + e.message);
    } finally {
      s.isSweeping = false;
    }
  }

  // ── REPLY IN CURRENT CHAT ─────────────────────────────────────────────────
  async function replyInCurrentChat() {
    if (!s.isActive || s.isTyping || !s.isInitialized) return;
    if (!s.rules.length || !s.templates.length) {
      log("Skip: rules=" + s.rules.length + " templates=" + s.templates.length);
      return;
    }

    const msgs = document.querySelectorAll(SEL.MESSAGES);
    if (!msgs.length) return;

    const recent = Array.from(msgs).slice(-10);
    for (const el of recent) {
      if (isOutgoing(el)) continue;

      const id = el.getAttribute("data-testid");
      if (!id || s.processedIds.has(id)) continue;
      s.processedIds.add(id);

      const text = extractText(el);
      if (!text || text.length < 2) continue;

      log('Incoming: "' + text.substring(0, 60) + '"');

      const rule = matchRule(text);
      if (!rule) {
        log('No rule for: "' + text.substring(0, 40) + '"');
        continue;
      }

      const chat = getChatName();
      const waited = Date.now() - (s.chatCooldowns[chat] || 0);
      if (waited < 30000) {
        log(
          "Cooldown " + Math.ceil((30000 - waited) / 1000) + "s left: " + chat,
        );
        continue;
      }

      if (s.usage.messagesCount >= (s.isPro ? 999999 : 10)) {
        banner("Daily limit reached — upgrade to Pro", "warning");
        return;
      }

      log("Replying to " + chat + " with rule: " + rule.keyword);
      await sendReply(rule, text, chat);
    }

    if (s.processedIds.size > 5000)
      s.processedIds = new Set(Array.from(s.processedIds).slice(-2500));
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function isOutgoing(el) {
    if (el.querySelector('[class*="message-out"]')) return true;
    if (el.querySelector('[data-testid="tail-out"]')) return true;
    let node = el;
    let d = 0;
    while (node && node.id !== "main" && d++ < 8) {
      if ((node.className || "").includes("message-out")) return true;
      node = node.parentElement;
    }
    return false;
  }

  function extractText(el) {
    for (const sp of el.querySelectorAll(SEL.MSG_TEXT)) {
      const t = sp.textContent.trim();
      if (t.length >= 2 && !/^\d{1,2}:\d{2}(?: [AP]M)?$/.test(t)) return t;
    }
    const c = el.querySelector(".copyable-text");
    if (c) {
      const t = c.textContent.trim();
      if (t.length >= 2) return t;
    }
    return null;
  }

  function matchRule(text) {
    const lower = text.toLowerCase().trim();
    return (
      s.rules
        .filter((r) => r.active !== false)
        .sort((a, b) => (a.priority || 999) - (b.priority || 999))
        .find((r) => {
          const kw = (r.keyword || "").toLowerCase().trim();
          if (!kw) return false;
          const mt = (r.matchType || "contains").toLowerCase();
          if (mt === "exact") return lower === kw;
          if (mt === "startswith" || mt === "starts")
            return lower.startsWith(kw);
          return lower.includes(kw);
        }) || null
    );
  }

  function getChatName() {
    const el = document.querySelector(SEL.CHAT_NAME);
    if (el?.textContent.trim()) return el.textContent.trim();
    const sp = document.querySelector(
      '[data-testid="conversation-header"] span[title]',
    );
    return sp ? sp.getAttribute("title") || sp.textContent.trim() : "there";
  }

  // ── SEND REPLY ────────────────────────────────────────────────────────────
  async function sendReply(rule, incomingText, chat) {
    try {
      s.isTyping = true;
      log("sendReply: looking for template id=" + rule.templateId);

      const tpl = s.templates.find((t) => t.id === rule.templateId);
      if (!tpl) {
        log(
          "Template not found! Available: " +
            s.templates.map((t) => t.id + ":" + t.name).join(", "),
        );
        s.isTyping = false;
        return;
      }
      log("Template found: " + tpl.name);

      const body = tpl.text || tpl.content || "";
      if (!body.trim()) {
        log("Template body is empty!");
        s.isTyping = false;
        return;
      }

      if (rule.delayMinutes > 0) {
        chrome.runtime
          .sendMessage({
            action: "scheduleMessage",
            rule,
            senderName: chat,
            delayMinutes: rule.delayMinutes,
          })
          .catch(() => {});
        banner("Reply scheduled " + rule.delayMinutes + " min", "info");
        s.isTyping = false;
        return;
      }

      const sig = buildSig();
      const fullMsg = fillPlaceholders(body, chat) + (sig ? "\n\n" + sig : "");
      log("Typing message: " + fullMsg.substring(0, 60));

      await typeAndSend(fullMsg);

      s.chatCooldowns[chat] = Date.now();
      s.usage.messagesCount++;

      // Log to activity feed for popup dashboard
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const tplName = tpl ? tpl.name || "" : "";
      chrome.storage.local.get("activity", (r) => {
        const feed = Array.isArray(r.activity) ? r.activity : [];
        feed.push({
          chat: chat,
          title: "Auto reply sent",
          desc: tplName
            ? "Template: " + tplName
            : incomingText.substring(0, 40),
          time: time,
          ts: Date.now(),
        });
        // Keep last 50 entries
        if (feed.length > 50) feed.splice(0, feed.length - 50);
        chrome.storage.local.set({ usage: s.usage, activity: feed });
      });

      s.isTyping = false;
      // Mark chat as read
      try {
        const inp = document.querySelector(SEL.INPUT);
        if (inp) {
          inp.focus();
          await sleep(200);
          inp.blur();
        }
      } catch (_) {}
      banner('✓ Replied: "' + incomingText.substring(0, 30) + '…"', "success");
      log("SUCCESS: Replied to " + chat);
    } catch (e) {
      s.isTyping = false;
      log("sendReply FAILED: " + e.message);
      banner("Reply failed: " + e.message, "error");
    }
  }

  // ── TYPE AND SEND ─────────────────────────────────────────────────────────
  async function typeAndSend(message) {
    log("typeAndSend: finding input box...");

    let input = null;
    for (let i = 0; i < 8 && !input; i++) {
      // Try confirmed selector
      input = document.querySelector(SEL.INPUT);
      // Try any visible contenteditable inside #main
      if (!input) {
        const main = document.querySelector("#main");
        if (main) {
          for (const e of main.querySelectorAll(
            'div[contenteditable="true"]',
          )) {
            if (e.offsetParent !== null) {
              input = e;
              break;
            }
          }
        }
      }
      if (!input) {
        log("Input not found, retry " + (i + 1) + "/8");
        await sleep(500);
      }
    }

    if (!input)
      throw new Error("Input box not found after 8 retries — is a chat open?");
    log("Input found: " + (input.getAttribute("data-testid") || input.tagName));

    // Focus and clear
    input.focus();
    input.click();
    await sleep(150);
    input.innerHTML = "";
    input.textContent = "";
    await sleep(100);

    // Method 1: execCommand
    input.focus();
    const ok1 = document.execCommand("insertText", false, message);
    await sleep(200);
    log(
      "execCommand result: " +
        ok1 +
        " | content: '" +
        input.textContent.substring(0, 30) +
        "'",
    );

    // Method 2: DataTransfer paste
    if (!input.textContent.trim()) {
      log("Trying clipboard paste...");
      try {
        const dt = new DataTransfer();
        dt.setData("text/plain", message);
        input.dispatchEvent(
          new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
            clipboardData: dt,
          }),
        );
        await sleep(250);
        log("After paste: '" + input.textContent.substring(0, 30) + "'");
      } catch (e) {
        log("Paste failed: " + e.message);
      }
    }

    // Method 3: innerText
    if (!input.textContent.trim()) {
      log("Trying innerText...");
      input.innerText = message;
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: message,
        }),
      );
      await sleep(200);
      log("After innerText: '" + input.textContent.substring(0, 30) + "'");
    }

    // Method 4: set on first <p> inside lexical editor
    if (!input.textContent.trim()) {
      log("Trying <p> child...");
      const p = input.querySelector("p");
      if (p) {
        p.textContent = message;
        p.dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(200);
        log("After <p>: '" + input.textContent.substring(0, 30) + "'");
      }
    }

    if (!input.textContent.trim()) {
      throw new Error(
        "All 4 insertion methods failed — WhatsApp blocked text input",
      );
    }

    log("Text inserted OK. Firing events...");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: message,
      }),
    );
    await sleep(300);

    // Click send button
    const btn = document.querySelector(SEL.SEND);
    if (btn && btn.offsetParent !== null) {
      log("Clicking send button");
      btn.click();
      await sleep(200);
      return;
    }

    // Enter key fallback
    log("No send button — pressing Enter");
    ["keydown", "keypress", "keyup"].forEach((type) =>
      input.dispatchEvent(
        new KeyboardEvent(type, {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
          composed: true,
        }),
      ),
    );
    await sleep(200);
  }

  function fillPlaceholders(text, name) {
    const now = new Date();
    const first = (name || "there").split(" ")[0];
    return text
      .replace(/\{\{name\}\}/gi, first)
      .replace(/\{\{date\}\}/gi, now.toLocaleDateString())
      .replace(
        /\{\{time\}\}/gi,
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      )
      .replace(/\{\{business\}\}/gi, s.user.businessName || s.user.name || "us")
      .replace(/\{\{order_id\}\}/gi, "")
      .replace(/\{\{custom\}\}/gi, "");
  }

  function buildSig() {
    const u = s.user;
    const name = u.businessName || u.name || "";
    const email = u.businessEmail || u.ownerEmail || u.email || "";
    const phone = u.phoneNumber || u.ownerPhone || u.phone || "";
    const lines = [];
    if (name) lines.push(name);
    const contacts = [email, phone].filter(Boolean);
    if (contacts.length) lines.push(contacts.join(" | "));
    return lines.length ? "Best regards,\n" + lines.join("\n") : "";
  }

  // ── STORAGE ───────────────────────────────────────────────────────────────
  async function loadState() {
    try {
      const r = await chrome.storage.local.get(null);
      s.isActive =
        r.isActive !== undefined
          ? r.isActive
          : r.automationActive !== undefined
            ? r.automationActive
            : false;
      s.isPro = r.isPro || false;
      s.user = r.user || {};
      s.templates = Array.isArray(r.templates) ? r.templates : [];
      s.rules = Array.isArray(r.rules) ? r.rules : [];
      s.settings = r.settings || {};
      s.usage = r.usage || { messagesCount: 0 };
      log(
        "Loaded: active=" +
          s.isActive +
          " templates=" +
          s.templates.length +
          " rules=" +
          s.rules.length,
      );
    } catch (e) {
      log("loadState error: " + e.message);
    }
  }

  function listenStorage() {
    if (!chrome?.storage) return;
    chrome.storage.onChanged.addListener((ch, ns) => {
      if (ns !== "local") return;
      if (ch.isActive) s.isActive = ch.isActive.newValue;
      if (ch.automationActive) s.isActive = ch.automationActive.newValue;
      if (ch.isPro) s.isPro = !!ch.isPro.newValue;
      if (ch.user) s.user = ch.user.newValue || {};
      if (ch.templates) s.templates = ch.templates.newValue || [];
      if (ch.rules) s.rules = ch.rules.newValue || [];
      if (ch.settings) s.settings = ch.settings.newValue || {};
      if (ch.usage) s.usage = ch.usage.newValue || { messagesCount: 0 };
      log("Storage updated: active=" + s.isActive);
    });
  }

  function listenMessages() {
    if (!chrome?.runtime?.onMessage) return;
    chrome.runtime.onMessage.addListener((req, _, respond) => {
      (async () => {
        switch (req.action) {
          case "refreshState":
          case "updateState":
            await loadState();
            if (s.isActive) banner("ProReply active", "success");
            respond({ success: true });
            break;
          case "getStatus":
            respond({
              isActive: s.isActive,
              messagesSent: s.usage.messagesCount,
              rulesCount: s.rules.length,
              templatesCount: s.templates.length,
              isTyping: s.isTyping,
            });
            break;
          case "pauseAutomation":
            s.isActive = false;
            banner("ProReply paused", "info");
            respond({ success: true });
            break;
          case "resumeAutomation":
            s.isActive = true;
            banner("ProReply active", "success");
            respond({ success: true });
            break;
          case "sendScheduledMessage":
            if (!req.rule) {
              respond({ error: "No rule" });
              break;
            }
            try {
              const tpl = s.templates.find((t) => t.id === req.rule.templateId);
              if (!tpl) {
                respond({ error: "No template" });
                break;
              }
              s.isTyping = true;
              const body = tpl.text || tpl.content || "";
              await typeAndSend(
                fillPlaceholders(body, req.senderName || "there") +
                  (buildSig() ? "\n\n" + buildSig() : ""),
              );
              s.isTyping = false;
              s.usage.messagesCount++;
              chrome.storage.local.set({ usage: s.usage });
              banner("Scheduled reply sent!", "success");
              respond({ success: true });
            } catch (e) {
              s.isTyping = false;
              respond({ error: e.message });
            }
            break;
          default:
            respond({ error: "Unknown: " + req.action });
        }
      })();
      return true;
    });
  }

  // ── UTILS ─────────────────────────────────────────────────────────────────
  function log(m) {
    console.log("[ProReply] " + m);
  }
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  function debounce(fn, ms) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  }

  function banner(msg, type) {
    document.getElementById("pr-banner")?.remove();
    if (!document.getElementById("pr-css")) {
      const st = document.createElement("style");
      st.id = "pr-css";
      st.textContent =
        "@keyframes prIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes prOut{from{opacity:1}to{transform:translateX(110%);opacity:0}}";
      document.head.appendChild(st);
    }
    const BG = {
      success: "#10B981",
      error: "#EF4444",
      warning: "#F59E0B",
      info: "#4A90E2",
    };
    const BR = {
      success: "#059669",
      error: "#DC2626",
      warning: "#D97706",
      info: "#357ABD",
    };
    const el = document.createElement("div");
    el.id = "pr-banner";
    el.style.cssText =
      "position:fixed;bottom:24px;right:16px;padding:10px 16px;background:" +
      (BG[type] || BG.info) +
      ";color:#fff;border-radius:10px;font-family:-apple-system,sans-serif;font-size:13px;font-weight:500;z-index:2147483647;box-shadow:0 4px 16px rgba(0,0,0,.25);max-width:300px;border-left:4px solid " +
      (BR[type] || BR.info) +
      ";animation:prIn .3s ease;";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.animation = "prOut .3s ease forwards";
      setTimeout(() => el.remove(), 320);
    }, 4000);
  }

  // ── START ─────────────────────────────────────────────────────────────────
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
