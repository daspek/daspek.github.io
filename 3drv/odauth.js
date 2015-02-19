

function odauth() {
  var token = getTokenFromCookie();
  if (token) {
    onAuthenticated(token);
  }
  else {
    challengeForAuth();
  }
}

function onAuthCallback() {
  var authInfo = getAuthInfoFromUrl();
  var token = authInfo["access_token"];
  var expiry = parseInt(authInfo["expires_in"]);
  setCookie(token, expiry);
  window.opener.onAuthenticated(token);
}

function getAuthInfoFromUrl() {
  if (window.location.hash) {
    var authResponse = window.location.hash.substring(1);
    var authInfo = JSON.parse(
      '{"' + authResponse.replace(/%/g, '","').replace(/=/g, '":"') + '"}',
      function(key, value) { return key === "" ? value : decodeURIComponent(value); });
    return authInfo;
  }
  else {
    alert("failed to receive auth token");
  }
}


function getTokenFromCookie() {
  var cookies = document.cookie;
  var start = cookies.indexOf("odauth=");
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
  expiration.setTime(expiration.getTime() + secondsToExpiry * 1000);
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
  //popup.focus();
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

function challengeForAuth()
{
  var appInfo = getAppInfo();
  var url =
    "https://login.live.com/oauth20_authorize.srf?client_id=" + appInfo.appId +
    "&scope=" + appInfo.scopes +
    "&response_type=token&redirect_url=https%3A%2F%2Flogin.live.com%2Foauth20_desktop.srf";
  popup(url);
}

/*
//http://onedriveapi.azurewebsites.net/login.htm

//http://onedriveapi.azurewebsites.net/o2c.html#access_token=EwCAAq1DBAAUGCCXc8wU/zFu9QnLdZXy%2bYnElFkAAYPpfncoqJHTPUygZAF1GNNu4bpHSSABMRPi7beH3SXpqEjF7I16wTrJ/eAhA1YrGxgUUdaw5SfccTZN3BYdkD/1lrT4UkwTucUCzg9BXT7nT8X3O9ZohGEkVru85RcibXpdkTsIMHGgaBARYvqEyNJFLTf%2bmKBT5yyV%2b0JdsHIxvivdgQLt/TQo/%2b0OtMJiibHx5//cCDeLBeruWAeUk23SwRNoWRt%2bez1quA4brLhvE/GnI1d49g5NX6tJVJn3ShcI8XZ4eVd2nTFmAN%2b6ishd6Usw5C%2bA3fxM25cKqygwdEO4rZ3op0nfjtLSkqUIAqbxoYXs08nemwYOcB7MxUsDZgAACC1PQbvAFSjcUAGCLgjtyZaMQVsZVtUc6AqIMItjXwvVasLCVd65k%2b1MRtpwcKGrrsaJTFYj9B6hOn1yGv4JG8XTWQ6Y9DhQwMr5e46nvL2D06tdxYuwm/NCu%2bZ7FAAHLv1GWE/DVd9djldygvMu4BEFefpYZDHyjqHQPv2%2b0B/bvIFqIdxq41sldR1f%2bQwuHDFxGV4LO6W/EkhSnbX14o9uWtY/kmxhnr1eiiYpSzH6FTeNZShYFF11/YvGTWfn14f0N9k54oFqdqqg1Xij65UtTrVm9empwaAx3FUN7oBCKL13ON5mQw%2b12zRkAP3whajPCrqN5X7HZssxvgbp49fj8xWBAu/A79SVzkm7jUnEpaj31Q1jmHN6NWSSE%2bqlikTaeeisaPaXA3aN2DPnNaIpYir9FqEfu6nCEPOtXHlCiwC6XzfSkfXhlUV/JUea1%2bz513d4VxyCcDljAQ%3d%3d&authentication_token=eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJ2ZXIiOjEsImlzcyI6InVybjp3aW5kb3dzOmxpdmVpZCIsImV4cCI6MTQyNDQxNjY3MiwidWlkIjoiMDYxMzhmNTJhZWEwMmE5ZWIzYTkxNDQ3NmNkMTE0M2IiLCJhdWQiOiJvbmVkcml2ZWFwaS5henVyZXdlYnNpdGVzLm5ldCIsInVybjptaWNyb3NvZnQ6YXBwdXJpIjoiYXBwaWQ6Ly8wMDAwMDAwMDRDMTExNTAxIiwidXJuOm1pY3Jvc29mdDphcHBpZCI6IjAwMDAwMDAwNEMxMTE1MDEifQ.dAYb8Km4ZLv4LQKyB76KlzpfVzO22PjimrL4_aaVtEU&token_type=bearer&expires_in=3600&scope=wl.basic%20wl.skydrive_update%20wl.contacts_skydrive%20wl.signin%20onedrive.readwrite%20onedrive.readonly&user_id=06138f52aea02a9eb3a914476cd1143b

<a href="https://login.live.com:443/oauth20_authorize.srf?client_id=000000004C111501&scope=wl.basic%2Cwl.skydrive_update%2Cwl.contacts_skydrive&response_type=token&redirect_url=https%3A%2F%2Flogin.live.com%2Foauth20_desktop.srf">Click here to log in.</a>


<script>
var qp = null;
if(window.location.hash) {
  qp = location.hash.substring(1);
}
else {
  qp = location.search.substring(1);
}
qp = qp ? JSON.parse('{"' + qp.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
  function(key, value) {
    return key===""?value:decodeURIComponent(value) }
  ) : {}
document.write("<h4>Access Token</h4><textarea style='width: 400px; height: 300px; font-size: x-small;'>" + qp["access_token"] + "</textarea>");
if (window.opener) {
    window.opener.onOAuthComplete(qp);
    window.close();
}
</script>
*/
