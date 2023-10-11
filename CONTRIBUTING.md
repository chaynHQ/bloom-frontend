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
2. [Ask to be Assigned Existing issue or Created Issue](#2-ask-to-be-assigned-to-an-existing-issue-or-an-issue-youve-created)
3. [Fork Chayn Repo and Create New Branch for Your PR](#3-fork-the-repo-and-create-a-new-branch-for-your-pr)
4. [Commit Changes Using Open-Source Standards](#4-commit-changes-using-open-source-standards)
5. [Report Progress and Update your Fork as Needed](#5-report-progress-in-issues-discussion-and-update-your-fork-as-needed)
6. [Push Changes to Your Remote Branch](#6-push-changes-to-your-remote-branch)
7. [Make Pull Request to Chayn](#7--make-pull-request-to-chayn)

## 1. **Read the README and Code of Conduct:**.
To learn the foundations of the project, please read the project's [README](/README.md). Contributing means you have agreed to our [Code of Conduct](/CODE_OF_CONDUCT.md)

**Note: If you are making no-code changes in the README or any other markdown / text files, it may not be required to follow all of these steps in our Contributing Guide. Instead, you may edit these files and submit a PR directly in GitHub, without setting up environment variables and or requiring tests to pass in your fork.**

## 2. **Ask to be assigned to an existing issue or an issue you've created:**
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
    
**Issue Management:**
  - Issues can be assigned to multiple people if everyone agrees to collaborate!
  - Consider if an issue would be best broken up into multiple, smaller issues.
  - If an assigned issue is abandoned, we will unassign the issue. Please do not hestitate to comment on an issue you can no longer complete, we understand life happens. We will tag you when the issue is unassigned to you.

**Please feel free to ask clarifying questions in the issues discussions at any point during your contribution!**

## 3. **Fork the repo and create a new branch for your PR:**

  - Name your branch with the issue number and descriptive title, such as "328-add-pwa-support"
  - Develop on this branch locally and push commits to your remote fork with the same branch name.

## 4. **Commit changes using open-source standards:**
Follow open-source standards for structuring and formatting your commits and commit messages.

**Commit Structure:**
- First line is the subject title. This should be capitalized, and is a short summary of the commit (< 50 char).
  - e.g. ID and title of issue e.g. “308 /  Add PWA support”. Ensures a commit can be tracked to a ticket.
- Blank line to separate subject from body. Ensures “git log” can parse logs correctly. 
- Body which explains the **why** of a commit rather than **how.**
- See [link](https://cbea.ms/git-commit/) for more detail on structuring commits.

**Commit Formatting:**
- To keep commit messages readable, your commit message word wrap length should not exceed 72 chars.
- Keep commits small and distinct. A PR can have multiple commits but only if each commit is distinctive and relevant in the PR.
- Check that no secrets and no unwanted, irrelevant files are being commited. Update `.gitignore` as needed.
  
## 5. **Report progress in issues discussion and update your fork as needed:**

   - If your issue is more complex, feel free to report your progress by commenting on the issue or ticking off checkboxes in the issue description!
   - If the original base repo is updated, it is recommended that you sync your fork with the base repo in order to prevent merge conflicts.

## 6. **Push changes to your remote branch:**
**Before pushing changes, check for the following:**
- Your change have brief, descriptive code comments explaining your code.
- Check that your tests pass. Note: Some tests may need to be ran multiple times before they pass, thank you for your patience as we are upgrading our app's performance.
- Run our linters on updated files to ensure uniform code formatting.
- Ensure that no secret tokens are being pushed to GitHub! Files containing secrets should be listed in `.gitignore`
- When finished making commits, push your changes to your remote fork branch.

## 7 . **Make Pull Request to Chayn:**

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

