---
title: Version Control for Content Writers
slug: version-control-content
datePublished: 2026-01-15
categories:
  - writing
  - documentation
tags:
  - git
  - workflow
  - version-control
description: A practical guide to using Git for managing blog content, even if you're not a developer.
---

Git isn't just for code. It's perfect for managing blog content. Here's how to use it, even if you've never used version control before.

## Why Use Git for Content?

### Never Lose Work

Every version of every post is saved. You can always go back.

### Track Changes

See exactly what changed, when, and why.

### Collaborate Safely

Multiple people can work on content without conflicts.

### Experiment Freely

Try different approaches without fear. You can always undo.

## Installing Git

### Mac

```bash
# Check if already installed
git --version

# If not, install with Homebrew
brew install git
```

### Windows

Download from https://git-scm.com/download/win

### Linux

```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

## Basic Git Workflow

### 1. Check Status

See what's changed:

```bash
git status
```

Output:

```
On branch main
Changes not staged for commit:
  modified:   content/posts/my-post.md

Untracked files:
  content/posts/new-post.md
```

### 2. Add Files

Stage files for commit:

```bash
# Add specific file
git add content/posts/my-post.md

# Add all changed files
git add .

# Add all markdown files
git add content/posts/*.md
```

### 3. Commit Changes

Save your changes with a message:

```bash
git commit -m "Add post about version control"
```

### 4. Push to Remote

Upload to GitHub/GitLab:

```bash
git push origin main
```

## Practical Examples

### Starting a New Post

```bash
# Create the file
touch content/posts/my-new-post.md

# Check status
git status

# Add and commit
git add content/posts/my-new-post.md
git commit -m "Draft: My new post"
```

### Editing an Existing Post

```bash
# Make your edits in your editor

# See what changed
git diff content/posts/my-post.md

# Commit the changes
git add content/posts/my-post.md
git commit -m "Edit: Improve introduction"
```

### Publishing a Post

```bash
# Final edits done

# Commit
git add content/posts/my-post.md
git commit -m "Publish: My new post"

# Push to trigger deployment
git push origin main
```

## Viewing History

### See All Commits

```bash
git log
```

Output:

```
commit abc123...
Author: Jane Developer
Date:   Thu Apr 10 14:30:00 2026

    Publish: My new post

commit def456...
Author: Jane Developer
Date:   Thu Apr 10 12:00:00 2026

    Draft: My new post
```

### See Changes in a Commit

```bash
git show abc123
```

### See History of a File

```bash
git log content/posts/my-post.md
```

## Undoing Changes

### Undo Uncommitted Changes

```bash
# Discard changes to a file
git checkout content/posts/my-post.md

# Discard all changes
git checkout .
```

### Undo Last Commit (Keep Changes)

```bash
# Undo commit but keep changes staged
git reset --soft HEAD~1

# Undo commit and unstage changes (but keep files modified)
git reset HEAD~1
```

### Undo Last Commit (Discard Changes)

**Warning:** This permanently deletes your changes!

```bash
git reset --hard HEAD~1
```

### Revert a Published Commit

```bash
# Creates a new commit that undoes the changes
git revert abc123
```

## Branching for Drafts

### Create a Branch

```bash
# Create and switch to new branch
git checkout -b draft/my-post

# Or in two steps
git branch draft/my-post
git checkout draft/my-post
```

### Work on Your Draft

```bash
# Make changes
# Commit as usual
git add content/posts/my-post.md
git commit -m "Add first draft"

# Push branch to remote
git push origin draft/my-post
```

### Merge When Ready

```bash
# Switch back to main
git checkout main

# Merge your branch
git merge draft/my-post

# Push to publish
git push origin main

# Delete the branch
git branch -d draft/my-post
```

## Collaboration Workflow

### Pull Latest Changes

Before starting work:

```bash
git pull origin main
```

### Avoid Conflicts

1. Pull before you start
2. Commit frequently
3. Push regularly
4. Communicate with your team

### Resolve Conflicts

If you get a conflict:

```bash
# Git will mark conflicts in the file
<<<<<<< HEAD
Your changes
=======
Their changes
>>>>>>> branch-name
```

1. Open the file
2. Choose which version to keep
3. Remove the conflict markers
4. Commit the resolution

```bash
git add content/posts/my-post.md
git commit -m "Resolve conflict in my-post"
```

## Commit Message Conventions

Use clear, consistent messages:

```bash
# Starting a draft
git commit -m "Draft: Post title"

# Making edits
git commit -m "Edit: Improve section on X"

# Publishing
git commit -m "Publish: Post title"

# Fixing errors
git commit -m "Fix: Typo in post title"

# Adding images
git commit -m "Add: Images for post title"
```

## Useful Git Commands

### See What Changed

```bash
# Changes not yet staged
git diff

# Changes staged for commit
git diff --staged

# Changes in a specific file
git diff content/posts/my-post.md
```

### Search Commits

```bash
# Find commits mentioning "performance"
git log --grep="performance"

# Find commits that changed a file
git log content/posts/my-post.md
```

### Blame (Who Changed What)

```bash
git blame content/posts/my-post.md
```

Shows who last modified each line.

## GitHub/GitLab Integration

### Create a Repository

On GitHub:

1. Click "New repository"
2. Name it (e.g., "my-blog")
3. Don't initialize with README
4. Copy the remote URL

### Connect Local to Remote

```bash
git remote add origin https://github.com/username/my-blog.git
git push -u origin main
```

### Pull Requests

For team review:

1. Create a branch
2. Make changes
3. Push branch
4. Open pull request on GitHub
5. Request review
6. Merge when approved

## Git GUI Tools

If you prefer visual tools:

- **GitHub Desktop**: Simple, beginner-friendly
- **GitKraken**: Powerful, visual
- **Sourcetree**: Free, feature-rich
- **VS Code**: Built-in Git support

### Using VS Code

1. Open your project in VS Code
2. Click Source Control icon (left sidebar)
3. See changed files
4. Stage files (+ icon)
5. Write commit message
6. Click ✓ to commit
7. Click ⋯ → Push

## Best Practices

### Commit Often

Small, frequent commits are better than large, infrequent ones.

**Good**: 5 commits over 2 hours
**Bad**: 1 commit after 2 days

### Write Good Messages

**Good**: "Add section on Git branching"
**Bad**: "Update"

### One Logical Change Per Commit

Don't mix unrelated changes.

**Good**: Separate commits for two different posts
**Bad**: One commit editing 5 different posts

### Pull Before Push

Always pull latest changes before pushing:

```bash
git pull origin main
git push origin main
```

## Backup Strategy

Git is your backup:

- Local copy on your computer
- Remote copy on GitHub/GitLab
- Every version is saved

But also:

- Keep GitHub/GitLab account secure
- Use 2FA
- Consider a second remote (GitLab + GitHub)

## Common Mistakes

### Committing Large Files

Don't commit:

- Videos
- Large images (>1MB)
- Build artifacts
- Dependencies

Use `.gitignore`:

```
# .gitignore
node_modules/
.next/
out/
*.mp4
*.mov
```

### Force Pushing

Avoid `git push --force` unless you know what you're doing.

### Committing Secrets

Never commit:

- API keys
- Passwords
- Private keys

Use environment variables instead.

## Learning Resources

- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [Learn Git Branching](https://learngitbranching.js.org/) (interactive)
- [Oh Shit, Git!?!](https://ohshitgit.com/) (fixing mistakes)
- [GitHub Skills](https://skills.github.com/)

## Quick Reference

```bash
# Status
git status

# Add files
git add file.md
git add .

# Commit
git commit -m "Message"

# Push
git push origin main

# Pull
git pull origin main

# Create branch
git checkout -b branch-name

# Switch branch
git checkout main

# Merge branch
git merge branch-name

# View history
git log

# Undo changes
git checkout file.md

# Undo last commit
git reset HEAD~1
```

---

Git might seem intimidating at first, but these basics will cover 90% of your content management needs. Start simple and build from there.
