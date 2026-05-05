# Fase 2 - archivar assets de Home que ya no se usan.
# Ejecuta este script desde la raíz del proyecto:
#   .\scripts\cleanup\archive-unused-book-assets-phase2.ps1
#
# No borra nada: mueve los archivos a public\ui\book\_archive-unused-20260505.

$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$archiveRoot = Join-Path $projectRoot "public\ui\book\_archive-unused-20260505"

function Move-UnusedAsset {
  param(
    [string]$RelativePath,
    [string]$Bucket
  )

  $source = Join-Path $projectRoot $RelativePath
  if (!(Test-Path $source)) {
    Write-Host "SKIP no existe: $RelativePath"
    return
  }

  $destDir = Join-Path $archiveRoot $Bucket
  New-Item -ItemType Directory -Path $destDir -Force | Out-Null

  $dest = Join-Path $destDir (Split-Path $RelativePath -Leaf)
  Move-Item -Path $source -Destination $dest -Force
  Write-Host "ARCHIVADO: $RelativePath -> $dest"
}

# Seguridad: antes de archivar render-v1, comprueba que la nota activa ya esté copiada a cartoon-v1.
$requiredMigratedAsset = Join-Path $projectRoot "public\ui\book\cartoon-v1\parchment-note-render.png"
if (!(Test-Path $requiredMigratedAsset)) {
  throw "Falta public\ui\book\cartoon-v1\parchment-note-render.png. Copia primero los archivos del zip de fase 2."
}

$legacyRootAssets = @(
  "public\ui\book\featured-quest-frame-large.png"
  "public\ui\book\featured-quest-frame.png"
  "public\ui\book\icon-database.png"
  "public\ui\book\icon-grid.png"
  "public\ui\book\icon-impostor.png"
  "public\ui\book\icon-mana.png"
  "public\ui\book\open-book-overlay.webp"
  "public\ui\book\parchment-note-aged.png"
  "public\ui\book\parchment-note.png"
  "public\ui\book\purple-button.png"
  "public\ui\book\quest-row-aged-frame.png"
  "public\ui\book\quest-row-frame.png"
  "public\ui\book\quest-row-status-slot.png"
  "public\ui\book\tavern-background.webp"
  "public\ui\book\wood-button.png"
)

$cartoonOldAssets = @(
  "public\ui\book\cartoon-v1\flag-es-cartoon.png"
  "public\ui\book\cartoon-v1\flag-es-flat-cartoon.png"
  "public\ui\book\cartoon-v1\flag-gb-cartoon.png"
  "public\ui\book\cartoon-v1\flag-gb-flat-cartoon.png"
  "public\ui\book\cartoon-v1\toggle-language-button-dark-cartoon.png"
  "public\ui\book\cartoon-v1\toggle-language-button-gold-cartoon.png"
)

foreach ($asset in $legacyRootAssets) {
  Move-UnusedAsset -RelativePath $asset -Bucket "legacy-root"
}

foreach ($asset in $cartoonOldAssets) {
  Move-UnusedAsset -RelativePath $asset -Bucket "cartoon-old-language"
}

# Ya hemos migrado parchment-note-render.png a cartoon-v1,
# así que render-v1 completa puede quedar archivada.
$renderDir = Join-Path $projectRoot "public\ui\book\render-v1"
if (Test-Path $renderDir) {
  $destDir = Join-Path $archiveRoot "render-v1"
  New-Item -ItemType Directory -Path $destDir -Force | Out-Null

  Get-ChildItem $renderDir -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination (Join-Path $destDir $_.Name) -Force
    Write-Host "ARCHIVADO: public\ui\book\render-v1\$($_.Name)"
  }

  # Borra la carpeta render-v1 solo si queda vacía.
  if (-not (Get-ChildItem $renderDir -Force -ErrorAction SilentlyContinue)) {
    Remove-Item $renderDir -Force
    Write-Host "Carpeta render-v1 vacía eliminada."
  }
}

Write-Host ""
Write-Host "Limpieza fase 2 completada. Nada se ha borrado; todo está en:"
Write-Host $archiveRoot
