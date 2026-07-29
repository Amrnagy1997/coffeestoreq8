// Dashboard Client Application Script

document.addEventListener("DOMContentLoaded", () => {
  fetchStatus();
  fetchConfig();

  // Refresh status every 4 seconds
  setInterval(fetchStatus, 4000);

  // Setup Event Listeners
  document.getElementById("toggleBotBtn").addEventListener("click", toggleBotActive);
  document.getElementById("simConnectBtn").addEventListener("click", togglePairingSimulation);
  document.getElementById("addRuleForm").addEventListener("submit", handleAddRule);
  document.getElementById("getPairingCodeBtn")?.addEventListener("click", handleGetPairingCode);
});

async function handleGetPairingCode() {
  const input = document.getElementById("pairingPhoneInput");
  const displayBox = document.getElementById("pairingCodeDisplay");
  const codeText = document.getElementById("codeText");
  const phone = input.value.trim();

  if (!phone) {
    alert("يرجى إدخال رقم الهاتف أولاً مع كود الدولة (مثال: 96590001122)");
    return;
  }

  codeText.innerText = "جاري طلب الكود من الواتساب...";
  displayBox.classList.remove("hidden");

  try {
    const res = await fetch("/api/request-pairing-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();

    if (data.success && data.pairingCode) {
      codeText.innerText = data.pairingCode;
    } else {
      codeText.innerText = data.error || "تأكد من إدخال الرقم الصحيح وانتظر لحظات.";
    }
  } catch (err) {
    codeText.innerText = "حدث خطأ أثناء الاتصال بالسيرفر.";
  }
}


let isBotActive = true;

async function fetchStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();

    if (data.success && data.state) {
      const state = data.state;
      const statusBadge = document.getElementById("statusBadge");
      const statusText = document.getElementById("statusText");
      const qrImage = document.getElementById("qrImage");
      const qrOverlay = document.getElementById("qrOverlay");
      const connectedPhoneText = document.getElementById("connectedPhoneText");
      const statConnectedPhone = document.getElementById("statConnectedPhone");

      if (state.status === "CONNECTED") {
        statusBadge.className = "badge badge-success";
        statusText.innerText = "مرتبط بالواتساب ✅";
        qrOverlay.classList.remove("hidden");
        const phone = state.botPhone || "+965 9000 1122";
        connectedPhoneText.innerText = phone;
        statConnectedPhone.innerText = phone;
      } else {
        statusBadge.className = "badge badge-warning";
        statusText.innerText = "في انتظار مسح الـ QR Code...";
        qrOverlay.classList.add("hidden");
        statConnectedPhone.innerText = "في انتظار المسح";
        if (state.qrCodeDataUrl) {
          qrImage.src = state.qrCodeDataUrl;
        }
      }

      // Render Logs
      renderLogs(state.logs || []);
    }
  } catch (err) {
    console.error("Error fetching status:", err);
  }
}

async function fetchConfig() {
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    if (data.success && data.config) {
      const config = data.config;
      isBotActive = config.botActive;

      // Update Active Badge
      const toggleBtn = document.getElementById("toggleBotBtn");
      const statBotActive = document.getElementById("statBotActive");

      if (isBotActive) {
        toggleBtn.innerText = "⚡ البوت مفعل تلقائياً (إيقاف)";
        toggleBtn.className = "btn btn-emerald";
        statBotActive.innerText = "مفعل 24/7 ✅";
      } else {
        toggleBtn.innerText = "⏸️ البوت متوقف (تشغيل)";
        toggleBtn.className = "btn btn-amber";
        statBotActive.innerText = "متوقف مؤقتاً ⏸️";
      }

      // Update Rules Count
      document.getElementById("statRulesCount").innerText = `${config.customResponses.length} قواعد`;

      // Render Custom Rules List
      renderRules(config.customResponses);
    }
  } catch (err) {
    console.error("Error fetching config:", err);
  }
}

async function toggleBotActive() {
  isBotActive = !isBotActive;
  try {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botActive: isBotActive }),
    });
    fetchConfig();
  } catch (err) {
    console.error(err);
  }
}

async function togglePairingSimulation() {
  try {
    await fetch("/api/status/toggle", { method: "POST" });
    fetchStatus();
  } catch (err) {
    console.error(err);
  }
}

async function handleAddRule(e) {
  e.preventDefault();
  const keywordInput = document.getElementById("newKeyword");
  const responseInput = document.getElementById("newResponse");

  const keyword = keywordInput.value.trim();
  const response = responseInput.value.trim();

  if (!keyword || !response) return;

  try {
    const res = await fetch("/api/config/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, response }),
    });
    const data = await res.json();
    if (data.success) {
      keywordInput.value = "";
      responseInput.value = "";
      fetchConfig();
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteRule(id) {
  try {
    const res = await fetch(`/api/config/rules/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      fetchConfig();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderRules(rules) {
  const container = document.getElementById("rulesList");
  if (!rules || rules.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">لا توجد قواعد مخصصة بعد.</p>';
    return;
  }

  container.innerHTML = rules
    .map(
      (r) => `
    <div class="rule-item">
      <div class="rule-info">
        <div class="rule-kw">الكلمة: "${r.keyword}"</div>
        <div class="rule-resp">${r.response}</div>
      </div>
      <button onclick="deleteRule('${r.id}')" class="btn btn-danger">حذف 🗑️</button>
    </div>
  `
    )
    .join("");
}

async function handleSendTestMessage() {
  const input = document.getElementById("testMessageInput");
  const message = input.value.trim();
  if (!message) return;

  const resultBox = document.getElementById("testResultBox");
  const ruleBadge = document.getElementById("testRuleBadge");
  const replyContent = document.getElementById("testReplyContent");

  try {
    const res = await fetch("/api/simulate-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();

    if (data.success) {
      resultBox.classList.remove("hidden");
      ruleBadge.innerText = `قاعدة المطابقة: ${data.matchedRule || "DEFAULT"}`;
      ruleBadge.className = "badge badge-success";
      replyContent.innerText = data.reply || "البوت متوقف حالياً.";
      fetchStatus();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderLogs(logs) {
  const tbody = document.getElementById("logsTableBody");
  const totalRepliesElement = document.getElementById("statTotalReplies");

  totalRepliesElement.innerText = `${logs.length} رد`;

  if (!logs || logs.length === 0) {
    tbody.innerHTML = '<tr><td colSpan="4" class="text-center">لا توجد محادثات مسجلة حتى الآن.</td></tr>';
    return;
  }

  tbody.innerHTML = logs
    .map(
      (l) => `
    <tr>
      <td style="color: var(--text-muted);">${l.timestamp}</td>
      <td dir="ltr" style="text-align: right; font-weight: bold;">${l.from}</td>
      <td style="color: var(--coffee-amber);">${l.incomingText}</td>
      <td style="color: var(--wa-green);">${l.replyText.substring(0, 50)}${l.replyText.length > 50 ? "..." : ""}</td>
    </tr>
  `
    )
    .join("");
}
