"use strict";
/*---------- あなたのLIFF IDを入力 ----------*/
const MY_LIFF_ID = "2011066044-dXBGC5KM";

/*---------- ページ読み込み時のメイン処理 ----------*/
async function initializeLiff() {
  try {
    // 1. LIFFの初期化
    await liff.init({ liffId: MY_LIFF_ID });

    // 2. LINEにログインしているかチェック（していなければログイン画面へ飛ばす）
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    // 3. ログイン中のユーザーデータ取得
    // 固有のLINE IDを取得
    const profile = await liff.getProfile();
    const userId = profile.userId;
    // LINE公式アカウントの友だち追加状況を取得
    const friendship = await liff.getFriendship();
    const isFriend = friendship.friendFlag;

    // 4. 関数を呼び出して判定する
    // メンバーシップ判定を行う
    // const isMember = await checkMembershipStatus(userId);

    // 5. ローディング画面（確認中...）を非表示にする
    document.getElementById("loading").classList.add("js_hidden");

    // 6. 判定結果によって画面の表示をコントロールする
    // メンバーシップ
    // display_mem(isMember);
    // 公式追加
    display_fri(isFriend);
  } catch (error) {
    console.error("LIFF初期化または判定の失敗:", error);
    // エラーの生メッセージを画面に出して原因を特定する
    document.getElementById("loading").innerText =
      "エラー詳細: " + error.message;
  }
}

/*---------- LINEメンバーシップ判定 ----------*/
async function checkMembershipStatus(userId) {
  testSendToGAS();
  try {
    // Netlifyに作成した隠し部屋（Functions）に向けて、ユーザーIDを安全に送信
    const response = await fetch("/.netlify/functions/check-membership", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.isMember; // 隠し部屋から返ってきた true または false をそのまま返す
  } catch (e) {
    console.error("メンバーシップ確認通信に失敗:", e);
    return false;
  }
}

/*---------- 判定結果によって画面の表示をコントロール ----------*/
// メンバーシップ
function display_mem(isMember) {
  if (isMember) {
    // 会員なら「有料の謎」を表示する
    document.getElementById("premium-content").classList.remove("js_hidden");
  } else {
    // 非会員なら「拒否画面」を表示する
    document.getElementById("error-content").classList.remove("js_hidden");
  }
}

// 公式追加
function display_fri(isFriend) {
  if (isFriend) {
    // 友だち追加済みなら「謎」を表示
    document.getElementById("premium-content").classList.remove("js_hidden");
    // Googleスプレッドシートに記載
    recordJoin(userId, 'DWM_test');
  } else {
    // 友だち追加していなければ拒否画面
    document.getElementById("error-content").classList.remove("js_hidden");

    // 「友だち追加する」ボタン
    document.getElementById("add-line-btn").addEventListener("click", () => {
      liff.openWindow({
        url: "https://lin.ee/tseJ7Wa",
        external: false,
      });
    });
  }
}

/*---------- GAS ---------*/
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxTMJ8Pp5A_uCChoXaZSyRKt4vjkKmRz2oIrBkqfVxYxJYmzt9c_RWUGO-ibKHX20C9RQ/exec';

async function recordJoin(userId, puzzleId) {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        userId: userId,
        puzzleId: puzzleId,
        action: 'join'
      })
    });

    const data = await response.json();

    console.log('参加記録:', data);

  } catch (error) {
    console.error('参加記録エラー:', error);
  }
}

