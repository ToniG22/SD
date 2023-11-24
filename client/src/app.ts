window.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header");
    const xhr = new XMLHttpRequest();
    const fullURL = "/components/header.html";
    xhr.open("GET", fullURL, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            headerContainer.innerHTML = xhr.responseText;
        }
    };
    xhr.send();
});
