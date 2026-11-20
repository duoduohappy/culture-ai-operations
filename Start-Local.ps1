$ErrorActionPreference='Stop'
$nodePath=(Get-Command node).Source
function Is-Up($url) { try { return (Invoke-WebRequest $url -TimeoutSec 2).StatusCode -eq 200 } catch { return $false } }
$workspaceRoot=(Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
if (!(Is-Up 'http://127.0.0.1:8790/health')) {
 $runtime=Join-Path $workspaceRoot 'work\runtime\llama\llama-server.exe'
 $model=Join-Path $workspaceRoot 'work\models\qwen2.5-1.5b-instruct-q4_k_m.gguf'
 if ((Test-Path -LiteralPath $runtime) -and (Test-Path -LiteralPath $model)) {
  Start-Process -FilePath $runtime -ArgumentList @('-m',('"'+$model+'"'),'--host','127.0.0.1','--port','8790','-c','4096','-t','4','--alias','interview-qwen','--log-disable') -WindowStyle Hidden
 } else { Write-Output 'Local model runtime not found. Configure AI_BASE_URL in .env.' }
}
if (!(Test-Path (Join-Path $PSScriptRoot 'node_modules'))) { Push-Location $PSScriptRoot; try { npm ci --ignore-scripts --no-audit --no-fund; if($LASTEXITCODE -ne 0){throw 'npm ci failed'} } finally { Pop-Location } }
if (!(Is-Up 'http://127.0.0.1:8787/')) { Start-Process -FilePath $nodePath -ArgumentList 'server.cjs' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden }
Write-Output 'Local project: http://127.0.0.1:8787/'
