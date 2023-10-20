const EMOJIS: { [key: string]: string } = {
  ':smile:': '😄',
  ':laughing:': '😆',
  ':wink:': '😉',
  ':heart:': '❤️',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎',
  ':confused:': '😕',
  ':sob:': '😭',
  ':sunglasses:': '😎',
  ':thinking_face:': '🤔',
  ':sweat_smile:': '😅',
  ':cry:': '😢',
  ':astonished:': '😲',
  ':joy:': '😂',
  ':rolling_on_the_floor_laughing:': '🤣',
  ':smirk:': '😏',
  ':neutral_face:': '😐',
  ':expressionless:': '😑',
  ':no_mouth:': '😶',
  ':grin:': '😁',
  ':clap:': '👏',
  ':wave:': '👋',
  ':tada:': '🎉',
  ':fire:': '🔥',
  ':100:': '💯',
  ':raised_hands:': '🙌',
  ':pray:': '🙏',
  ':muscle:': '💪',
  ':sparkles:': '✨',
  ':ok_hand:': '👌',
  ':+1:': '👍',
  ':-1:': '👎',
  ':facepalm:': '🤦',
  ':shrug:': '🤷',
  ':eyes:': '👀',
  ':tongue:': '😛',
  ':see_no_evil:': '🙈',
  ':hear_no_evil:': '🙉',
  ':speak_no_evil:': '🙊',
  ':mask:': '😷',
  ':alien:': '👽',
  ':ghost:': '👻',
  ':star:': '⭐',
  ':zap:': '⚡',
  ':umbrella:': '☔',
  ':snowflake:': '❄️',
  ':checkered_flag:': '🏁',
  ':coffee:': '☕',
  ':birthday:': '🎂',
  ':scream:': '😱',
  ':rage:': '😡',
  ':v:': '✌️',
  ':warning:': '⚠️',
  ':white_check_mark:': '✅',
  ':heavy_exclamation_mark:': '❗',
  ':question:': '❓',
  ':slightly_smiling_face:': '🙂',
};

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';
console.log(`App version: ${APP_VERSION}`);

export function getAppVersion() {
  return APP_VERSION;
}

export const REVERSED_EMOJIS: { [key: string]: string } = Object.entries(EMOJIS).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as { [key: string]: string }
);

export function convertSlackToHtml(slackText: string, teamId: string) {
  slackText = convertSlackLinksToHTML(slackText);
  slackText = convertHereMention(slackText);
  slackText = convertSlackUserMentionsToDeepLinks(slackText, teamId);
  slackText = convertAllEmojiToUnicode(slackText);
  slackText = slackText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  slackText = slackText.replace(/_(.*?)_/g, '<em>$1</em>');
  slackText = slackText.replace(/~(.*?)~/g, '<del>$1</del>');
  slackText = slackText.replace(/\n/g, '<br>');
  return slackText;
}

export function convertSlackTimestampToUTC(slackTimestamp: string) {
  const seconds = parseInt(slackTimestamp.split('.')[0]);
  const milliseconds = parseInt(slackTimestamp.split('.')[1]);
  const date = new Date(seconds * 1000 + milliseconds);
  return date.toUTCString();
}

function convertHereMention(message: string): string {
  return message.replaceAll('<!here>', '<b>@here</b>');
}

function convertSlackUserMentionsToDeepLinks(message: string, teamId: string): string {
  const slackUserMentionRegex = /<@(\w+)\|([^>]+)>/g;
  return message.replace(slackUserMentionRegex, (match, userId, userName) => {
    return `<b>@${userName}</b>`;
  });
}

function convertSlackLinksToHTML(text: string): string {
  const regex = /<(?![@#!])([^|>]+)(?:\|([^>]+))?>/g;
  return text.replace(regex, (_, url, linkText) => {
    if (!linkText) {
      linkText = url;
    }
    return `<a href="${url}">${linkText}</a>`;
  });
}

export function convertAllEmojiToUnicode(slackText: string) {
  for (const emoji in EMOJIS) {
    slackText = slackText.replace(emoji, EMOJIS[emoji]);
  }
  return slackText;
}

export function convertAllUnicodeToEmoji(text: string): string {
  let newText = text;
  for (const [emoji, code] of Object.entries(REVERSED_EMOJIS)) {
    newText = newText.split(emoji).join(code);
  }
  return newText;
}
