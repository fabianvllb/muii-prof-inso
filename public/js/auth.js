if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", docReady);
} else {
    docReady();
}

function docReady() {
   document.getElementById("alt-action").firstElementChild.nextElementSibling.addEventListener("click", switchAction);
   document.getElementById("button").addEventListener("click", submitEvent);
   document.getElementsByClassName("email")[0].addEventListener("focus", onFocus);
   document.getElementsByClassName("password")[0].addEventListener("focus", onFocus);
}

function switchAction(event) {
    let email = document.getElementsByClassName("email")[0];
    let password = document.getElementsByClassName("password")[0];
    email.dispatchEvent(new Event("focus"));
    password.dispatchEvent(new Event("focus"));
    email.value = "";
    password.value = "";
    if (event.target.classList.contains("signup-instead")) {
        event.target.parentElement.firstElementChild.innerText = "Already have an account?";
        event.target.text = "Log in instead";
        event.target.classList.remove("signup-instead");
        event.target.classList.add("login-instead");
        event.target.parentElement.previousElementSibling.classList.add("signup");
        event.target.parentElement.previousElementSibling.classList.remove("login");
        event.target.parentElement.previousElementSibling.innerText = "Sign up";
    }
    else {
        event.target.parentElement.firstElementChild.innerText = "Don't have an account yet?";
        event.target.text = "Sign up instead";
        event.target.classList.remove("login-instead");
        event.target.classList.add("signup-instead");
        event.target.parentElement.previousElementSibling.classList.add("login");
        event.target.parentElement.previousElementSibling.classList.remove("signup");
        event.target.parentElement.previousElementSibling.innerText = "Log in";
    }
}

function submitEvent(event) {
    event.preventDefault();
    let email = document.getElementsByClassName("email")[0];
    let password = document.getElementsByClassName("password")[0];
    let errorsFound = false;
    if (email.value.length < 1 || !email.value.includes("@") || !email.value.includes(".")) {
        email.value = "";
        email.placeholder = "Please, enter a valid email";
        email.classList.add("error");
        errorsFound = true;
    }
    if (password.value.length < 1) {
        password.value = "";
        password.placeholder = "Please, enter a password";
        password.classList.add("error");
        errorsFound = true;
    }
    if (!errorsFound) {
        let endpoint;
        if (password.nextElementSibling.classList.contains("login")) {
            endpoint = "/login";
        }
        else {
            endpoint = "/register";
        }
        axios({
            method: "post",
            url: endpoint,
            data: {
                email: email.value,
                password: password.value,
            },
            headers: { "Content-Type": "application/json" },
          }).then(function(response) {
            if (response.data.errors) {
                if (response.data.errors.emailError) {
                    email.value = "";
                    email.classList.add("error");
                    email.placeholder = response.data.errors.emailError;
                }
                else if (response.data.errors.emailAlreadyInUseError) {
                    email.value = "";
                    email.classList.add("error");
                    email.placeholder = response.data.errors.emailAlreadyInUseError;
                }
                else if (response.data.errors.passwordError) {
                    password.classList.add("error");
                    password.placeholder = response.data.errors.passwordError;
                }
                else if (response.data.errors.emailPassCombinationError) {
                    email.value = "";
                    password.value = "";
                    email.classList.add("error");
                    password.classList.add("error");
                    email.placeholder = response.data.errors.emailPassCombinationError;
                    password.placeholder = response.data.errors.emailPassCombinationError;
                }
                else {
                    email.value = "";
                    password.value = "";
                    email.classList.add("error");
                    password.classList.add("error");
                    email.placeholder = response.data.errors.generalError;
                    password.placeholder = response.data.errors.generalError;
                }
            }
            else {
                if (endpoint == "/login") {
                    window.location.href = "/user";
                }
                else {
                    document.getElementById("alt-action").firstElementChild.nextElementSibling.dispatchEvent(new Event("click"));
                }
            }
          }).catch(function(error) {
    
          });
    }
}

function onFocus(event) {
    let inputField = event.target;
    inputField.classList.remove("error");
    if (inputField.classList.contains("password")) {
        inputField.placeholder = "Password...";
    }
    else {
        inputField.placeholder = "Email address...";
    }
}