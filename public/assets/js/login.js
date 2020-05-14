'use strict';


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
    xhr.send(JSON.stringify(user));
    xhr.onload = (evt) => {
        if (xhr.status == 201) {
            alert("Accessing");
            window.location.href = "/home";
        }
        else
            alert(xhr.responseText);
    };
});