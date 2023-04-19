export function convertSlackToHtml(slackText: string) {
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
