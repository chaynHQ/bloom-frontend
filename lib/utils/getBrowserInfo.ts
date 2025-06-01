export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let fullVersion = 'Unknown';
  let os = 'Unknown';

  // ----- Browser Detection -----
  if (userAgent.includes('Edg/')) {
    browserName = 'Microsoft Edge';
    fullVersion = userAgent.split('Edg/')[1].split(' ')[0];
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
    browserName = 'Opera';
    fullVersion = userAgent.includes('OPR/')
      ? userAgent.split('OPR/')[1].split(' ')[0]
      : userAgent.split('Opera/')[1].split(' ')[0];
  } else if (
    userAgent.includes('Chrome/') &&
    !userAgent.includes('Edg/') &&
    !userAgent.includes('OPR/')
  ) {
    browserName = 'Chrome';
    fullVersion = userAgent.split('Chrome/')[1].split(' ')[0];
  } else if (userAgent.includes('Firefox/')) {
    browserName = 'Firefox';
    fullVersion = userAgent.split('Firefox/')[1];
  } else if (userAgent.includes('Safari/') && userAgent.includes('Version/')) {
    browserName = 'Safari';
    fullVersion = userAgent.split('Version/')[1].split(' ')[0];
  } else if (userAgent.includes('MSIE ')) {
    browserName = 'Internet Explorer';
    fullVersion = userAgent.split('MSIE ')[1].split(';')[0];
  } else if (userAgent.includes('Trident/')) {
    browserName = 'Internet Explorer';
    fullVersion = userAgent.split('rv:')[1].split(')')[0];
  }

  // ----- OS Detection -----
  if (userAgent.includes('Windows NT')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    os = 'iOS';
  }

  return { browserName, fullVersion, os };
}
