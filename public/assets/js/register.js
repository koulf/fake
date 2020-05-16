'use strict';

if (window.sessionStorage.getItem("token") != null)
    window.location.href = "/home";


let registerBtn = document.getElementById("register_btn");

let username = document.getElementById("inputUserame");
let mail = document.getElementById("inputEmail");
let pass = document.getElementById("inputPassword");
let passC = document.getElementById("inputConfirmPassword");



registerBtn.addEventListener("click", (evt) => {
    if (pass.value != passC.value)
        alert("Passwords do not match");
    else if (document.querySelectorAll("input:invalid").length == 0){
        event.preventDefault();
        let xhr = new XMLHttpRequest();
        xhr.open("PUT", '/user/register');// + username.value);
        xhr.setRequestHeader("Content-Type", "application/json");
        let user = {
            usuario : username.value,
            correo : mail.value,
            password : pass.value
        }
        xhr.send(JSON.stringify(user));
        xhr.onload = (evt) => {
            if (xhr.status == 201) {
                alert("You can login now");
                window.location.href = "/login";
            }
            else
                if (xhr.status == 401)
                    alert("Email's already registered")
                else
                    alert("Unknown server error");
        };
    }
});