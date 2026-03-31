const track = document.querySelector('.images-info-track');
const slides = document.querySelectorAll('.images-info');
let current = 0;

setInterval(() => {
    current++;

    const slideWidth = slides[0].offsetWidth;
    track.style.transition = 'transform 0.6s ease';
    track.style.transform = `translateX(-${current * slideWidth}px)`;

    if (current >= slides.length - 1) {
        setTimeout(() => {
            track.style.transition = 'none';
            track.style.transform = 'translateX(0)';
            current = 0;
        }, 600);
    }
}, 3000);