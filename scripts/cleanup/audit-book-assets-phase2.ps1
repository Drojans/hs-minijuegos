# Audita si los assets de public/ui/book aparecen referenciados por nombre en src y public.
# Ejecuta desde la raíz:
#   .\scripts\cleanup\audit-book-assets-phase2.ps1

$projectRoot = (Get-Location).Path
$assetRoot = Join-Path $projectRoot "public\ui\book"

$textFiles = Get-ChildItem $projectRoot -Recurse -File |
  Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\.git\\" -and
    $_.FullName -notmatch "\\public\\card-images\\" -and
    $_.FullName -notmatch "\\_archive-unused-" -and
    $_.Extension -in @(".js", ".jsx", ".css", ".html", ".mjs", ".json")
  }

$assets = Get-ChildItem $assetRoot -Recurse -File |
  Where-Object { $_.FullName -notmatch "\\_archive-unused-" }

$result = foreach ($asset in $assets) {
  $name = $asset.Name
  $hits = @()

  foreach ($file in $textFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -like "*$name*") {
      $hits += $file.FullName.Substring($projectRoot.Length + 1)
    }
  }

  [PSCustomObject]@{
    Asset = $asset.FullName.Substring($projectRoot.Length + 1)
    Used = ($hits.Count -gt 0)
    References = ($hits -join "; ")
  }
}

$result | Sort-Object Used, Asset | Format-Table -AutoSize