/*---------- ページが読み込まれたら自動で実行させる ----------*/
window.onload = initializeLiff;

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
  setTimeout(() => {
    document.getElementById("fadein-overlay").remove();
  }, 2000);
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
  // document.getElementById("q4AnswerValueDisplay").textContent = q4AnswerValue;
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
        "うまく場を流せたみたいだな。でもその矢でハートを射抜けず、砕けたみたいだけど...さらに勝負に負けて大貧民!?wwそれじゃー大富豪の“彼”にその２枚を渡さないと(笑)";
      document.getElementById("q4").classList.add("is-active");
      magician.classList.remove("drop-disabled");
      const hbtn = document.getElementById("q3-btn_h");
      const q3h = document.querySelectorAll(".q_hint");
      hbtn.classList.add("is-active");
      q3h.forEach((el) => {
        el.classList.remove("is-active");
      });
    }
  } else {
    result.textContent = "そのカードでは流せないようだ…";
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
          const hbtn = document.getElementById("q5-btn_h");
          const q5h = document.querySelectorAll(".q_hint");
          hbtn.classList.remove("is-active");
          q5h.forEach((el) => {
            el.classList.remove("is-active");
          });
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
  const hbtn = document.getElementById("q5-btn_h");
  const h4btn = document.getElementById("q4-btn_h");
  const q4h = document.querySelectorAll(".q_hint");

  if (input == q4AnswerValue) {
    if (qf.classList.contains("is-active")) {
      // 表示されている
      result.textContent =
        "これでキーワードはそろった。次の指示にしたがうのだ。";
      qf.classList.toggle("is-license");
      btn.classList.add("is-disable");
      answer.classList.add("is-disable");
      answer.setAttribute("readonly", true);
      h4btn.classList.remove("is-active");
      q4h.forEach((el) => {
        el.classList.remove("is-active");
      });
    } else {
      // 非表示
      result.textContent =
        "これでキーワードはそろった。、、、次の指示がないって？何か見落としているんじゃないか？";
      qf.classList.toggle("is-license");
      btn.classList.add("is-disable");
      answer.classList.add("is-disable");
      answer.setAttribute("readonly", true);
      hbtn.classList.add("is-active");
      h4btn.classList.add("is-active");
      q4h.forEach((el) => {
        el.classList.remove("is-active");
      });
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

// q_hint
let q3HintClick = 0;
let q4HintClick = 0;
let q5HintClick = 0;
function openhint(n) {
  if (n === "q3") {
    q3HintClick++;
    const hint1 = document.getElementById("q3_hint_1");
    const hint2 = document.getElementById("q3_hint_2");
    const hint3 = document.getElementById("q3_hint_3");
    const hint4 = document.getElementById("q3_hint_4");
    if (q3HintClick == 1) {
      hint1.classList.add("is-active");
    } else if (q3HintClick == 2) {
      hint2.classList.add("is-active");
    } else if (q3HintClick == 3) {
      hint3.classList.add("is-active");
    } else if (q3HintClick == 4) {
      hint4.classList.add("is-active");
    } else if (q3HintClick == 5) {
      hint1.classList.remove("is-active");
      hint2.classList.remove("is-active");
      hint3.classList.remove("is-active");
      hint4.classList.remove("is-active");
      q3HintClick = 0;
    }
  } else if (n === "q4") {
    q4HintClick++;
    const hint1 = document.getElementById("q4_hint_1");
    const hint2 = document.getElementById("q4_hint_2");
    const hint3 = document.getElementById("q4_hint_3");
    const hint4 = document.getElementById("q4_hint_4");
    if (q4HintClick == 1) {
      hint1.classList.add("is-active");
    } else if (q4HintClick == 2) {
      hint2.classList.add("is-active");
    } else if (q4HintClick == 3) {
      hint3.classList.add("is-active");
    } else if (q4HintClick == 4) {
      hint4.classList.add("is-active");
    } else if (q4HintClick == 5) {
      hint1.classList.remove("is-active");
      hint2.classList.remove("is-active");
      hint3.classList.remove("is-active");
      hint4.classList.remove("is-active");
      q4HintClick = 0;
    }
  } else if (n === "q5") {
    q5HintClick++;
    const hint1 = document.getElementById("q5_hint_1");
    const hint2 = document.getElementById("q5_hint_2");
    const hint3 = document.getElementById("q5_hint_3");
    const hint4 = document.getElementById("q5_hint_4");
    if (q5HintClick == 1) {
      hint1.classList.add("is-active");
    } else if (q5HintClick == 2) {
      hint2.classList.add("is-active");
    } else if (q5HintClick == 3) {
      hint3.classList.add("is-active");
    } else if (q5HintClick == 4) {
      hint4.classList.add("is-active");
    } else if (q5HintClick == 5) {
      hint1.classList.remove("is-active");
      hint2.classList.remove("is-active");
      hint3.classList.remove("is-active");
      hint4.classList.remove("is-active");
      q5HintClick = 0;
    }
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
  },
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
