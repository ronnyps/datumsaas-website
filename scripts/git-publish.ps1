param(
  [Parameter(Mandatory = $true)]
  [string]$Message,

  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host ">> Checking git status..."
git rev-parse --is-inside-work-tree | Out-Null

Write-Host ">> Staging all changes..."
git add -A

Write-Host ">> Creating commit..."
git commit -m "$Message"

Write-Host ">> Pushing to origin/$Branch..."
git push origin $Branch

Write-Host ">> Done."
