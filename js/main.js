// 主にメニュー画面の設定
document.addEventListener('DOMContentLoaded', () => {
  console.log("main.js loaded");
});

// =============================
// headerの変更
// =============================

const header   = document.querySelector('.header');
const navImgs  = document.querySelectorAll('.header-nav img');
const logoImg  = document.querySelector('.header-logo img');

// policyの始まりにポイントを設定するので取得する
const policy = document.querySelector('#policy');
const headerInner = document.querySelector('.header-inner');

// ① FVを取る（#top が fv セクション）
const fv = document.querySelector('#top');

// ▼ ページごとの「切り替え位置」を決める
let scrollTrigger = 700; // ← これは保険として残してOK（fvが取れない時用）

// ② policy上端を元にトリガーを更新する関数
function updateScrollTrigger() {
  if (!policy || !headerInner) return;

  // policy のページ内での位置
  const policyTop = policy.getBoundingClientRect().top + window.scrollY;

  // ヘッダーの実高さ（clamp / media query 反映後）
  const headerHeight = headerInner.offsetHeight;

  // header は top:30px なのでその分も考慮
  const headerTopOffset = 30;

  // ▼ 切り替えライン
  scrollTrigger = policyTop - headerHeight - headerTopOffset;
}

// ③ 初回に計算（画像読み込み等で高さが変わるので load が強い）
window.addEventListener('load', updateScrollTrigger);

// ④ リサイズでも更新（ここが超重要）
window.addEventListener('resize', updateScrollTrigger);

// ⑤ ついでに：スクロール時に毎回計算したくないので基本しない
// （もしFV内で高さがアニメで変わる等なら scroll内で再計算が必要だけど、通常は不要）

// LP用のセクションがあれば、そっちを優先
const lpSection = document.getElementById('lp-mizumawari');

if (lpSection) {
  // sectionの少しスクロールしたあたりで切り替えたいイメージ
  // 値は見ながら 30〜100px くらいで調整してOK
  scrollTrigger = lpSection.offsetTop + 50;
}

// スクロール量でヘッダーの状態を切り替え
window.addEventListener('scroll', () => {
  
  if (window.scrollY > scrollTrigger) {
    // ▼ スクロール後の状態
    if (header) {
      header.classList.add('header--scrolled');
    }

    navImgs.forEach((img) => {
      const file = img.getAttribute('src');
      const dotIndex = file.lastIndexOf('.');
      const base = file.substring(0, dotIndex);
      const ext  = file.substring(dotIndex);

      if (!base.endsWith('-red')) {
        img.setAttribute('src', `${base}-red${ext}`);
      }
    });

    if (logoImg) {
      logoImg.setAttribute('src', 'img/logo-red.png');
    }

  } else {
    // ▼ 元の状態（赤ヘッダー）
    if (header) {
      header.classList.remove('header--scrolled');
    }

    navImgs.forEach((img) => {
      const file = img.getAttribute('src');
      img.setAttribute('src', file.replace('-red.svg', '.svg'));
    });

    if (logoImg) {
      logoImg.setAttribute('src', 'img/logo-w.png');
    }
  }
});

// ハンバーガー＆ドロワー
const hamburger = document.querySelector('.header-hamburger');
const drawer = document.querySelector('.header-drawer');
const drawerOverlay = document.querySelector('.header-drawer__overlay');
const drawerLinks = document.querySelectorAll('.header-drawer a');

// ▼ ブレークポイント（CSSと揃える）
const mq = window.matchMedia('(max-width: 768px)');

// ▼ 強制クローズ（状態を確実に揃える）
function closeDrawer() {
  hamburger?.classList.remove('is-active');
  drawer?.classList.remove('is-active');
}

// ▼ 768pxを超えたらドロワーを強制的に閉じる
function syncDrawerWithViewport(e) {
  if (!e.matches) closeDrawer(); // PC幅になったら閉じる
}

// 初期同期（PC幅で読み込み時に残らない）
syncDrawerWithViewport(mq);
// ブレークポイントを跨いだ時だけ発火
mq.addEventListener('change', syncDrawerWithViewport);

// ハンバーガークリックで開閉（SP幅のときだけ）
if (hamburger && drawer) {
  hamburger.addEventListener('click', () => {
    // PC幅では開かせない（詰み防止）
    if (!mq.matches) return;

    hamburger.classList.toggle('is-active');
    drawer.classList.toggle('is-active');
  });
}


// ドロワー外をクリックで閉じる
document.addEventListener('click', (e) => {
  // ドロワーが開いていないなら何もしない
  if (!drawer?.classList.contains('is-active')) return;

  // panel内をクリックしていたら何もしない
  if (e.target.closest('.header-drawer__panel')) return;

  // ハンバーガーボタン自体のクリックは除外（トグルと競合しないため）
  if (e.target.closest('.header-hamburger')) return;

  // それ以外 = panel外 → 閉じる
  closeDrawer();
});

