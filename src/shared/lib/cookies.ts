export function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return undefined
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${encodeURIComponent(name)}=`))

  if (!cookie) {
    return undefined
  }

  const separatorIndex = cookie.indexOf('=')
  const value = cookie.slice(separatorIndex + 1)

  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
