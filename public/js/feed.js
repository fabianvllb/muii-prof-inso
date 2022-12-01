if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", docReady);
} else {
  docReady();
}

function docReady() {
  document.getElementById("button-subscribe").addEventListener("click", subscribeEvent);
}

function subscribeEvent(button) {
  let endpoint;
  if (button.target.value == "subscribe") {
      endpoint = "/subscribe";
  }
  else {
      endpoint = "/unsubscribe";
  }
  axios({
    method: "post",
    url: endpoint,
    data: {
        email: email.value,
        password: password.value,
    },
    headers: { "Content-Type": "application/json" },
  })
}

app.get("/feed", preventNotAuthenticated, (req, res) => {
  User.findOne({ email: req.user.email }).then((existingUser) => {
    for(subscription in existingUser.subscriptionList){
      
    };
  });
});