const postIssueComment = require('./utils/postGHComment');

async function main({ g, c }) {
  const github = g;
  const context = c;

  // Retrieve body of context.payload and search for GitHub keywords followed by
  // '#' + number. Exclude any matches that are in a comment within the PR body
  const prBody = context.payload.pull_request.body;
  const prNumber = context.payload.pull_request.number;
  const prOwner = context.payload.pull_request.user.login;
  const regex =
    /(?!&lt;!--)(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s*#(\d+)(?![^&lt;]*--&gt;)/gi;
  const match = prBody.match(regex);

  let prComment;

  if (!match) {
    console.log('PR does not have a properly linked issue.');
    prComment = `@${prOwner}, this Pull Request is not linked to a valid issue. Above, on the first line of your PR, please link the number of the issue that you worked on using the format of 'Resolves #' + issue number, for example:   **_Fixes #9876_**\n\nNote: Do **_not_** use the number of this PR or URL for issue. Chayn staff may disregard this. A linked issue is required for automated PR labeling.`;
  } else {
    console.log(match[0]);
    const [keyword, linkNumber] = match[0].replaceAll('#', '').split(' ');
    console.log(`Found a keyword: \'${keyword}\'. Checking for legitimate linked issue...`);

    // Check if the linked issue exists in repo
    // Issue get request: https://octokit.github.io/rest.js/v20#issues-get
    try {
      await github.rest.issues.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: linkNumber,
      });
      console.log(
        `Found an issue: \'#${linkNumber}\' in repo. Reference is a legitimate linked issue.`,
      );
    } catch (error) {
      console.log(`Couldn\'t find issue: \'#${linkNumber}\' in repo. Posting comment...`);
      prComment = `@${prOwner}, the issue number referenced above as "**${keyword}  #${linkNumber}**" is not found. Please replace with a valid issue number.`;
    }
  }

  // Post comment to PR
  if (prComment) {
    postIssueComment(prNumber, prComment, github, context);
  }
}

module.exports = main;
