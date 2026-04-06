const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            core.setFailed('No GitHub token found.');
            return;
        }
        const octokit = github.getOctokit(token);
        const context = github.context;
        
        const pr = context.payload.pull_request;
        if (!pr) {
            core.setFailed('No pull request found.');
            return;
        }
        
        const issueNumber = pr.body.match(/#(\d+)/);
        if (!issueNumber) {
            core.setFailed('No issue number found in pull request body.');
            return;
        }
        
        const { data: issue } = await octokit.rest.issues.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNumber[1],
        });

        await octokit.rest.pulls.update({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: pr.number,
            title: issue.title,
        });

        console.log(`PR title updated to: ${issue.title}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
