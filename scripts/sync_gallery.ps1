# ========================================================
# Script tự động quét thư mục ảnh, cập nhật MySQL & file SQL
# ========================================================
$dataDir = "D:\PhoCuongData\gallery"
$sqlFile = "$PSScriptRoot\..\database\init_gallery.sql"

if (-not (Test-Path $dataDir)) {
    Write-Host "Không tìm thấy thư mục: $dataDir" -ForegroundColor Red
    exit
}

# 1. Lấy toàn bộ file ảnh trong thư mục
$images = Get-ChildItem -Path $dataDir -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp)$' }

if ($images.Count -eq 0) {
    Write-Host "Không có ảnh nào trong $dataDir" -ForegroundColor Yellow
    exit
}

Write-Host "Tìm thấy $($images.Count) ảnh trong thư mục $dataDir..." -ForegroundColor Cyan

# 2. Sinh câu lệnh SQL
$rows = @()
$order = 1
foreach ($img in $images) {
    # Tự đổi tên file thành tiêu đề: "pho-bo-tai" -> "pho bo tai"
    $title = $img.BaseName -replace '-', ' ' -replace '_', ' '
    $path = "gallery/$($img.Name)"
    $rows += "('$title', '$path', 'food', 0, $order, NOW(), NOW())"
    $order++
}

$values = $rows -join ",`n"
$sqlContent = @"
-- Tự động sinh từ script sync_gallery.ps1 lúc $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- Tổng cộng: $($images.Count) ảnh

INSERT INTO galleries (title, image_url, category, featured, sort_order, created_at, updated_at) VALUES
$values;
"@

# 3. Ghi ra file database/init_gallery.sql
Set-Content -Path $sqlFile -Value $sqlContent -Encoding UTF8
Write-Host "[OK] Đã cập nhật file: $sqlFile" -ForegroundColor Green

# 4. Nạp trực tiếp vào Docker MySQL nếu đang chạy
docker exec -i phocuong_mysql mysql -u root -pphocuong123 phocuong -e "TRUNCATE TABLE galleries; $sqlContent" 
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Đã nạp thành công $($images.Count) ảnh vào MySQL!" -ForegroundColor Green
} else {
    Write-Host "[!] MySQL chưa chạy, dữ liệu đã được lưu vào file $sqlFile" -ForegroundColor Yellow
}