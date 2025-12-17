/**
// Config object for:
// repo, GH token, Slack bot token, channel IDs, lookback days, and staff
// Triggered every 2 weeks by the Contributor Activity GitHub Action workflow (community-slack-activity.yml)
 */
const config = {
  github: {
    owner: 'chaynHQ',
    repo: 'bloom-frontend',
    token: process.env.GITHUB_TOKEN,
  },

  slack: {
    token: process.env.SLACK_BOT_TOKEN,
    channelId: process.env.SLACK_CHANNEL_ID,
  },

  report: {
    lookbackDays: 14,
    staffUsernames: [
      'annarhughes',
      'eleanorreem',
      'github-actions[bot]',
      'dependabot[bot]',
      'chaynteam',
    ],
  },
};

/**
 * Main function to gather GitHub pull request activity and post a summary to Slack.
 * Params: GITHUB_TOKEN, SLACK_BOT_TOKEN, SLACK_CHANNEL_ID
 */
async function main() {
  const { Octokit } = await import('@octokit/rest');
  const { WebClient } = await import('@slack/web-api');

  const octokit = new Octokit({ auth: config.github.token });
  const slack = new WebClient(config.slack.token);

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - config.report.lookbackDays * 24 * 60 * 60 * 1000);

  const prs = await octokit.pulls.list({
    owner: config.github.owner,
    repo: config.github.repo,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: 100,
  });

  const contributorPrs = {};
  const assigneePrs = {};
  let totalMergedPRs = 0;

  // Get PR data
  for (const pr of prs.data) {
    if (pr.merged_at && new Date(pr.merged_at) >= startDate && new Date(pr.merged_at) <= endDate) {
      // excludes PRs authored by staff
      if (pr.user && !config.report.staffUsernames.includes(pr.user.login)) {
        const assignee = pr.assignee ? pr.assignee.login : 'Unassigned';

        const { data: reviews } = await octokit.pulls.listReviews({
          owner: config.github.owner,
          repo: config.github.repo,
          pull_number: pr.number,
        });

        const reviewers = [...new Set(reviews.map((r) => r.user.login))];

        if (!contributorPrs[pr.user.login]) {
          contributorPrs[pr.user.login] = [];
        }

        contributorPrs[pr.user.login].push({
          count: 1,
          assignee,
          reviewers,
          title: pr.title,
          number: pr.number,
          url: pr.html_url,
        });

        if (!assigneePrs[assignee]) {
          assigneePrs[assignee] = 0;
        }
        assigneePrs[assignee] += 1;

        totalMergedPRs++;
      }
    }
  }

  // Format the Slack message
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*BLOOM FRONTEND: Contributor Merged PRs (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})*`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Total:* ${totalMergedPRs}`,
      },
    },
  ];

  for (const [contributor, prs] of Object.entries(contributorPrs)) {
    const totalPRs = prs.length;
    const assignees = prs.map((pr) => pr.assignee);
    const uniqueAssignees = [...new Set(assignees)].join(', ');

    const allReviewers = prs.flatMap((pr) => pr.reviewers || []);
    const uniqueReviewers = [...new Set(allReviewers)].join(', ') || 'None';

    const prLinks = prs.map((pr) => `• <${pr.url}|#${pr.number} ${pr.title}>`).join('\n');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${contributor}* (${totalPRs} PR${totalPRs > 1 ? 's' : ''})\n${prLinks}\n*Assignee${uniqueAssignees.includes(',') ? 's' : ''}*: ${uniqueAssignees} *Reviewer${uniqueReviewers.includes(',') ? 's' : ''}*: ${uniqueReviewers}`,
      },
    });
  }

  await slack.chat.postMessage({
    channel: config.slack.channelId,
    blocks,
    unfurl_links: false,
    unfurl_media: false,
  });
}

// Execute the script
main()
  .then(() => {
    // Success - exit with code 0
    process.exit(0);
  })
  .catch((error) => {
    // Log the error for GitHub Actions
    console.error('Script failed:', error);
    // Exit with code 1 to indicate failure
    process.exit(1);
  });
