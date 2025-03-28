# How to Contribute to Chayn ⭐

Thank you for taking the time to contribute!

Have feedback on how we can improve? Questions, insight, or other concerns? We invite you to share in [this anonymous form](https://forms.gle/v2whmf4XX3du4Y3t9).

## Support Our Work

Chayn is proudly open-source and built with volunteer contributions. We are grateful for the generosity of the open-source community and aim to provide a fulfilling experience for open-source developers.

**Please give this repository a star ⭐ and follow our GitHub profile 🙏 to help us grow our open-source community and find more contributors like you!**

Support our mission further by [sponsoring us on GitHub](https://github.com/sponsors/chaynHQ), exploring our [volunteer programs](https://www.chayn.co/get-involved), and following Chayn on social media: - Linktree: [https://linktr.ee/chayn](https://linktr.ee/chayn) - Twitter: [@chaynhq](https://twitter.com/ChaynHQ) - Instagram: [@chaynhq](https://www.instagram.com/chaynhq/) - Youtube: [@chaynhq](https://www.youtube.com/@chaynhq) - Facebook: [@chayn](https://www.facebook.com/chayn) - LinkedIn: [@chayn](https://www.linkedin.com/company/chayn).

# Prerequisites

- Git version control
- a GitHub account

**Additional Guidance:**

- [Getting Started with First Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)
- [Learn the GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Git Basic Branching & Merging Guide](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [How to Collaborate with Pull Requests](https://docs.github.com/en/github/collaborating-with-pull-requests)
- [Git Cheatsheet](https://education.github.com/git-cheat-sheet-education.pdf) _(we highly recommend)_

**Previous open-source experience not required.** If this is your first contribution, we recommend saving the cheatsheet linked above for future reference, learning how to navigate the GitHub and git version control docs, and in general -- _learn as you go._ Happy coding! 💪

# Where can I get help?

You can ask Chayn team members questions at any point during your contribution in the following places on GitHub:

- Issue discussions in an issue you're assigned to or interested in.
- Pull request discussions for your contribution.
- Or, create a new issue with the `type: question / suggestion` label.

# What kind of contributions does Chayn want?

Chayn is open to all kinds of contributions, such as:

- additional software tests / test coverage
- dependency updates \*check Dependabot pull requests
- code (requested features, bug fixes, quality enhancements, maintenance help)
- accessibility and language support.
- no-code (documentation, translations) \*see spam policy below for accepted documentation changes.

# Chayn's Spam Policy 🚫

**Chayn will reject contributor pull requests if they are defined as spam or not associated with an issue.**
All pull requests need to be associated with an issue. If you open a pull request without claiming an issue, you will be asked to create an issue for your pull request.

Documentation contributions will only be accepted under these circumstances:

- is relevant to an open issue.
- adds additional context to the developer experience, such as environment set-up.
- describes solutions for common error handling.
- fixes a typo.

Unwanted documentation changes, such as summarizations, white space edits, or minor grammatical edits will be DENIED (unless there is evidence provided that these changes are for accessibility).

# Issue Policies

### Issue Limit Policy:

To ensure we give a fair opportunity to everyone, Chayn maintainers may limit the number of issues you can be assigned. This allows us to manage our open-source contributions at a sustainable pace and ensure there are always open issues for everyone.

- **Only 1 issue of a specific complexity level in a single repository may be assigned to a contributor at a time.** To be assigned another, you must complete or close your previous issue. For example, a contributor can have 1 beginner issue, 1 intermediate issue, and 1 complex issue open in a single repository at a time. But they cannot have 3 beginner issues open, or 2 intermediate issues open at once in a single repository.
- **Beginner issues may be capped** at any time to reserve for current events, such as volunteer programs or Hacktoberfest.

### Abandoned Contribution Policy:

We understand that life happens! If you can no longer finish a contribution, please comment to let us know so we can swiftly reassign.

- After 60 days of no activity, your issue or pull request will be labeled `stale` and you will be prompted to respond in the discussions.
- If there is no response, we will unassign the issue and close your pull request.

# The Contribution Process Guide

### Directions for Contributing to Chayn:

1. [Read the README and Code of Conduct](#1-read-the-readme-and-code-of-conduct)
2. [Claim an Issue](#2-claim-an-issue)
3. [Fork the Repo and Create a New Branch](#3-fork-the-repo-and-create-a-new-branch)
4. [Commit Changes Using Open-Source Standards](#4-commit-changes-using-open-source-standards)
5. [Sync Fork if Needed](#5-sync-your-fork-if-needed)
6. [Push Changes to GitHub](#6-push-changes-to-github)
7. [Make a Pull Request to Chayn](#7--make-a-pull-request-to-chayn)

## 1. **Read the README and Code of Conduct:**.

First, read the project's [README](/README.md) for project-specific directions on how to set up your development environment and git flow.

Contributing means you have agreed to our [Code of Conduct](/CODE_OF_CONDUCT.md).

## 2. **Claim an Issue:**

To claim an issue, either create an issue to be assigned to OR ask to be assigned an existing issue.

- If multiple people ask to be assigned before a Chayn maintainer can respond, the person who asked first will be assigned.

- Multiple people are allowed to collaborate on a single issue.

### Create Issue:

Have an idea for a contribution? Create your own!
For more guidance see [GitHub Docs: Creating an Issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue).

### Claim Existing Issue:

To claim an existing issue, comment in the discussions tag the issue author / Chayn team member to be assigned.

### How to Select Issues:

Scan our issue labels to find issues that suit you:

- `good first issue` and `first-timers-friendly` labels are best for new contributors.
- `help wanted` label indicates that Chayn is inviting contributors to help. While contributors can contribute to any unassigned issue, issues with this label are specifically looking for help outside of Chayn's dev team.
- `complexity: beginner` label is for issues that take less than 1 day to complete, and require little to no prior experience with the codebase.
- `complexity: moderate` label is for issues that may take 1-2 days to complete, and will require some knowledge of the codebase.
- `complexity: advanced` is for issues that may take more time, possibly 3+ days. These will require more in-depth knowledge of the codebase. **Contributors are strongly encouraged to report progress while working on complex issues.**

We suggest starting with issues labeled `good first issue` or `complexity: beginner` to get comfortable with the codebase before moving onto more complex issues.

## 3. **Fork the Repo and Create a New Branch:**

First, read the **Git Flow and Deployment** section in your project's `README` file to learn of any project-specific requirements. Generally, the git flow is the same among all repositories, however, each project may slightly vary.

Next, follow the five-step process below to create your own copy of Chayn's code to work on.

### Make Your Own Copy of Chayn's Code To Work On:

1. **Fork the Chayn repository** you want to make changes on in GitHub:
   - In the GitHub web browser, navigate to the Chayn repository you want to contribute to, then select "Fork" in the top-right menu. For more in-depth guidance, read this forking guide in the GitHub Docs: [How to Fork a Repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo).
   - Ensure that you are forking from the **default branch**. Depending on the project, the default branch may **not** be `main`. In general, GitHub will automatically fork the default branch, but it's important to verify the default branch for your project in the `README` file.
2. **Create a new feature branch on your fork.** This feature branch will be where you make changes.
   - Navigate to your forked repository (found on your GitHub profile in your list of repositories) then select the drop-down menu of branches in the top-left corner. There will be an option to create a new branch. For more in-depth guidance, read this guide on creating new branches in the GitHub Docs: [Branching Guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository).
   - We recommend naming your new feature branch intuitively:
     - Branch naming option 1: use label and description, such as `dependencies/update-node`.
     - Branch naming option 2: use your GitHub name and descriptive title, such as `chayntech/update-node`.
3. **Clone the fork to your computer** where you will run the application locally. Cloning will be an option in the top right drop-down menu titled "Code" on your forked repo. If making no-code changes to markdown / text files, you can bypass this step and edit directly in GitHub inside your new feature branch. For more guidance on cloning, visit this GitHub guide: [How to Clone a Repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository).

4. **Switch to your feature branch locally** before making code changes by running the following command:

```
git checkout <feature-branch-name>
```

To create new branches locally, run this git command to create a new branch and switch to it:

```
git checkout -b <feature-branch-name>
```

5. **Verify that you are working in the correct feature branch** by running this command (you should see your feature branch as the selected branch):

```
git branch
```

For more guidance on managing branches with git version control, visit this guide: [Git Basic Branching](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging).

### What if I Clone from Chayn's Repo and Not My Fork?

Cloning from a forked repository is necessary because contributors do not have permission to push directly to Chayn's repositories. To verify that your cloned repo is from your fork, use the `git remote -v` command and check that your forked repo is set as the `origin`.

For more guidance on updating your remote origin, please visit this guide on GitHub: [Getting Started with Managing Remote Repositories](https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories).

## 4. **Commit Changes Using Open-Source Standards:**

Whether you are a beginner developer or experienced, we recommend all contributors use open-source best practices by following the six standards listed below.

### How to Properly Commit Changes:

1. **Keep commits small and distinct.** A PR can have multiple commits, but only if each commit is distinctive and relevant in the PR.
2. **Comment your code** to describe what it's doing, especially if making extensive code changes.
3. **Run linters** to properly format your code before making commits. Directions for running linters are in the repository's `README` file.
4. **Run tests and check that they pass.** Directions for running tests are in the repository's `README` file.

5. **Check that no secrets (sensitive API keys and environment variables) and no unwanted, irrelevant files are committed.** Everything you commit to Chayn will be public, please be vigilant about not committing sensitive information. Be sure to update `.gitignore` as needed, making sure to clean the `.gitignore` cache whenever new files are added to it. Learn more about properly using the `.gitignore` file to ignore specific files in this GitHub guide: [Ignoring Files Guide](https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files).

6. **Write readable commit messages** as demonstrated below:

### How to Write Readable Commit Messages:

**Basic Anatomy of a Commit Message:**

```
git commit -m <title> -m <description>
```

**Commit Title:**

- (< 50 char) first line is the commit title. This should be capitalized and contain a short, one-line summary.
- Blank line to separate title from body. This ensures “git log” can parse logs correctly.

**Commit Description:**

- (< 72 char) explains the **why** of a commit rather than **how.**
- To keep commit messages readable, your commit message should wrap text to avoid long, single lines of text.
- See [link](https://cbea.ms/git-commit/) for more detail on structuring commits.

**Example: Git Commit Message (Good):**

```
fix: fix foo to enable bar

Fix bug preventing users from submitting the subscribe form
```

**Example: Git Commit Message (Bad):**

```
fixed bug on landing page
```

## 5. **Sync Your Fork if Needed:**

If the default branch of the Chayn repository you forked from has been updated (referred to as the "upstream repository"), it is recommended to keep your forked repository up to date with these changes.

### How Can I Tell if the Upstream Repository has been Updated?

Navigate to the GitHub UI (in the web browser) and view your forked repository, you will see a notification alerting you that your fork has less commits than the upstream. See an example in the guide linked below.

### How Do I Update my Fork?

**We recommend this GitHub guide on how to sync your fork: [GitHub Docs: Syncing Your Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork).** You can sync your fork using the GitHub UI (web browser), command line, or GitHub's CLI by following the directions in the GitHub Docs.

We recommend making sure that your default branch is up-to-date first _before_ your feature branch. After syncing your default branch with the upstream, then **merge** those updates into your feature branch. Next, verify the git history on your feature branch is correctly synced with the upstream. One way to do this is to use the `git log` command to check commit history. In your feature branch history, you should see the updated commits pulled from upstream, then your new commits, followed by a merge commit. Finally, please resolve any **merge conflicts** by manually editing the conflicting files and deciding how the conflicting changes should be merged.

**Additional Guidance:**

- [GitHub Docs: About Merge Methods](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github)
- [GitHub Docs: Resolving Merge Conflicts on GitHub](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github)
- [GitHub Docs: Configuring a Remote Repo for a Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-repository-for-a-fork)
- [FreeCodeCamp: How to Sync Your Fork with the Original Git Repo](https://www.freecodecamp.org/news/how-to-sync-your-fork-with-the-original-git-repository/)

## 6. **Push Changes to GitHub:**

**Before pushing changes to GitHub, please check that you have followed the standards listed in the [Commit Changes Using Open-Source Standards](#4-commit-changes-using-open-source-standards) section of this document.**

We ask that you **carefully ensure** that there are **no secrets and unwanted files being pushed.**

We recommend using the `git status` command to verify that the right files are being pushed.

**Additional Guidance:**

- [Git Docs: git-status command](https://git-scm.com/docs/git-status)
- [Git Docs: git push command](https://github.com/git-guides/git-push)
- [GitHub Docs: How to Push to a Remote Repository](https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository)

## 7 . **Make a Pull Request to Chayn:**

For a more in-depth guide on creating pull requests, please refer to this guide in the GitHub Docs: [Creating a Pull Request Guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). We recommend opening a pull request in the GitHub UI (GitHub in the web browser.)

**Next, complete the tasklist in the pull request template.** This is a brief tasklist that is only viewable when creating a pull request.

Finally, submit your pull request, and be available for discussions that may arise and to make [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) that may be required before merging.

## Get merged and celebrate! 🎉

Woohoo! Once your PR is merged, your changes will be public on GitHub!

Thank you for contributing to Chayn! 👏

**If you enjoyed contributing to Chayn, give our repo a star to help our projects reach more developers like you!** ⭐
