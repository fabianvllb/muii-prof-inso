const subInput = document.getElementById("url-input");
const subButton = document.getElementById("add-new-site-button");
const subList = document.querySelector(".subscription-list");

subButton.addEventListener("click", addSite);
document.getElementById("logout-button").addEventListener("click", logoutEvent);
//document.getElementById("go-to-site-btn").addEventListener("click", goToSite);


// get user subscriptions
axios({
  method: "get",
  url: "/feed",
  headers: { "Content-Type": "application/json" },
}).then((response) =>  {
  //console.log(response.data.subscriptionList[0]);
  for (let i=0; i<response.data.subscriptionList.length; i++){
    updateSubscriptionList(response.data.subscriptionList[i]);
  }
})

function updateSubscriptionList(url){
  // Create subscription card
  const subscriptionCard = document.createElement("div");
  subscriptionCard.className = "feed-card";

  const cardHeader = document.createElement("div");
  cardHeader.className = "card-header";
  subscriptionCard.appendChild(cardHeader);

  const headerTitle = document.createElement("p");
  headerTitle.className = "card-title";
  if(url.length > 90){
    headerTitle.innerText = url.substr(0,90).concat("...");
  }else{
    headerTitle.innerText = url;
  }
  cardHeader.appendChild(headerTitle);

  const cardButtons = document.createElement("div");
  cardButtons.className = "card-buttons";
  subscriptionCard.appendChild(cardButtons);

  const siteButton = document.createElement("a");
  siteButton.innerText = "Site";
  siteButton.href = url;
  siteButton.target = "_blank";
  cardButtons.appendChild(siteButton);

  const editButton = document.createElement("a");
  editButton.innerText = "Edit";
  cardButtons.appendChild(editButton);

  subList.appendChild(subscriptionCard);
}

function addSite(event){
  event.preventDefault();

  if(subInput.value == "") return;

  // Send subscription to server
  axios({
    method: "post",
    url: "/subscribe",
    data: {
      title: "Title",
      url: subInput.value,
      description: "No description"
    },
    headers: { "Content-Type": "application/json" },
  }).then((response) =>  {
    if(response != ""){
      return;
    }
  })
  // Create subscription card
  updateSubscriptionList(subInput.value);
  subInput.value = "";
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