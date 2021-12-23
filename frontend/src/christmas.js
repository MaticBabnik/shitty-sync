import { tsParticles } from 'tsparticles'

tsParticles.load("snow", {
    particles: {
        number: { value: 400, density: { enable: true, value_area: 800 } },
        color: { value: "#fff" },
        shape: {
            type: ["circle", "polygon"],
            stroke: { width: 0, color: "#000000" },
            polygon: { nb_sides: 5, },
        },
        opacity: {
            value: 0.5,
            random: true,
            anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
        },
        size: {
            value: 5,
            random: true,
            anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
        },
        line_linked: {
            enable: false,
        },
        move: {
            enable: true,
            speed: 6,
            direction: "bottom",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 1200 },
        },
    },
});