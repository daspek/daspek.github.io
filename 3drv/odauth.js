

function odauth(interactive) {
  ensureHttps();
  var token = getTokenFromCookie();
  if (token) {
    onAuthenticated(token);
  }
  else if (interactive) {
    challengeForAuth();
  }
  else {
    showLoginButton();
  }
}

function ensureHttps() {
  if (window.location.protocol != "https:") {
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
  }
}

function onAuthCallback() {
  var authInfo = getAuthInfoFromUrl();
  var token = authInfo["access_token"];
  var expiry = parseInt(authInfo["expires_in"]);
  setCookie(token, expiry);
  window.opener.onAuthenticated(token, window);
}

function getAuthInfoFromUrl() {
  if (window.location.hash) {
    var authResponse = window.location.hash.substring(1);
    var authInfo = JSON.parse(
      '{"' + authResponse.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
      function(key, value) { return key === "" ? value : decodeURIComponent(value); });
    return authInfo;
  }
  else {
    alert("failed to receive auth token");
  }
}


function getTokenFromCookie() {
  var cookies = document.cookie;
  var name = "odauth=";
  var start = cookies.indexOf(name);
  if (start >= 0) {
    start += name.length;
    var end = cookies.indexOf(';', start);
    if (end < 0) {
      end = cookies.length;
    }
    else {
      postCookie = cookies.substring(end);
    }

    var value = cookies.substring(start, end);
    return value;
  }

  return "";
}

function setCookie(token, expiresInSeconds) {
  var expiration = new Date();
  expiration.setTime(expiration.getTime() + expiresInSeconds * 1000);
  var cookie = "odauth=" + token +"; path=/; expires=" + expiration.toUTCString();

  if (document.location.protocol.toLowerCase() == "https") {
    cookie = cookie + ";secure";
  }

  document.cookie = cookie;
}

function popup(url)
{
  var width = 525,
      height = 525,
      screenX = window.screenX,
      screenY = window.screenY,
      outerWidth = window.outerWidth,
      outerHeight = window.outerHeight;

  var left = screenX + Math.max(outerWidth - width, 0) / 2;
  var top = screenY + Math.max(outerHeight - height, 0) / 2;

  var features = [
              "width=" + width,
              "height=" + height,
              "top=" + top,
              "left=" + left,
              "status=no",
              "resizable=yes",
              "toolbar=no",
              "menubar=no",
              "scrollbars=yes"];
  var popup = window.open(url, "oauth", features.join(","));
  popup.focus();
}


function getAppInfo()
{
  var scriptTag = document.getElementById("odauth");
  if (!scriptTag) {
    alert("the script tag for odauth.js should have its id set to 'odauth'");
  }

  var appId = scriptTag.getAttribute("clientId");
  if (!appId)
  {
    alert("the odauth script tag needs a clientId attribute set to your application id");
  }

  var scopes = scriptTag.getAttribute("scopes");
  if (!scopes)
  {
    alert("the odauth script tag needs a scopes attribute set to the scopes your app needs");
  }

  var appInfo = {
    "appId": appId,
    "scopes": scopes
  };

  return appInfo;
}

function showLoginButton()
{
  var loginText = document.createElement('a');
  loginText.href = "#";
  loginText.id = "loginText";
  loginText.onclick = challengeForAuth;
  loginText.innerText = "[sign in]";
  document.body.insertBefore(loginText, document.body.children[0]);
}

function removeLoginButton()
{
  var loginText = document.getElementById("loginText");
  if (loginText) {
    document.body.removeChild(loginText);
  }
}

function challengeForAuth()
{
  var appInfo = getAppInfo();
  var url =
    "https://login.live.com/oauth20_authorize.srf?client_id=" + appInfo.appId +
    "&scope=" + appInfo.scopes +
    "&response_type=token&redirect_uri=https%3A%2F%2Fdaspek.github.io%2F3drv%2Fcallback.html";
  popup(url);
}
