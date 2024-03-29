module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', {
      'changelogFile': 'CHANGELOG.md',
    }],
    ["@semantic-release/npm", {
      npmPublish: false,
    }],
    ['@semantic-release/exec', {
      prepareCmd: 'npm run build',
    }],
    ['@semantic-release/git', {
      'assets': ['package.json', 'package-lock.json', 'CHANGELOG.md', 'build/**/*.*'],
      'message': 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    }],
    ['@semantic-release/github', {}],
    ['@semantic-release/exec', {
      // required to flush CDN root folder mapping - see https://github.com/adobe/helix-admin/issues/1612
      'successCmd': 'curl -X POST "https://admin.hlx.page/code/adobe/franklin-chat-ui/main/*"'
    }],
  ],
  branches: ['main'],
};
