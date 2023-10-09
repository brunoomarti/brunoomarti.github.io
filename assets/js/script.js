function initializeCanvas(config) {
    var canvas = document.getElementById("gradientMap");
    var ctx = canvas.getContext("2d");
    var gradient;

    var background = document.createElement('div');
    background.classList.add('background');
    document.body.appendChild(background);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, config.gradientColors[0]);
        gradient.addColorStop(1, config.gradientColors[1]);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawImage();
    }

    function drawImage() {
        var img = new Image();
        img.src = config.imagePath;

        img.onload = function () {
            var aspectRatio = img.width / img.height;
            var targetWidth = canvas.width;
            var targetHeight = canvas.width / aspectRatio;

            if (targetHeight < canvas.height) {
                targetHeight = canvas.height;
                targetWidth = canvas.height * aspectRatio;
            }

            var x = (canvas.width - targetWidth) / 2;
            var y = (canvas.height - targetHeight) / 2;

            ctx.globalCompositeOperation = config.globalCompositeOperation1;
            ctx.webkitFilter = 'blur(' + config.blurAmount + ')';
            ctx.filter = 'blur(' + config.blurAmount + ')';
            ctx.drawImage(img, x, y, targetWidth, targetHeight);

            ctx.globalCompositeOperation = config.globalCompositeOperation2;
            ctx.drawImage(canvas, 0, 0);
        };
    }

    resizeCanvas();
    window.addEventListener("resize", function () {
        resizeCanvas();
    });
}

class Card3d {
    constructor (selector) {
        this.hitbox = document.getElementById(selector);
        this.card = this.hitbox.querySelector('.card');
        this.light = this.hitbox.querySelector('.light');
        const {width, height, left, top} = this.hitbox.getBoundingClientRect();

        this.halfSize = {
            x: width / 2,
            y: height / 2,
        };

        this.origin = {
            x: left + this.halfSize.x,
            y: top + this.halfSize.y,
        };

        this.angle = {
            x: 10,
            y: 10,
        };

        this.mouse = {
            x: 0,
            y: 0,
        };

        this.ratio = {
            x: 0,
            y: 0,
        };

        this.setupListeners();
    }

    calculateCardRotation() {
        const offset = {
            x: this.mouse.x - this.origin.x,
            y: this.mouse.y - this.origin.y,
        };
    
        this.ratio = {
            x: offset.x / this.halfSize.x,
            y: offset.y / this.halfSize.y,
        };
    
        const { x, y } = this.angle;
        const rotation = {
            x: Number(-this.ratio.y * x).toFixed(1),
            y: Number(this.ratio.x * y).toFixed(1),
        };

        return rotation;
    }

    cardClick() {
        this.cardTurn();
        this.card.classList.toggle('flipped');
    }

    cardTurn() {
        const isFlipped = this.card.classList.contains('flipped');
        const rotateYValue = isFlipped ? '0deg' : '180deg';
        const transformValue = `rotateY(${rotateYValue}) scale(0.95)`;

        this.card.animate(
            [{ transform: transformValue }],
            { duration: 500, easing: 'ease-out', fill: 'forwards', delay: 250 }
        );

        setTimeout(() => {
            const frontContent = this.hitbox.querySelector('.front-content');
            const backContent = this.hitbox.querySelector('.back-content');
            frontContent.style.display = isFlipped ? 'block' : 'none';
            backContent.style.display = isFlipped ? 'none' : 'flex';
        }, 400);
    }

    updateCardRotation() {
        const { x, y } = this.calculateCardRotation();
        const flipped = this.card.classList.contains('flipped');
        
        const rotateYValue = flipped ? `rotateY(${180 - (-y)}deg)` : `rotateY(${y}deg)`;
        const transformValue = `rotateX(${flipped ? x : x}deg) scale(0.95) ${rotateYValue}`;
    
        this.card.animate(
            [{ transform: transformValue }],
            { duration: 500, easing: 'ease-out', fill: 'forwards', delay: 100 }
        );
    }

    resetCardRotation() {
        const flipped = this.card.classList.contains('flipped');
        const rotateYValue = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
        
        this.card.animate(
            [{ transform: `${rotateYValue} rotateX(0deg) scale(0.90)` }],
            { duration: 600, easing: 'ease-out', fill: 'forwards', delay: 200 }
        );
    }

    updateLightRotation() {
        const factor = this.card.classList.contains('flipped') ? -1 : 1;
        const x = this.ratio.x * 100 * factor + 50;
        const y = this.ratio.y * 100 + 50;
    
        this.light.style.background = `
            radial-gradient(circle at ${x}% ${y}%, 
                rgba(171, 194, 208, 0.5) 0%, 
                rgba(171, 194, 208, 0.4) 20%, 
                transparent, 
                transparent)`;
    }

    setupListeners(){

        this.hitbox.addEventListener('click', () => {
            this.cardClick();
        });

        this.hitbox.addEventListener('mousemove', (e)=>{
            this.mouse = {
                x : e.clientX,
                y : e.clientY,
            };

            this.updateCardRotation();
            this.updateLightRotation();
        });

        this.hitbox.addEventListener('mouseleave', (e)=>{
            this.resetCardRotation();
        });

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            window.addEventListener('deviceorientation', (e) => {
                this.mouse = {
                    x: (e.gamma + 90) * (window.innerWidth / 180) * 1.5,
                    y: (e.beta + 90) * (window.innerHeight / 180) * 1.5,
                };

                this.updateCardRotation();
                this.updateLightRotation();
            });
        }
    }
}

const card = new Card3d('hitbox');
