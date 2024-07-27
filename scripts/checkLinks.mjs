import jsdom from 'jsdom';

const getLinks = async (baseUrl) => {
  console.log(`Checking links for ${baseUrl}`);
  const urlsToCheck = [baseUrl];
  const checkedInternalUrls = new Set();
  const deadExternalUrls = new Set();
  const liveExternalUrls = new Set();

  const isNewURL = (url) =>
    !deadExternalUrls.has(url.href) &&
    !liveExternalUrls.has(url.href) &&
    !checkedInternalUrls.has(url.href);

  while (urlsToCheck.length !== 0) {
    var internalUrl = urlsToCheck.pop();
    checkedInternalUrls.add(internalUrl);

    var dom = await jsdom.JSDOM.fromURL(internalUrl);

    var document = dom.window.document;

    var linksFromSite = document.getElementsByTagName('a');
    for (var urlIndex in linksFromSite) {
      var url = linksFromSite[urlIndex];
      if (url.href && url.href.indexOf('://') !== -1 && isNewURL(url.href)) {
        var isExternalLink = url.host !== dom.window.location.host;

        if (isExternalLink) {
          var response = await fetch(url.href);
          response.ok ? liveExternalUrls.add(url.href) : deadExternalUrls.add(url.href);
        } else if (!checkedInternalUrls.has(url.href)) {
          urlsToCheck.push(url.href);
          checkedInternalUrls.add(url.href);
        }
      }
    }
  }

  return {
    InternalUrls: checkedInternalUrls,
    DeadExternalUrls: deadExternalUrls,
    LiveExternalUrls: liveExternalUrls,
  };
};

var checkedUrls = await getLinks('https://bloom.chayn.co/');

console.log('Internal URLs examined', checkedUrls.InternalUrls);
console.log('Dead external URLs', checkedUrls.DeadExternalUrls);
console.log('Live external URLs', checkedUrls.LiveExternalUrls);
