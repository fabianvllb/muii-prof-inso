const subInput = document.getElementById("url-input");
const subButton = document.getElementById("add-new-site-button");
const subList = document.querySelector(".subscription-list");

subButton.addEventListener("click", addSite);

function addSite(event){
  event.preventDefault();

  const subscriptionCard = document.createElement("div");
  subscriptionCard.className = "feed-card";

  const cardHeader = document.createElement("div");
  cardHeader.className = "card-header";
  subscriptionCard.appendChild(cardHeader);

  const headerTitle = document.createElement("p");
  headerTitle.className = "card-title";
  headerTitle.innerText = "Title";
  cardHeader.appendChild(headerTitle);

  const cardTitleSeparator = document.createElement("p");
  cardTitleSeparator.className = "card-title-separator";
  cardTitleSeparator.innerText = "-";
  cardHeader.appendChild(cardTitleSeparator);

  const cardURL = document.createElement("p");
  cardURL.innerText = subInput.value;
  cardHeader.appendChild(cardURL);

  const cardDescription = document.createElement("p");
  cardDescription.className = "card-description";
  cardDescription.innerText = "Description: No description yet";
  subscriptionCard.appendChild(cardDescription);

  const cardButtons = document.createElement("div");
  cardButtons.className = "card-buttons";
  subscriptionCard.appendChild(cardButtons);

  const siteButton = document.createElement("a");
  siteButton.innerText = "Site";
  cardButtons.appendChild(siteButton);

  const editButton = document.createElement("a");
  editButton.innerText = "Edit";
  cardButtons.appendChild(editButton);

  subList.appendChild(subscriptionCard);
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