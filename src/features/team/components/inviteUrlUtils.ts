export function normalizeInviteUrl(inviteUrl: string | null | undefined) {
  if (!inviteUrl) {
    return null
  }

  const trimmedInviteUrl = inviteUrl.trim()

  if (!trimmedInviteUrl) {
    return null
  }

  try {
    if (trimmedInviteUrl.startsWith('/invite/')) {
      return new URL(trimmedInviteUrl, window.location.origin).toString()
    }

    const parsedUrl = new URL(trimmedInviteUrl)

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null
    }

    return parsedUrl.toString()
  } catch {
    return null
  }
}
