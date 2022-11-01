if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", userReady);
} else {
    userReady();
}

function userReady() {
    document.getElementById("button").addEventListener("click", logoutEvent);
 }

 function logoutEvent(event) {
    event.preventDefault();
    axios({
        method: "post",
        url: "/logout",
        data: {},
        headers: { "Content-Type": "application/json" },
      }).then(function(response) {
        window.location.href = "/";
      }).catch (function(error) {
      });
 }