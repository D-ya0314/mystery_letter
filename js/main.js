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

window.addEventListener("DOMContentLoaded", () => {
  // 明るくして本文表示
  document.getElementById("fadein-overlay").classList.add("is-active");
  document.querySelector(".letter").classList.toggle("is-active");
});

/*---------- ミスカウント ----------*/
let mistakeCount = 0; // ← 合計カウント変数
function addMistake() {
  mistakeCount++;
  // localStorage.setItem("mistakeCount", mistakeCount);
  document.getElementById("mistakeCountDisplay").textContent = mistakeCount;
}

/*--------- 🔊失恋音再生 ---------*/
let q4AnswerValue = 0;
function brakeHeart() {
  const bh = document.getElementById("break-heart");
  bh.currentTime = 0; // 同じ音を連続再生可能に
  bh.play();
  q4AnswerValue++;
  document.getElementById("q4AnswerValueDisplay").textContent = q4AnswerValue;
}

/*-------- タップ（クリック）カウント ---------*/
let clickCount = 0;
const qf = document.getElementById("qf");
const fOverlay = document.getElementById("fadeout-overlay");
function handleCardClick() {
  if (
    qf.classList.contains("is-active") &&
    qf.classList.contains("is-license")
  ) {
    clickCount++;
    // タイマーをリセットして再スタート
    setTimeout(() => {
      clickCount = 0;
    }, 5000);
    document.getElementById("click").textContent = clickCount;

    if (clickCount == q4AnswerValue) {
      // 遷移
      fOverlay.style.opacity = 1;
      document.getElementById("buon").play();
      setTimeout(() => {
        window.location.href = "clear.html"; // ← ここを遷移先に変更
      }, 3000);
    }
  }
}

/*-------- ヒント表示 ---------*/
let titleClick = 0;
const hints = document.querySelectorAll(".js_hint");
const title = document.querySelector(".m_title");
title.addEventListener("click", () => {
  titleClick++;
  if (titleClick === 5) {
    hints.forEach((el) => {
      el.classList.toggle("is-active");
    });
  }
  // タイマーをリセットして再スタート
  setTimeout(() => {
    titleClick = 0;
  }, 3000);
});

function hint() {
  hints.forEach((el) => {
    el.classList.toggle("is-active");
  });
}

/*-------- 回答アクション ---------*/
// q0
function q0CheckAnswer() {
  const input = document.getElementById("q0-answer").value.trim().toLowerCase();
  const result = document.getElementById("q0-result");

  if (input === "letter" || input === "レター") {
    fOverlay.style.opacity = 1;
    document.getElementById("buon").play();
    setTimeout(() => {
      location.href = "letter.html";
    }, 3000);
  } else {
    result.textContent = "違うようだ…。";
  }
}

// q1
function q1CheckAnswer() {
  const input = document.getElementById("q1-answer").value.trim().toLowerCase();
  const result = document.getElementById("q1-result");
  const q = document.getElementById("q2");
  const btn = document.getElementById("q1-btn");
  const answer = document.getElementById("q1-answer");

  if (input === "クラブ" || input === "くらぶ") {
    result.textContent = "正解だ…。次の謎に進め。";
    q.classList.add("is-active");
    btn.classList.add("is-disable");
    answer.classList.add("is-disable");
    // location.href = "next.html"; // ページ移動させたいならこれ
  } else {
    result.textContent = "違うようだ…。もう一度試せ。";
    /* ミスカウント */
    addMistake();
    /* 🔊失恋音再生 */
    brakeHeart();
  }
}

// q2
function q2CheckAnswer() {
  const input = document.getElementById("q2-answer").value.trim().toLowerCase();
  const result = document.getElementById("q2-result");
  const q = document.getElementById("q3");
  const btn = document.getElementById("q2-btn");
  const answer = document.getElementById("q2-answer");

  if (input === "jack") {
    result.textContent = "正解だ...。君もまた、“彼”と同じ札を握ったようだな…。";
    q.classList.add("is-active");
    btn.classList.add("is-disable");
    answer.classList.add("is-disable");
  } else {
    result.textContent = "答えが違うようだ…もう一度手札を見直すがいい。";
    /* ミスカウント */
    addMistake();
    /* 🔊失恋音再生 */
    brakeHeart();
  }
}

