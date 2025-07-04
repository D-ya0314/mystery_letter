"use strict";

/*---------- 幕開け ----------*/
function start() {
  document.querySelector(".start").classList.add("is-disable");
  document.getElementById("intro-text").classList.add("is-active");
  document.getElementById("don-sound").play();
  // 「どん」の演出が終わったらメインを表示
  setTimeout(() => {
    document.getElementById("intro-overlay").style.display = "none";
    document.querySelector(".l_question0").classList.add("is-active");
  }, 2000); // 2秒後に切り替え
}

/*---------- ミスカウント ----------*/
let mistakeCount = 0; // ← 合計カウント変数
function addMistake() {
  mistakeCount++;
  localStorage.setItem("mistakeCount", mistakeCount);
  document.getElementById("mistakeCountDisplay").textContent = mistakeCount;
}

/*--------- 🔊失恋音再生 ---------*/
let q4AnswerValue = 0;
function brakeHeart() {
  const se = document.getElementById("seCut");
  se.currentTime = 0; // 同じ音を連続再生可能に
  se.play();
  q4AnswerValue++;
  localStorage.setItem("q4AnswerValue", q4AnswerValue);
  document.getElementById("q4AnswerValueDisplay").textContent = q4AnswerValue;
}

/*-------- タップ（クリック）カウント ---------*/
let clickCount = 0;
const nextQuestionEl = document.querySelector(".js_final-question");
function handleCardClick() {
  if (
    nextQuestionEl.classList.contains("is-active") &&
    nextQuestionEl.classList.contains("is-license")
  ) {
    clickCount++;
    // タイマーをリセットして再スタート
    setTimeout(() => {
      clickCount = 0;
    }, 5000);
    document.getElementById("click").textContent = clickCount;

    if (clickCount == q4AnswerValue) {
      // 遷移
      window.location.href = "clear.html"; // ← ここを遷移先に変更
    }
  }
}

/*-------- ヒント表示 ---------*/
let titleClick = 0;
const hint = document.querySelectorAll(".js_hint");
const title = document.querySelector(".m_title");
title.addEventListener("click", () => {
  titleClick++;
  if (titleClick === 5) {
    hint.forEach((el) => {
      el.classList.toggle("is-active");
    });
  }
  // タイマーをリセットして再スタート
  setTimeout(() => {
    titleClick = 0;
  }, 3000);
});

/*---------- ハンバーガーメニュー ----------*/
const hamburger = document.querySelector(".js_hamburger");
const navigation = document.querySelector(".js_nav");
const body = document.querySelector(".js_body");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("is-active");
  navigation.classList.toggle("is-active");
  // body.classList.toggle("is-active");
  if (body.classList.contains("is-active")) {
    enableScroll();
  } else {
    disableScroll();
  }
});

// PC幅でナビゲーションをクリックしても"is-active"がつかないようにします
navigation.addEventListener("click", () => {
  if (window.innerWidth < 1080) {
    hamburger.classList.toggle("is-active");
    navigation.classList.toggle("is-active");
    if (body.classList.contains("is-active")) {
      enableScroll();
    } else {
      disableScroll();
    }
  }
});

// スマホ（ハンバーガーメニューをクリック）→PC→スマホに画面幅が変更されたとき、強制的に"is-active"を外す
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1080) {
    hamburger.classList.remove("is-active");
    navigation.classList.remove("is-active");
    body.classList.remove("is-active");
  }
});

/*---------- スライドによるヘッダの表示 ----------*/
let lastScrollY = window.scrollY;
let threshold = 500; // 500px 上から以上スクロールしたら反応
let timeout;
let isFooterVisible = false;
const footer = document.querySelector(".l_footer");
const header = document.querySelector(".js_header");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  // フッターが見えていたらスクロール判定はしない
  if (isFooterVisible) return;

  clearTimeout(timeout); // 既存のタイマーをリセット

  if (currentScrollY > lastScrollY && currentScrollY > threshold) {
    header.classList.add("is-active");
  } else {
    header.classList.remove("is-active");
  }

  lastScrollY = currentScrollY;

  // スクロールが止まったら 1 秒後にヘッダーを表示
  timeout = setTimeout(() => {
    // フッターが見えていたら表示しない
    if (isFooterVisible) return;
    header.classList.remove("is-active");
  }, 1000);
});

// フッターの可視状態を監視
const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log("フッターが見えた！ヘッダーを隠す");
        isFooterVisible = true;
        header.classList.add("is-active");
      } else {
        console.log("フッターが見えなくなった！スクロール判定を再開");
        isFooterVisible = false;
      }
    });
  },
  {
    root: null, // ビューポート（画面）基準
    threshold: 0.1, // 10% 見えたら発動
  }
);

observer.observe(footer);

let scrollY;

function disableScroll() {
  scrollY = window.scrollY;

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  body.style.paddingRight = `${scrollbarWidth}px`;
  body.style.top = `-${scrollY}px`;
  body.classList.add("is-active");
}

function enableScroll() {
  body.style.paddingRight = "";
  body.style.top = "";
  window.scrollTo(0, scrollY);
  body.classList.remove("is-active");
}
