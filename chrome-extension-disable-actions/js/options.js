/**
 * Options Page Script
 * 設定ページの動作を制御
 */

(function() {
  'use strict';

  // DOM要素
  const elements = {
    // グローバル設定
    globalEnabled: document.getElementById('globalEnabled'),

    // 無効化設定
    disableContextMenu: document.getElementById('disableContextMenu'),
    disableTextSelection: document.getElementById('disableTextSelection'),
    disableCopy: document.getElementById('disableCopy'),
    disablePaste: document.getElementById('disablePaste'),
    disablePrint: document.getElementById('disablePrint'),
    disableDragDrop: document.getElementById('disableDragDrop'),
    disableFormSubmit: document.getElementById('disableFormSubmit'),
    disableKeyboardShortcuts: document.getElementById('disableKeyboardShortcuts'),

    // ショートカット
    shortcutsList: document.getElementById('shortcutsList'),
    addShortcutBtn: document.getElementById('addShortcutBtn'),

    // ホワイトリスト
    whitelistDomain: document.getElementById('whitelistDomain'),
    addWhitelistBtn: document.getElementById('addWhitelistBtn'),
    whitelistList: document.getElementById('whitelistList'),

    // アクション
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    statusMessage: document.getElementById('statusMessage')
  };

  // 現在の設定
  let currentSettings = {
    globalEnabled: false,
    disableContextMenu: false,
    disableTextSelection: false,
    disableCopy: false,
    disablePaste: false,
    disablePrint: false,
    disableDragDrop: false,
    disableFormSubmit: false,
    disableKeyboardShortcuts: false,
    blockedShortcuts: [],
    whitelist: {}
  };

  /**
   * 設定を読み込む
   */
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(null);
      currentSettings = { ...currentSettings, ...settings };
      console.log('[Options] 設定を読み込みました:', currentSettings);
      updateUI();
    } catch (error) {
      console.error('[Options] 設定の読み込みに失敗:', error);
      showStatus('設定の読み込みに失敗しました', 'error');
    }
  }

  /**
   * UIを更新
   */
  function updateUI() {
    // チェックボックスの状態を設定
    elements.globalEnabled.checked = currentSettings.globalEnabled || false;
    elements.disableContextMenu.checked = currentSettings.disableContextMenu || false;
    elements.disableTextSelection.checked = currentSettings.disableTextSelection || false;
    elements.disableCopy.checked = currentSettings.disableCopy || false;
    elements.disablePaste.checked = currentSettings.disablePaste || false;
    elements.disablePrint.checked = currentSettings.disablePrint || false;
    elements.disableDragDrop.checked = currentSettings.disableDragDrop || false;
    elements.disableFormSubmit.checked = currentSettings.disableFormSubmit || false;
    elements.disableKeyboardShortcuts.checked = currentSettings.disableKeyboardShortcuts || false;

    // ショートカットリストを更新
    updateShortcutsList();

    // ホワイトリストを更新
    updateWhitelistUI();
  }

  /**
   * ショートカットリストを更新
   */
  function updateShortcutsList() {
    elements.shortcutsList.innerHTML = '';

    if (!currentSettings.blockedShortcuts || currentSettings.blockedShortcuts.length === 0) {
      elements.shortcutsList.innerHTML = '<p class="help-text">登録されたショートカットはありません</p>';
      return;
    }

    currentSettings.blockedShortcuts.forEach((shortcut, index) => {
      const shortcutDiv = document.createElement('div');
      shortcutDiv.className = 'shortcut-item';

      const shortcutText = formatShortcut(shortcut);
      shortcutDiv.innerHTML = `
        <span class="shortcut-display">${shortcutText}</span>
        <button class="btn btn-small btn-danger" data-index="${index}">削除</button>
      `;

      // 削除ボタンのイベントリスナー
      shortcutDiv.querySelector('button').addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        removeShortcut(idx);
      });

      elements.shortcutsList.appendChild(shortcutDiv);
    });
  }

  /**
   * ショートカットを整形して表示
   */
  function formatShortcut(shortcut) {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }

  /**
   * ショートカットを削除
   */
  function removeShortcut(index) {
    currentSettings.blockedShortcuts.splice(index, 1);
    updateShortcutsList();
    showStatus('ショートカットを削除しました（保存してください）', 'info');
  }

  /**
   * ショートカットを追加
   */
  function addShortcut() {
    const key = prompt('キーを入力してください（例: s, f, a）:');
    if (!key) return;

    const ctrl = confirm('Ctrlキーを含めますか？');
    const shift = confirm('Shiftキーを含めますか？');
    const alt = confirm('Altキーを含めますか？');

    const newShortcut = {
      key: key.toLowerCase(),
      ctrl: ctrl,
      shift: shift,
      alt: alt
    };

    if (!currentSettings.blockedShortcuts) {
      currentSettings.blockedShortcuts = [];
    }

    currentSettings.blockedShortcuts.push(newShortcut);
    updateShortcutsList();
    showStatus('ショートカットを追加しました（保存してください）', 'info');
  }

  /**
   * ホワイトリストUIを更新
   */
  function updateWhitelistUI() {
    elements.whitelistList.innerHTML = '';

    const domains = Object.keys(currentSettings.whitelist || {});
    if (domains.length === 0) {
      elements.whitelistList.innerHTML = '<p class="help-text">登録されたドメインはありません</p>';
      return;
    }

    domains.forEach(domain => {
      if (currentSettings.whitelist[domain] === true) {
        const domainDiv = document.createElement('div');
        domainDiv.className = 'whitelist-item';
        domainDiv.innerHTML = `
          <span class="domain-name">${domain}</span>
          <button class="btn btn-small btn-danger" data-domain="${domain}">削除</button>
        `;

        // 削除ボタンのイベントリスナー
        domainDiv.querySelector('button').addEventListener('click', (e) => {
          const dom = e.target.getAttribute('data-domain');
          removeDomain(dom);
        });

        elements.whitelistList.appendChild(domainDiv);
      }
    });
  }

  /**
   * ドメインを追加
   */
  function addDomain() {
    const domain = elements.whitelistDomain.value.trim().toLowerCase();

    if (!domain) {
      showStatus('ドメインを入力してください', 'error');
      return;
    }

    // 簡易的なドメイン検証
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      showStatus('有効なドメインを入力してください（例: example.com）', 'error');
      return;
    }

    if (!currentSettings.whitelist) {
      currentSettings.whitelist = {};
    }

    currentSettings.whitelist[domain] = true;
    elements.whitelistDomain.value = '';
    updateWhitelistUI();
    showStatus(`${domain} をホワイトリストに追加しました（保存してください）`, 'info');
  }

  /**
   * ドメインを削除
   */
  function removeDomain(domain) {
    delete currentSettings.whitelist[domain];
    updateWhitelistUI();
    showStatus(`${domain} をホワイトリストから削除しました（保存してください）`, 'info');
  }

  /**
   * 設定を保存
   */
  async function saveSettings() {
    // UIから現在の値を取得
    currentSettings.globalEnabled = elements.globalEnabled.checked;
    currentSettings.disableContextMenu = elements.disableContextMenu.checked;
    currentSettings.disableTextSelection = elements.disableTextSelection.checked;
    currentSettings.disableCopy = elements.disableCopy.checked;
    currentSettings.disablePaste = elements.disablePaste.checked;
    currentSettings.disablePrint = elements.disablePrint.checked;
    currentSettings.disableDragDrop = elements.disableDragDrop.checked;
    currentSettings.disableFormSubmit = elements.disableFormSubmit.checked;
    currentSettings.disableKeyboardShortcuts = elements.disableKeyboardShortcuts.checked;

    try {
      await chrome.storage.sync.set(currentSettings);
      console.log('[Options] 設定を保存しました:', currentSettings);
      showStatus('✅ 設定を保存しました！開いているタブをリロードしてください。', 'success');
    } catch (error) {
      console.error('[Options] 設定の保存に失敗:', error);
      showStatus('❌ 設定の保存に失敗しました', 'error');
    }
  }

  /**
   * 設定をリセット
   */
  async function resetSettings() {
    if (!confirm('本当にすべての設定をデフォルトに戻しますか？')) {
      return;
    }

    const defaultSettings = {
      globalEnabled: false,
      disableContextMenu: false,
      disableTextSelection: false,
      disableCopy: false,
      disablePaste: false,
      disablePrint: false,
      disableDragDrop: false,
      disableFormSubmit: false,
      disableKeyboardShortcuts: false,
      blockedShortcuts: [
        { key: 's', ctrl: true, shift: false, alt: false },
        { key: 'f', ctrl: true, shift: false, alt: false }
      ],
      whitelist: {}
    };

    try {
      await chrome.storage.sync.set(defaultSettings);
      currentSettings = defaultSettings;
      updateUI();
      showStatus('✅ 設定をデフォルトに戻しました', 'success');
    } catch (error) {
      console.error('[Options] リセットに失敗:', error);
      showStatus('❌ リセットに失敗しました', 'error');
    }
  }

  /**
   * ステータスメッセージを表示
   */
  function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message status-${type}`;
    elements.statusMessage.style.display = 'block';

    // 3秒後に非表示
    setTimeout(() => {
      elements.statusMessage.style.display = 'none';
    }, 3000);
  }

  /**
   * イベントリスナーを登録
   */
  function registerEventListeners() {
    // 保存ボタン
    elements.saveBtn.addEventListener('click', saveSettings);

    // リセットボタン
    elements.resetBtn.addEventListener('click', resetSettings);

    // ショートカット追加ボタン
    elements.addShortcutBtn.addEventListener('click', addShortcut);

    // ホワイトリスト追加ボタン
    elements.addWhitelistBtn.addEventListener('click', addDomain);

    // Enterキーでドメイン追加
    elements.whitelistDomain.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addDomain();
      }
    });
  }

  /**
   * 初期化
   */
  async function init() {
    console.log('[Options] オプションページを初期化します');
    await loadSettings();
    registerEventListeners();
  }

  // DOMContentLoaded後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
