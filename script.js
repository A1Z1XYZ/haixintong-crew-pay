const sidebar = document.querySelector("[data-sidebar]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const searchInput = document.querySelector("[data-search]");
const batchRows = Array.from(document.querySelectorAll("[data-batch-table] tr"));
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const rangeButtons = Array.from(document.querySelectorAll("[data-range]"));
const toast = document.querySelector("[data-toast]");
const limitInput = document.querySelector("[data-limit]");
const limitOutput = document.querySelector("[data-limit-output]");
const detailTitle = document.querySelector("[data-detail-title]");
const detailStatus = document.querySelector("[data-detail-status]");
const detailAmount = document.querySelector("[data-detail-amount]");
const detailCrew = document.querySelector("[data-detail-crew]");

const money = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

let activeFilter = "all";
let toastTimer;

const batchDetails = {
  "HXT-0820-A": { status: "待审批", statusClass: "pending", amount: "USD 118,400", crew: "63 名船员" },
  "PCS-0819-R": { status: "银行处理中", statusClass: "processing", amount: "USD 76,920", crew: "41 名船员" },
  "HIS-0819-C": { status: "风控复核", statusClass: "risk", amount: "CNY 412,600", crew: "28 名船员" },
  "ORP-0818-L": { status: "待审批", statusClass: "pending", amount: "USD 44,780", crew: "19 名船员" },
  "BLH-0818-U": { status: "清算中", statusClass: "processing", amount: "EUR 96,500", crew: "72 名船员" },
};

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function toggleSidebar(forceOpen) {
  if (!sidebar) return;
  const open = typeof forceOpen === "boolean" ? forceOpen : !sidebar.classList.contains("is-open");
  sidebar.classList.toggle("is-open", open);
  document.body.classList.toggle("sidebar-open", open);
  if (menuToggle) menuToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
}

function updateRows() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  batchRows.forEach((row) => {
    const matchesStatus = activeFilter === "all" || row.dataset.status === activeFilter;
    const matchesQuery = !query || (row.dataset.name || "").toLowerCase().includes(query);
    row.classList.toggle("is-hidden-row", !(matchesStatus && matchesQuery));
  });
}

function setFilter(nextFilter) {
  activeFilter = nextFilter;
  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === nextFilter;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  updateRows();
}

function setDetail(id) {
  const detail = batchDetails[id];
  if (!detail || !detailTitle || !detailStatus || !detailAmount || !detailCrew) return;
  detailTitle.textContent = id;
  detailStatus.textContent = detail.status;
  detailStatus.className = `status ${detail.statusClass}`;
  detailAmount.textContent = detail.amount;
  detailCrew.textContent = detail.crew;
}

function approveRow(button) {
  const row = button.closest("tr");
  if (!row) return;
  const status = row.querySelector(".status");
  if (status) {
    status.textContent = "银行处理中";
    status.className = "status processing";
  }
  row.dataset.status = "processing";
  button.textContent = "查看";
  button.classList.add("muted");
  button.removeAttribute("data-approve");
  showToast("批次已提交审批，状态更新为银行处理中。");
  updateRows();
}

function updateLimit() {
  if (!limitInput || !limitOutput) return;
  limitOutput.textContent = money.format(Number(limitInput.value));
}

menuToggle?.addEventListener("click", () => toggleSidebar());
sidebar?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => toggleSidebar(false));
});
searchInput?.addEventListener("input", updateRows);
filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter || "all"));
});
rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rangeButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    showToast(`已切换到${button.dataset.range}付款视图。`);
  });
});
document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => showToast(`${button.dataset.action}已加入操作队列。`));
});
document.querySelectorAll("[data-batch]").forEach((button) => {
  button.addEventListener("click", () => setDetail(button.dataset.batch));
});
document.addEventListener("click", (event) => {
  const approveButton = event.target.closest("[data-approve]");
  if (approveButton) approveRow(approveButton);
  if (document.body.classList.contains("sidebar-open") && !event.target.closest(".sidebar") && !event.target.closest("[data-menu-toggle]")) {
    toggleSidebar(false);
  }
});
limitInput?.addEventListener("input", updateLimit);
updateLimit();
updateRows();
