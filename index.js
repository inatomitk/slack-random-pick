require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const userIds = process.env.SLACK_USER_ID_LIST.split(',');

exports.main = async (event, context, callback) => {
  console.info(event);
  const reqBody = JSON.parse(event['body']);
  const reqChallenge = reqBody.challenge;

  if (!verifyRequest(reqBody)) {
    return callback('authorization error.')
  }

  if (reqBody.type === 'url_verification') {
    return callback(
      null,
      {
        statusCode: 200,
        body: JSON.stringify({
          challenge: reqChallenge
        })
      }
    )
  }

  if (!reqBody.event.files || reqBody.event.files[0].filetype !== 'email') {
    return callback(null, 200)
  }

  const targetUserIds = sampleUserIds(2);
  await replyConversation(reqBody.event.ts, targetUserIds.join(' '));

  return callback(
    null,
    {
      statusCode: 200,
      body: JSON.stringify({ message: 'ok' })
    }
  );
};

const verifyRequest = (params) => {
  if (params.api_app_id !== process.env.SLACK_APP_ID){ return false; }
  return true;
}

const replyConversation = async (ts, message) => {
  const web = new WebClient(process.env.SLACK_TOKEN);
  return await web.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID,
    'thread_ts': ts,
    text: message
  });
};

const sampleUserIds = (sampleNum) => {
  var array = userIds.slice();
  var newArray = [];

  while(newArray.length < sampleNum && array.length > 0)
  {
    // 配列からランダムな要素を選ぶ
    const rand = Math.floor(Math.random() * array.length);
    // 選んだ要素を別の配列に登録する
    newArray.push(array[rand]);
    // もとの配列からは削除する
    array.splice(rand, 1);
  }
  return newArray;
}
