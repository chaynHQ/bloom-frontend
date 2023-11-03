# How to Contribute to Chayn ⭐

First off, thank you so much for taking the time to contribute!

We ❤️ our contributors!

While Chayn is hybrid between paid staff and volunteers now, we cherish our volunteers for helping to create Chayn and keep us going! We hope to give back more than our contributors give. Please do not hesitate to give us feedback, so we can learn how to make this experience better for you. 😊 You can include feedback in your pull request, GitHub issue, or [this anonymous form](https://forms.gle/17GQpeHc4G1Mgdf3A).

**This guide below assumes you are an open-source contributor and NOT an official Chayn volunteer that has already completed the onboarding process. If you would like to become an official tech volunteer with Chayn, please [visit our Getting Involved Guide](https://www.notion.so/chayn/Get-involved-423c067536f3426a88005de68f0cab19?pvs=4). As an official Chayn volunteer, you will receive professional onboarding onto our platforms and more opportunities to volunteer outside of GitHub contributions!**

Next, let's get started... 🎉

# New Contributor Guide

If you are new to GitHub and git version control, here are some resources to help you get started:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## What kind of contributions does Chayn want?

Chayn is open to all kinds of contributions, such as:

- no-code (improved documentation and translations)
- additional software tests
- code of any kind (enhancements, new features, maintenance)

Just no spamming (such as unwanted, minor documentation and HTML/CSS changes) please! 

# The Contribution Process:
### Contribution Process Outline:
1. [Read the README and Code of Conduct](#1-read-the-readme-and-code-of-conduct)
2. [Claim an Issue](#2-claim-an-issue)
3. [Fork the Repo and Create a New Branch](#3-fork-the-repo-and-create-a-new-branch)
4. [Commit Changes Using Open-Source Standards](#4-commit-changes-using-open-source-standards)
5. [Sync Fork if Needed](#5-sync-your-fork-if-needed)
6. [Push Changes to GitHub](#6-push-changes-to-github)
7. [Make a Pull Request to Chayn](#7--make-a-pull-request-to-chayn)

## 1. **Read the README and Code of Conduct:**.
To learn the foundations of the project, please read the project's [README](/README.md). Contributing means you have agreed to our [Code of Conduct](/CODE_OF_CONDUCT.md)

**Note: If you are making no-code changes in the README or any other markdown / text files, it may not be required to follow all of these steps in our Contributing Guide. Instead, you may edit these files and submit a PR directly in GitHub, without setting up environment variables and or requiring tests to pass in your fork.**

## 2. **Claim an Issue:**
**Please ask to be assigned an issue, this helps us keep track of contributor progress. We may deny your PR if the issue is already assigned to someone who asked.**
  - **If creating an issue:**
    Check that your issue doesn't already exist and follow our issue templates for creating new issues. 
  - **If contributing to an existing issue:**
    Please comment on it asking for the issue to be assigned to you.
    
**Check Issue Labels:**
  - Scan our issue `labels` to find issues that suit you:
    - The `good first issue` label is for problems or updates we think are ideal for beginners.
    - The `moderate` label is for problems or updates that may take 1-2 days and will require some knowledge of the codebase.
    - The `advanced` is for problems or updates that may take more time, say around 2-4 days. These will require more in-depth knowledge of the codebase.
  - We suggest starting with a `good first issue` to get comfortable with the codebase before moving on.
    
**How We Manage Issues:**
  - Issues can be assigned to multiple people if everyone agrees to collaborate!
  - Consider if an issue would be best broken up into multiple, smaller issues. If so, feel free to create those issues!
  - If an assigned issue is abandoned, we will unassign the issue after tagging you if we receive no response.
  - If you can no longer complete an issue you're assigned to, we understand life happens! Please comment on the issue and we will unassign you.
  - For complex issues, please report your progress in the issue discussions by tagging the issue author or Chayn maintainer who assigned you, and ticking off the checkboxes in the issue description.

**If you need more clarifying information about the issue, please tag us (issue author or Chayn maintainer who assigned the issue to you) to ask questions in the issues discussions at any point during your contribution. We are happy to help! You will hear back from us within 3 days, and we are online daily during Hacktober.**

## 3. **Fork the Repo and Create a New Branch:**

  - Fork the Chayn repo you want to make changes on, then create a new feature branch on your fork. This new branch will be where you make changes.
  - Name your new branch with a label (check the issue labels) and description, such as `dependencies/update-node`
  - Alternatively, you may name the branch with your GitHub name and descriptive title, such as `chayntech/update-node`
## 4. **Commit Changes Using Open-Source Standards:**
Follow the following open-source standards for structuring and formatting your commits and commit messages:

**Commit Message Structure:**
- **Commit Title**: (< 50 char) first line is the commit title. This should be capitalized and contain a short, one-line summary.
- Blank line to separate title from body. This ensures “git log” can parse logs correctly. 
- **Commit Description**: (< 72 char) explains the **why** of a commit rather than **how.** 
- See [link](https://cbea.ms/git-commit/) for more detail on structuring commits.

**Commit Formatting:**
- To keep commit messages readable, your commit message should wrap text to avoid long, single lines of text.
- Keep commits small and distinct. A PR can have multiple commits, but only if each commit is distinctive and relevant in the PR. 
- Check that no secrets and no unwanted, irrelevant files are being commited. Update `.gitignore` as needed.
  
## 5. **Sync Your Fork if Needed:**
If the Chayn repo you forked from (the upstream repo) is updated, you will need to pull these changes from upstream before you push. One way to tell if the upstream repo has been updated is if there is a message displayed when viewing your forked repo in GitHub that says something like "This branch is 1 commit behind chayn:bloom-frontend". 

To update your fork, first sync your forked default branch (main, master, or develop branch depending on the project) and then merge those changes into your feature branch. Always make sure that your default branch is up-to-date first before your feature branch. *Note: there are many methods of syncing forks and updating branches, this documentation will focus on the git merging method because rebasing comes with more risks to unintentionally overwriting git history. Please see the additional resources listed at the end of this section for more info.*

To sync with upstream changes, first sync your default branch by running the commands below or [following this guide on syncing in the GitHub UI](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui).
```
# Add a new remote upstream repository
git remote add upstream https://github.com/ORIGINAL_OWNER/ORIGINAL_REPOSITORY.git

# Verify remote upstream
git remote -v

# Sync your fork
git fetch upstream

# Switch to default branch
git checkout main

# Merge upstream with main branch
git merge upstream/main
```
Next, merge the updated default branch into your feature branch. 

If you used the GitHub UI to sync the default branch of your remote fork, you will need to `git pull` those changes into your local default branch. Then, merge those changes into your feature branch:
```
# Checkout default branch
git checkout main

# Pull changes from your remote
git pull

# Switch to feature branch
git checkout FEATURE-BRANCH

# Merge changes in main into feature branch
git merge main
```
If you used the command line to sync your local forked repo with the upstream repo, switch to your feature branch and merge the updated default branch into it:
```
# Switch to your feature branch
git checkout FEATURE-BRANCH

# Merge default branch into feature branch
git merge main
```
Use `git log` to check that commits have been updated. In your feature branch history, you should see the updated commits pulled from upstream, then your new commit, followed by a merge commit. Please resolve any merge conflicts (resources below) and let us know if you have any questions.

**Helpful Resources for Updating Forks:**
- [GitHub Docs: About Merge Methods](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github) 
- [GitHub Docs: Resolving Merge Conflicts on GitHub](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github)
- [GitHub Docs: Configuring a Remote Repo for a Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-repository-for-a-fork)
- [FreeCodeCamp: How to Sync Your Fork with the Original Git Repo](https://www.freecodecamp.org/news/how-to-sync-your-fork-with-the-original-git-repository/)


## 6. **Push Changes to GitHub:**
Push your changes to your remote, forked repo.
**Before pushing changes, check for the following:**
- Your change have brief, descriptive code comments explaining your code.
- Check that your tests pass. Note: Some tests may need to be ran multiple times before they pass, thank you for your patience as we are upgrading our app's performance.
- Run our linters on updated files to ensure uniform code formatting.
- Ensure that no secret tokens are being pushed to GitHub! Files containing secrets should be listed in `.gitignore`
- When finished making commits, push your changes to your remote fork branch.

## 7 . **Make a Pull Request to Chayn:**

   - Make sure to link your corresponding issue in your PR's description and follow the PR templates instructions.
   - Include detailed and concise explanations of the changes you made.
   - Include images in the description, if applicable.
   - Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so a maintainer can update the branch for a merge.
   - Be available for discussions that may arise and to make [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) that may be required before merging.
   - Once the review has passed, it will merge to the *develop* branch.
   - To deploy, look at project readme for project specific instructions.

### Get merged and celebrate! 🎉

Woohoo! Once your PR is merged, your changes will be public on GitHub!

Thank you for contributing to Chayn! 👏

**If you enjoyed the contributing to Chayn, give our repo a star to help our projects reach more developers like you!** ⭐