// works　実績を見るボタンの開閉
// ボタンを 1 つだけ取る
const toggleBtn = document.querySelector('#worksToggleBtn');

// 「最初は非表示にしておきたい作品」にクラスをつけておく
const extraWorks = document.querySelectorAll('.works-item--hidden');

toggleBtn.addEventListener('click', () => {
  // extraWorks に対して「表示 / 非表示」をトグル
  extraWorks.forEach(item => {
    item.classList.toggle('is-open');
  });

  // テキストのトグル
  if (toggleBtn.textContent.trim() === '実績をもっと見る') {
    toggleBtn.textContent = '閉じる';
  } else {
    toggleBtn.textContent = '実績をもっと見る';
  }
});

// FV　アニメーション
document.addEventListener('DOMContentLoaded', () => {
  console.log("main.js loaded");
  document.body.classList.add('is-loaded');
});

// =============================
//  WORKS モーダル（共通処理版）
// =============================

// 1) すべての「詳しく見る」カード／ボタン
const modalCards = document.querySelectorAll('[data-modal]');

// 2) 共通：開く処理
function openModal(targetModal) {
  if (!targetModal) return;

  targetModal.setAttribute('aria-hidden', 'false');
  targetModal.classList.add('is-active');

  // 背景スクロール禁止
  document.body.style.overflow = 'hidden';
}

// 3) 共通：閉じる処理
function closeModal(targetModal) {
  if (!targetModal) return;

  targetModal.setAttribute('aria-hidden', 'true');
  targetModal.classList.remove('is-active');

  // 背景スクロール解除
  document.body.style.overflow = '';
}

// 4) カードごとに紐付け
modalCards.forEach((card) => {
  const key = card.dataset.modal;                 // "aojiru" / "mizumawari" など
  const modal = document.getElementById('modal-' + key);

  // 対応するモーダルがなかったらスキップ
  if (!modal) {
    console.warn('対応するモーダルが見つからないよ：', key);
    return;
  }

  const modalContent = modal.querySelector('.modal-content');
  const modalCloseBtn = modal.querySelector('.modal-close');

  // カードをクリックしたら、そのモーダルだけ開く
  card.addEventListener('click', () => {
    openModal(modal);
  });

  // 閉じるボタン
  modalCloseBtn.addEventListener('click', () => {
    closeModal(modal);
  });

  // 黒背景クリックで閉じる
  modal.addEventListener('click', (e) => {
    if (!modalContent.contains(e.target)) {
      closeModal(modal);
    }
  });
});

// =====================
// CONTACT 確認モーダル
// =====================
const contactForm = document.querySelector('.contact-form');
const confirmModal = document.getElementById('confirmModal');

// モーダル内の要素たち
const confirmName    = document.getElementById('confirm-name');
const confirmCompany = document.getElementById('confirm-company');
const confirmEmail   = document.getElementById('confirm-email');
const confirmTel     = document.getElementById('confirm-tel');
const confirmMessage = document.getElementById('confirm-message');

const backToFormBtn  = document.getElementById('backToForm');
const submitFinalBtn = document.getElementById('submitFinal');

if (contactForm && confirmModal) {

  // 「内容を確認する」ボタン → モーダルを開く
  contactForm.addEventListener('submit', (e) => {
    // まずブラウザ標準の required チェック
    if (!contactForm.checkValidity()) {
      // ブラウザに任せたいので、ここでは何もしない
      return;
    }

    e.preventDefault(); // いったん送信ストップ

    // 入力値をモーダルに流し込む
    confirmName.textContent    = contactForm.name.value || '（未入力）';
    confirmCompany.textContent = contactForm.company.value || '（未入力）';
    confirmEmail.textContent   = contactForm.email.value || '（未入力）';
    confirmTel.textContent     = contactForm.tel.value || '（未入力）';
    confirmMessage.textContent = contactForm.message.value || '（未入力）';

    // モーダル表示
    confirmModal.classList.add('is-active');
  });

  // 「戻る」→ モーダルを閉じるだけ
  if (backToFormBtn) {
    backToFormBtn.addEventListener('click', () => {
      confirmModal.classList.remove('is-active');
    });
  }

  // 「送信する」→ 本物のフォーム送信
  if (submitFinalBtn) {
    submitFinalBtn.addEventListener('click', () => {
      contactForm.submit(); // ここはもう modal は触らず素直に送信
    });
  }

  // 右上の × ボタンでも閉じる
  const confirmCloseBtn = confirmModal.querySelector('.modal-close');
  if (confirmCloseBtn) {
    confirmCloseBtn.addEventListener('click', () => {
      confirmModal.classList.remove('is-active');
    });
  }
}