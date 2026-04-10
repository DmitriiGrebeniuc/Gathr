/** Deep link: `/event/:eventId` */
export function getSharedEventIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/event\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}
