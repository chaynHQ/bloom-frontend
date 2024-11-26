/**
 * Main function to gather GitHub pull request activity and post a summary to Slack.
 * Uses GitHub's API to fetch pull request data and Slack's API to send messages.
 * Triggered every 2 weeks by the Contributor Activity GitHub Action workflow (community-slack-repo-activity.yml)
 * Params: GITHUB_TOKEN, SLACK_BOT_TOKEN, SLACK_CHANNEL_ID
 */
async function main() {
  // Import Octokit (for GitHub API interactions) and WebClient (for Slack API interactions)
  const { Octokit } = await import('@octokit/rest');
  const { WebClient } = await import('@slack/web-api');

  // Initialize Octokit with a GitHub personal access token
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  // Initialize Slack WebClient with a Slack bot token
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

  /**
   * Gathers pull request activity from the GitHub repository
   * and posts a summary message to a specified Slack channel.
   */
  async function gatherActivity() {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [owner, repo] = 'chaynHQ/bloom-frontend'.split('/');
    const staffUsernames = [
      'annarhughes',
      'kyleecodes',
      'eleanorreem',
      'github-actions[bot]',
      'dependabot[bot]',
    ];

    const contributorPrs = {};
    const assigneePrs = {}; // Track PRs assigned to each assignee
    let totalMergedPRs = 0;

    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data: prs } = await octokit.pulls.list({
        owner,
        repo,
        state: 'closed', // only closed (completed) PRs
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        page,
      });

      for (const pr of prs) {
        if (
          // Fetch merged PRs within 2 weeks
          pr.merged_at &&
          new Date(pr.merged_at) >= startDate &&
          new Date(pr.merged_at) <= endDate
        ) {
          // Exclude staff and bots
          if (pr.user && !staffUsernames.includes(pr.user.login)) {
            const assignee = pr.assignee ? pr.assignee.login : 'Unassigned';

            // Add to contributor PRs
            if (!contributorPrs[pr.user.login]) {
              contributorPrs[pr.user.login] = [];
            }
            contributorPrs[pr.user.login].push({ count: 1, assignee });

            // Add to assignee PRs
            if (!assigneePrs[assignee]) {
              assigneePrs[assignee] = 0;
            }
            assigneePrs[assignee] += 1;

            // Increment total merged PRs
            totalMergedPRs++;
          }
        } else if (new Date(pr.updated_at) < startDate) {
          hasMore = false;
          break;
        }
      }

      if (prs.length < 100) {
        hasMore = false;
      }
      page++;
    }

    // Format the Slack message
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*BLOOM FRONTEND: Open-Source Activity (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Total OSS Contributor Merged PRs:* ${totalMergedPRs}`,
        },
      },
    ];

    for (const [contributor, prs] of Object.entries(contributorPrs)) {
      const totalPRs = prs.length;
      const assignees = prs.map((pr) => pr.assignee);
      const uniqueAssignees = [...new Set(assignees)].join(', ');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `- *${contributor}*: ${totalPRs} PR${totalPRs > 1 ? 's' : ''} merged (Assignee${uniqueAssignees.includes(',') ? 's' : ''}: ${uniqueAssignees})`,
        },
      });
    }

    // Post the formatted message to Slack
    await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID || '',
      blocks: blocks,
    });
  }

  // Execute the gatherActivity function and handle errors
  await gatherActivity().catch(console.error);
}

// Run the main function and handle errors
main().catch(console.error);
