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

// スクロール量でヘッダーの状態を切り替え（スクロール処理を関数に切り出す）
function updateHeaderState() {
  if (window.scrollY > scrollTrigger) {
    // ▼ スクロール後の状態
    header?.classList.add('header--scrolled');

    navImgs.forEach((img) => {
      const file = img.getAttribute('src');
      const dotIndex = file.lastIndexOf('.');
      const base = file.substring(0, dotIndex);
      const ext  = file.substring(dotIndex);

      if (!base.endsWith('-red')) {
        img.setAttribute('src', `${base}-red${ext}`);
      }
    });

    logoImg?.setAttribute('src', 'img/logo-red.png');

  } else {
    // ▼ 元の状態
    header?.classList.remove('header--scrolled');

    navImgs.forEach((img) => {
      const file = img.getAttribute('src');
      img.setAttribute('src', file.replace('-red.svg', '.svg'));
    });

    logoImg?.setAttribute('src', 'img/logo-w.png');
  }
}

// scroll ではその関数を呼ぶだけにする
window.addEventListener('scroll', updateHeaderState);

// scrollTrigger が確定したあとに呼ぶ
window.addEventListener('load', () => {
  updateScrollTrigger();   // 既存
  updateHeaderState();     // ← これを追加
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

// =============================
// works　実績を見るボタンの開閉
// =============================

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
//  works モーダル（共通処理版）
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
// CONTACT 確認モーダル（worksと同じ開閉に統一）
// =====================
const contactForm   = document.querySelector('.contact-form');
const confirmModal  = document.getElementById('confirmModal');

const confirmName    = document.getElementById('confirm-name');
const confirmCompany = document.getElementById('confirm-company');
const confirmEmail   = document.getElementById('confirm-email');
const confirmTel     = document.getElementById('confirm-tel');
const confirmMessage = document.getElementById('confirm-message');

const backToFormBtn  = document.getElementById('backToForm');
const submitFinalBtn = document.getElementById('submitFinal');

if (contactForm && confirmModal) {
  const modalContent  = confirmModal.querySelector('.modal-content');
  const modalCloseBtn = confirmModal.querySelector('.modal-close');

  // 「内容を確認する」→ モーダルを開く
  contactForm.addEventListener('submit', (e) => {
    // requiredチェック
    if (!contactForm.checkValidity()) return;

    e.preventDefault(); // 送信ストップ（確認モーダル出すため）

    // 入力値をモーダルに流し込む
    confirmName.textContent    = contactForm.name.value || '（未入力）';
    confirmCompany.textContent = contactForm.company.value || '（未入力）';
    confirmEmail.textContent   = contactForm.email.value || '（未入力）';
    confirmTel.textContent     = contactForm.tel.value || '（未入力）';
    confirmMessage.textContent = contactForm.message.value || '（未入力）';

    // worksと同じ開き方
    openModal(confirmModal);
  });

  // 「戻る」→ 閉じる（worksと同じ）
  backToFormBtn?.addEventListener('click', () => {
    closeModal(confirmModal);
  });

  // 「送信する」→ fetchに差し替えた
  submitFinalBtn?.addEventListener('click', async () => {
  const endpoint = contactForm.dataset.endpoint;
  if (!endpoint) {
    console.warn('data-endpoint が見つからないよ');
    return;
  }

  // 二重送信防止（押せないようにする）
  submitFinalBtn.disabled = true;
  submitFinalBtn.textContent = '送信中…';

  try {
    const formData = new FormData(contactForm);

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.error('送信失敗:', res.status, res.statusText);
      // ここは今はアラートでOK（後でデザインしても良い）
      alert('送信に失敗しました。時間をおいて再度お試しください。');
      return;
    }

    // ✅ 成功：confirm閉じる → thanks開く
    closeModal(confirmModal);
    openModal(thanksModal);

    // フォーム内容をリセット（任意）
    contactForm.reset();

  } catch (err) {
    console.error('送信エラー:', err);
    alert('送信中にエラーが発生しました。通信状況をご確認ください。');
  } finally {
    submitFinalBtn.disabled = false;
    submitFinalBtn.textContent = '送信する';
  }
  });

  // ×で閉じる（worksと同じ）
  modalCloseBtn?.addEventListener('click', () => {
    closeModal(confirmModal);
  });

  // 背景クリックで閉じる（worksと同じ）
  confirmModal.addEventListener('click', (e) => {
    if (modalContent && !modalContent.contains(e.target)) {
      closeModal(confirmModal);
    }
  });
}

// =====================
// CONTACT THANKYOU モーダル
// =====================
const thanksModal   = document.getElementById('thanksModal');
const backToTopBtn  = document.getElementById('backToTop');

if (thanksModal) {
  const modalContent  = thanksModal.querySelector('.modal-content');
  const modalCloseBtn = thanksModal.querySelector('.modal-close');

  // ×で閉じる（worksと同じ）
  modalCloseBtn?.addEventListener('click', () => {
    closeModal(thanksModal);
  });

  // 背景クリックで閉じる（worksと同じ）
  thanksModal.addEventListener('click', (e) => {
    if (modalContent && !modalContent.contains(e.target)) {
      closeModal(thanksModal);
    }
  });

  // TOPへ戻る
  backToTopBtn?.addEventListener('click', () => {
    closeModal(thanksModal);

    // ここは好み：#top があるならアンカーへ、なければ先頭へ
    const topAnchor = document.getElementById('top');
    if (topAnchor) {
      topAnchor.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}



// dontact　確認
document.getElementById('debugOpenThanks')?.addEventListener('click', () => {
  document.getElementById('thanksModal').classList.add('is-active');
});