function initZoom(imgID, resultID) {
    const img = document.getElementById(imgID);
    const result = document.getElementById(resultID);

    // Remove any existing lens to prevent duplicates
    const oldLens = img.parentElement.querySelector(".img-zoom-lens");
    if (oldLens) oldLens.remove();

    // Create lens
    const lens = document.createElement("div");
    lens.setAttribute("class", "img-zoom-lens");

    // Insert lens before the image
    img.parentElement.insertBefore(lens, img);

    // Calculate ratio between result DIV and lens
    const cx = result.offsetWidth / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;

    // Set background properties for the result DIV
    result.style.backgroundImage = "url('" + img.src + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";

    // Movement listeners
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);

    // Touch support for mobile
    lens.addEventListener("touchmove", moveLens);
    img.addEventListener("touchmove", moveLens);

    // Toggle visibility on hover
    img.parentElement.addEventListener("mouseenter", () => {
        lens.style.visibility = "visible";
        result.style.visibility = "visible";
    });

    img.parentElement.addEventListener("mouseleave", () => {
        lens.style.visibility = "hidden";
        result.style.visibility = "hidden";
    });

function moveLens(e) {
    let pos, x, y;
    e.preventDefault();
    pos = getCursorPos(e);

    /* NEW: Calculate the ratio between the image's actual size and displayed size */
    /* This fixes the "offset" if the bib is a different size/shape than others */
    const ratioX = img.offsetWidth / img.naturalWidth;
    const ratioY = img.offsetHeight / img.naturalHeight;

    /* Calculate the position of the lens, adjusted by the ratio */
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);

    /* Prevent the lens from being positioned outside the image */
    if (x > img.offsetWidth - lens.offsetWidth) { x = img.offsetWidth - lens.offsetWidth; }
    if (x < 0) { x = 0; }
    if (y > img.offsetHeight - lens.offsetHeight) { y = img.offsetHeight - lens.offsetHeight; }
    if (y < 0) { y = 0; }

    /* Set the position of the lens */
    lens.style.left = x + "px";
    lens.style.top = y + "px";

    /* Display what the lens "sees" */
    /* We use offsetWidth/Height here to ensure it matches the CSS exactly */
    result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
}

function getCursorPos(e) {
    let a, x = 0, y = 0;
    e = e || window.event;
    
    // Get image position relative to the viewport
    a = img.getBoundingClientRect();
    
    // Use clientX/Y (relative to viewport) to match getBoundingClientRect
    let pageX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
    let pageY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;

    // Calculate cursor coordinates relative to the image
    x = pageX - a.left;
    y = pageY - a.top;

    return { x: x, y: y };
}
}