export function capitalize(text: string): string {
  if (text?.length > 1) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  } else {
    return text?.toUpperCase() || '';
  }
}
