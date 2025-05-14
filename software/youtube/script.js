// DOM Elements
const urlForm = document.getElementById('urlForm');
const youtubeUrlInput = document.getElementById('youtubeUrl');
const loadingEl = document.getElementById('loading');
const formatSelectorEl = document.getElementById('formatSelector');
const videoThumbnailEl = document.getElementById('videoThumbnail');
const videoTitleEl = document.getElementById('videoTitle');
const formatOptionsEl = document.getElementById('formatOptions');
const downloadButtonEl = document.getElementById('downloadButton');
const historyItemsEl = document.getElementById('historyItems');
const noHistoryEl = document.getElementById('noHistory');
const clearHistoryBtn = document.getElementById('clearHistory');

// State
let videoInfo = null;
let selectedFormat = null;
let downloadHistory = [];

// Base URL for your Vercel functions
const API_BASE = 'https://www.maxfm4ik.site/api';

function init() {
  loadDownloadHistory();
  urlForm.addEventListener('submit', handleUrlSubmit);
  downloadButtonEl.addEventListener('click', handleDownload);
  clearHistoryBtn.addEventListener('click', handleClearHistory);
  downloadButtonEl.disabled = true;
}

async function handleUrlSubmit(e) {
  e.preventDefault();
  const url = youtubeUrlInput.value.trim();
  if (!url) return;

  resetFormatSelector();
  loadingEl.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/info?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Failed to fetch video info');
    const info = await res.json();
    videoInfo = info;
    displayVideoInfo(info);
    formatSelectorEl.classList.remove('hidden');
  } catch (err) {
    alert(err.message);
  } finally {
    loadingEl.classList.add('hidden');
  }
}

function resetFormatSelector() {
  videoInfo = null;
  selectedFormat = null;
  formatOptionsEl.innerHTML = '';
  downloadButtonEl.disabled = true;
  formatSelectorEl.classList.add('hidden');
}

function displayVideoInfo(info) {
  videoThumbnailEl.src = info.thumbnail;
  videoTitleEl.textContent = info.title;

  info.formats.forEach((fmt) => {
    const option = document.createElement('div');
    option.className = 'format-option';
    option.dataset.itag = fmt.itag;
    option.innerHTML = `
      <span class="format-label">${fmt.qualityLabel}</span>
      <span class="format-details">${fmt.container.toUpperCase()} • ${fmt.contentLength ? (Math.round(fmt.contentLength/1024/1024)+' MB') : '—'}</span>
    `;
    option.addEventListener('click', () => selectFormat(fmt.itag, option));
    formatOptionsEl.appendChild(option);
  });

  // auto-select first
  const firstItag = info.formats[0]?.itag;
  if (firstItag) selectFormat(firstItag, formatOptionsEl.firstChild);
}

function selectFormat(itag, element) {
  // toggle selected class
  Array.from(formatOptionsEl.children).forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');
  selectedFormat = itag;
  downloadButtonEl.disabled = false;
}

async function handleDownload() {
  if (!videoInfo || !selectedFormat) return;
  downloadButtonEl.disabled = true;
  downloadButtonEl.textContent = 'Downloading…';

  // trigger browser download
  const streamUrl = `${API_BASE}/download?url=${encodeURIComponent(youtubeUrlInput.value.trim())}&itag=${selectedFormat}`;
  const a = document.createElement('a');
  a.href = streamUrl;
  a.click();

  // record history
  const fmt = videoInfo.formats.find(f => f.itag == selectedFormat);
  downloadHistory.unshift({
    id: `${videoInfo.videoId}-${Date.now()}`,
    title: videoInfo.title,
    thumbnail: videoInfo.thumbnail,
    format: fmt.container.toUpperCase(),
    quality: fmt.qualityLabel,
    downloadedAt: new Date()
  });
  if (downloadHistory.length > 10) downloadHistory.pop();
  saveDownloadHistory();
  renderDownloadHistory();

  downloadButtonEl.disabled = false;
  downloadButtonEl.textContent = 'Download';
}

function handleClearHistory() {
  downloadHistory = [];
  saveDownloadHistory();
  renderDownloadHistory();
}

function loadDownloadHistory() {
  const saved = localStorage.getItem('downloadHistory');
  if (saved) {
    downloadHistory = JSON.parse(saved).map(item => ({
      ...item,
      downloadedAt: new Date(item.downloadedAt)
    }));
  }
  renderDownloadHistory();
}

function saveDownloadHistory() {
  localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
}

function renderDownloadHistory() {
  historyItemsEl.innerHTML = '';
  if (downloadHistory.length === 0) {
    noHistoryEl.classList.remove('hidden');
    return;
  }
  noHistoryEl.classList.add('hidden');
  downloadHistory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <img src="${item.thumbnail}" class="history-thumbnail">
      <div class="history-details">
        <div class="history-title">${item.title}</div>
        <div class="history-meta">
          <span>${item.format} • ${item.quality}</span>
          <span>${formatDate(item.downloadedAt)}</span>
        </div>
      </div>
    `;
    historyItemsEl.appendChild(div);
  });
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  if (diff < 24*3600*1000) return 'Today';
  if (diff < 7*24*3600*1000) return `${Math.floor(diff/86400000)} days ago`;
  return date.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
}

// kick things off
init();
