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

        // Get cursor position relative to the image
        pos = getCursorPos(e);

        // Calculate the position of the lens
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);

        // Prevent the lens from being positioned outside the image
        if (x > img.width - lens.offsetWidth) { x = img.width - lens.offsetWidth; }
        if (x < 0) { x = 0; }
        if (y > img.height - lens.offsetHeight) { y = img.height - lens.offsetHeight; }
        if (y < 0) { y = 0; }

        // Set the position of the lens
        lens.style.left = x + "px";
        lens.style.top = y + "px";

        // Display what the lens "sees" in the result DIV
        result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }

    function getCursorPos(e) {
        let a, x = 0, y = 0;
        e = e || window.event;
        /* Get the x and y positions of the image relative to the viewport */
        a = img.getBoundingClientRect();
        /* Calculate the cursor's x and y coordinates, relative to the image */
        x = (e.pageX || e.touches[0].pageX) - a.left;
        y = (e.pageY || e.touches[0].pageY) - a.top;
        /* Consider any page scrolling */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
}