// q3
const answerChars = ["タ", "ッ", "プ"];
const droppedFlags = [false, false, false];
const magician = document.querySelector(".js_magician");

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dropHeart(ev, index) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const card = document.getElementById(data);
  const heart = document.getElementById("heart" + index);
  const result = document.getElementById("q3-result");

  if (card.id === "card-8" && !droppedFlags[index]) {
    droppedFlags[index] = true;
    heart.classList.add("break");

    /* 🔊失恋音再生 */
    brakeHeart();

    setTimeout(() => {
      const span = document.createElement("span");
      span.className = "reveal";
      span.textContent = answerChars[index];
      heart.appendChild(span);
    }, 600);

    heart.classList.add("drop-disabled");

    if (droppedFlags.every((f) => f)) {
      result.textContent =
        "答えが見えたようだね。ところで君は大貧民かな？それじゃー大富豪の“彼”にその２枚を渡さないと(笑)";
      document.getElementById("q4").classList.add("is-active");
      magician.classList.remove("drop-disabled");
    }
  } else {
    result.textContent = "そのカードでは切れないようだ…";
  }
}

let droppedCards = new Set();
function dropCard(event) {
  event.preventDefault();
  let cardId = event.dataTransfer.getData("text/plain");
  magician.classList.add("is-active");

  if (cardId === "card-K" || cardId === "card-A") {
    const q3Id = document.getElementById("q3");
    if (q3Id.classList.contains("is-active")) {
      droppedCards.add(cardId); // セットに追加（重複しない）

      // ドロップ先に表示（演出用）
      let card = document.getElementById(cardId);
      event.target.appendChild(card);

      // 両方そろったら次の問題表示
      if (droppedCards.has("card-K") && droppedCards.has("card-A")) {
        qf.classList.toggle("is-active");
        magician.classList.add("drop-disabled");
        if (qf.classList.contains("is-license")) {
          const q4result = document.getElementById("q4-result");
          q4result.textContent =
            "これでキーワードはそろった。次の指示にしたがうのだ。";
        }
      }
    }
  }
}

// q4
function q4CheckAnswer() {
  const input = Number(document.getElementById("q4-answer").value);
  const result = document.getElementById("q4-result");
  const btn = document.getElementById("q4-btn");
  const answer = document.getElementById("q4-answer");

  if (input == q4AnswerValue) {
    if (qf.classList.contains("is-active")) {
      // 表示されている
      result.textContent =
        "これでキーワードはそろった。次の指示にしたがうのだ。";
      qf.classList.toggle("is-license");
      btn.classList.add("is-disable");
      answer.classList.add("is-disable");
      answer.setAttribute("readonly", true);
    } else {
      // 非表示
      result.textContent =
        "これでキーワードはそろった。、、、次の指示がないって？何か見落としているんじゃないか？";
      qf.classList.toggle("is-license");
      btn.classList.add("is-disable");
      answer.classList.add("is-disable");
      answer.setAttribute("readonly", true);
    }
  } else {
    result.textContent =
      "答えが違うようだ…あぁ、また貧弱なガラスのハートが割れてしまった。君には聞こえなかったのかい？";
    /* ミスカウント */
    addMistake();
    /* 🔊失恋音再生 */
    brakeHeart();
  }
}

/*---------- 紙を開く ----------*/
function openLastPaper() {
  const lastmessage = document.getElementById("lastmessage");
  const btn = document.getElementById("op-btn");

  lastmessage.classList.add("is-active");
  btn.classList.add("is-disable");
  document.getElementById("open-letter").play();
}

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
    // body.classList.toggle("is-active");
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
