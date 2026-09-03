// Formats a media position in seconds as `m:ss` (or `h:mm:ss` past an hour), for audio/video
// player timestamps.
export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const pad = (value: number) => value.toString().padStart(2, '0');

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}
