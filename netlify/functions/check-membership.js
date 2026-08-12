// netlify/functions/check-membership.js

exports.handler = async (event, context) => {
  // ① 静的サイトから送られてきた LINEのユーザーIDを取得
  const { userId } = JSON.parse(event.body || "{}");

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "ユーザーIDがありません" }),
    };
  }

  // 誰がログインしたかログを残します
  console.log("Access User ID is: " + userId);

  /* ★ここから追加：身内・家族用のホワイトリスト機能★ */
  const ALLOWED_USERS = [
    "U0602079f1acff8298d2bc73fa2e0b6d5", // あなたのLINEユーザーID
    "Uyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy", // 家族のLINEユーザーID
  ];

  if (ALLOWED_USERS.includes(userId)) {
    console.log(`身内ユーザーのため無条件で通過させます: ${userId}`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isMember: true }), // LINE APIに聞く前に強制合格にする
    };
  }

  // ② Netlifyに隠した秘密鍵を読み込み
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  try {
    // ③ LINE公式のメンバーシップ確認API（2026年最新仕様）を呼び出す
    // ※今回は例として、LINEのメンバーシップAPIエンドポイントを設定します
    // 安全にURLの文字列を足し算で繋ぐ書き方に修正します
    const response = await fetch("https://line.me/v2/bot/membership/user/" + userId, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    if (!response.ok) {
      // LINE側からのエラー（未加入、またはエラー）
      return {
        statusCode: 200,
        body: JSON.stringify({ isMember: false }),
      };
    }

    const data = await response.json();

    // LINEの返却データ（data.membershipStatus など）から加入中か判定
    // ユーザーが有効なメンバーシッププランを持っている場合はtrueを返す
    const isMember =
      data.membershipStatus === "SUB_INITIAL" ||
      data.membershipStatus === "SUB_RENEW" ||
      data.membershipStatus === "ACTIVE";
    // ※プランの契約ステータスの文字列は、実際のLINE公式リファレンスに合わせて調整してください

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isMember: isMember }),
    };
  } catch (error) {
    console.error("LINE API連携エラー:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ isMember: false, error: error.message }),
    };
  }
};
