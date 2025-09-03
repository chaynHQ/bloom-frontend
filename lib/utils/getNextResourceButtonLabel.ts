export default function getNextResourceButtonLabel(nextResourceHref: string) {
  if (nextResourceHref.includes('/conversations/')) {
    return 'nextConversationButtonLabel';
  } else if (nextResourceHref.includes('/courses/')) {
    return 'nextSessionButtonLabel';
  } else {
    return 'nextVideoButtonLabel';
  }
}
