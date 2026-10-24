param([string]$Message = 'Update Gant02')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
npm run check
if ($LASTEXITCODE -ne 0) { throw 'Syntax check failed' }
npm test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed' }
git add --all
if ($LASTEXITCODE -ne 0) { throw 'Could not stage changes' }
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m $Message
  if ($LASTEXITCODE -ne 0) { throw 'Could not commit changes' }
}
git push github HEAD:main
if ($LASTEXITCODE -ne 0) { throw 'Could not push to GitHub' }
