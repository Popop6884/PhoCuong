export function getImageUrl(path: string | undefined): string {
  if (!path) return ''
  // Nếu là link online (https://...) thì giữ nguyên
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Nếu là path nội bộ thì ghép thêm /uploads/
  return path.startsWith('/') ? `/uploads${path}` : `/uploads/${path}`
}