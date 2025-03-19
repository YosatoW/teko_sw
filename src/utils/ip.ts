export const cleanIpAddress = (ip: string): string => {
    if (!ip) return ''
    // Remove port number if present
    return ip.replace(/:\d+[^:]*$/, '')
}