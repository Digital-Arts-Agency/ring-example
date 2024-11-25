// window.addEventListener('load', function () {
//     setTimeout(function () {
//         document.getElementById('loader').style.display = 'none';
//     }, 1400); // Hide the loader after 2 seconds
// });

let mouseDiv = document.getElementById('mouse');
let mouseOverlay = document.getElementById('mouse-overlay');
let mouseOverlayContainer = document.getElementById('mouse-overlay-container');
mouseOverlayContainer.style.display = 'none'

// Mouse click
mouseDiv.addEventListener('click', () => {
    // MouseOverlay width
    const canvas = document.querySelector("#canvasContainer");
    mouseOverlayContainer.style.display = "block"
    mouseOverlayContainer.style.width = canvas.offsetWidth + "px";
    mouseOverlay.classList.remove("hide");
    mouseOverlay.classList.add("show");
    mouseOverlayContainer.classList.add("show");

});

var backMouse = document.getElementById('back-mouse');
backMouse.addEventListener('click', () => {
    mouseOverlay.classList.remove("show");
    mouseOverlay.classList.add("hide");
    setTimeout(() => {
        mouseOverlayContainer.style.display = 'none'
        mouseOverlayContainer.classList.remove("show");
    }, 500);
});