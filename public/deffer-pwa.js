window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  // Stash the event so it can be triggered later.
  window.beforeinstallpromptEvent = e;
  return false;
});
