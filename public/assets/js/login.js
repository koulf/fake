'use strict';

if (window.sessionStorage.getItem("token") != null)
window.location.href = "/home";

let loginBtn = document.getElementById("loginBtn");

let username = document.getElementById("inputEmail");
let pass = document.getElementById("inputPassword");



loginBtn.addEventListener("click", (evt) => {
    event.preventDefault();
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", '/login/user');
    xhr.setRequestHeader("Content-Type", "application/json");
    let user = {
        usuario: username.value,
        password: pass.value
    }
    xhr.onload = (evt) => {
        if (xhr.status == 201) {
            window.sessionStorage.setItem("token", xhr.response);
            alert("Accessing");
            window.location.href = "/home";
        }
        else if (xhr.status == 400)
        alert("Username not registered");
        else
        alert("Invalid password");
    };
    xhr.send(JSON.stringify(user));
});