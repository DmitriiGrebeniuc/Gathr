export function getAuthFlowType(href: string) {
  const match = href.match(/[?#&]type=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
