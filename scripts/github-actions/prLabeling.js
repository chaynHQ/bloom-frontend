module.exports = async ({ github, context, core }) => {
  const pr = context.payload.pull_request;
  const bodyText = pr.body;
  // regex to search for issue linked in description
  const issuePattern = /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/i;
  const match = bodyText.match(issuePattern);

  // reset labels
  async function removeAllLabels() {
    const currentLabels = await github.rest.issues.listLabelsOnIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pr.number,
    });

    for (const label of currentLabels.data) {
      await github.rest.issues.removeLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pr.number,
        name: label.name,
      });
    }
  }

  if (!match) {
    console.log('No linked issue found in the pull request description.');
    await removeAllLabels();
    return;
  }

  // label PR with linked issue labels
  const issueNumber = match[2];
  console.log(`Linked issue found: #${issueNumber}`);

  try {
    const issue = await github.rest.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNumber,
    });

    const issueLabels = issue.data.labels.map((label) => label.name);

    // Remove all existing labels
    await removeAllLabels();

    if (issueLabels.length > 0) {
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pr.number,
        labels: issueLabels,
      });
      console.log(`Added labels to PR: ${issueLabels.join(', ')}`);
    } else {
      console.log('No labels found on the linked issue.');
    }

    // Update review status label
    const reviews = await github.rest.pulls.listReviews({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number,
    });

    let reviewStatus = { name: 'needs review', color: 'b60205' };
    if (reviews.data.length > 0) {
      const latestReview = reviews.data[reviews.data.length - 1];
      switch (latestReview.state) {
        case 'APPROVED':
          reviewStatus = { name: 'review approved', color: '0E8A16' };
          break;
        case 'CHANGES_REQUESTED':
          reviewStatus = { name: 'changes requested', color: 'FBCA04' };
          break;
        case 'COMMENTED':
          reviewStatus = { name: 'review in progress', color: 'FBCA04' };
          break;
      }
    }
    await github.rest.issues
      .createLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        name: reviewStatus.name,
        color: reviewStatus.color,
      })
      .catch((error) => {
        if (error.status !== 422) {
          // 422 means label already exists
          throw error;
        }
      });

    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pr.number,
      labels: [reviewStatus.name],
    });
    console.log(
      `Updated review status label: ${reviewStatus.name} with color: ${reviewStatus.color}`,
    );
  } catch (error) {
    console.error(`Error processing PR: ${error}`);
    core.setFailed(`Error processing PR: ${error.message}`);
  }
};
