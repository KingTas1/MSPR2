const navbarToggleBtn = document.querySelector(".nav__toggle-button")
const mainNav = document.querySelector(".header-nav")

navbarToggleBtn.addEventListener("click", toggleNavigation)

function toggleNavigation() {
    if(mainNav.classList.contains("header-nav--active")) {
        navbarToggleBtn.querySelector("img").src = "./assets/logos/hamburger.svg"
    }
    else {
        navbarToggleBtn.querySelector("img").src = "./assets/logos/close.svg"
    }
    mainNav.classList.toggle("header-nav--active")
}

const navLinks = document.querySelectorAll(".nav__link")

navLinks.forEach(link => link.addEventListener("click", toggleNavigation))




