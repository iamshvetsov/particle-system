class Vector {
    constructor (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add = ({ x, y }) => {
        this.x += x;
        this.y += y;

        return this;
    };

    copy = () => new Vector(this.x, this.y);

    static getRandom = (gravity, scatter) => {
        const random = Math.round(Math.random() * scatter - scatter / 2);
        const randomVector = {
            x: -gravity.y * random,
            y: gravity.x * random
        };

        return new Vector(randomVector.x, randomVector.y);
    };
}

class World {
    constructor (canvas) {
        this.context = canvas.getContext('2d');
        this.params = {
            canvasWidth: canvas.width || 500,
            canvasHeight: canvas.height || 500
        };
        this.particleSystems = [];
        this.controllableParticleSystem = null;

        canvas.addEventListener('mousemove', (e) => {
            this.controllableParticleSystem = this.particleSystems.find((system) => system.isControllable);
            this.controllableParticleSystem.coords.x = e.offsetX;
            this.controllableParticleSystem.coords.y = e.offsetY;
        });

        canvas.addEventListener('mousewheel', (e) => {
            e.preventDefault();

            this.controllableParticleSystem = this.particleSystems.find((system) => system.isControllable);
            if (e.shiftKey) {
                this.controllableParticleSystem.particleSize = Math.round(
                    Math.max(1, this.controllableParticleSystem.particleSize - e.wheelDelta / 100)
                );
            }
            if (e.altKey) {
                this.controllableParticleSystem.scatter =
                    Math.max(0, this.controllableParticleSystem.scatter - e.wheelDelta / 1000);
            }
        });
    }

    addParticleSystem = (particleSystem) =>
        this.particleSystems.push(new ParticleSystem({ ...particleSystem, context: this.context }));

    start = () => this.tick();

    tick = () => {
        this.updateWorld();
        this.drawWorld();
        window.requestAnimationFrame(this.tick);
    };

    updateWorld = () => this.particleSystems.forEach((system) => system.updateParticleSystem());

    drawWorld = () => {
        const { context, params: { canvasWidth, canvasHeight }, particleSystems } = this;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        particleSystems.forEach((system) => system.drawParticleSystem());
    };
}

class ParticleSystem {
    constructor ({ context, isControllable, coords, gravity, maxAmount, creationAmount, particleSize, scatter }) {
        this.context = context;
        this.isControllable = Boolean(isControllable);
        this.coords = coords;
        this.gravity = gravity;
        this.maxAmount = maxAmount;
        this.creationAmount = creationAmount;
        this.particleSize = particleSize;
        this.scatter = scatter;
        this.particles = [];
    }

    updateParticleSystem = () => {
        const { context, coords, gravity, maxAmount, creationAmount, particleSize, scatter, particles } = this;

        this.particles = particles.filter((particle) => particle.size > 0);
        if (this.particles.length + creationAmount <= maxAmount) {
            for (let i = 1; i <= creationAmount; i++) {
                const particleParams = {
                    coords: coords.copy(),
                    gravity,
                    particleSize,
                    scatter
                };

                this.particles.push(new Particle({ ...particleParams, context }));
            }
        }
        this.particles.forEach((particle) => particle.updateParticle());
    };

    drawParticleSystem = () => this.particles.forEach((particle) => particle.drawParticle());
}

class Particle {
    constructor ({ context, coords, gravity, particleSize, scatter }) {
        this.context = context;
        this.coords = coords;
        this.gravity = gravity;
        this.initialSize = particleSize;
        this.size = particleSize;
        this.scatter = scatter;
    }

    updateParticle = () => {
        const { coords, gravity, size, scatter } = this;

        if (size > 0) {
            this.size--;
            this.coords = coords.add(gravity).add(Vector.getRandom(gravity, scatter));
        }
    };

    drawParticle = () => {
        const { context, coords: { x, y }, initialSize, size } = this;
        const gradient = context.createRadialGradient(x, y, 0, x, y, size);

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(1, 'transparent');

        context.globalAlpha = size / initialSize;
        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI);
        context.fillStyle = gradient;
        context.fill();
    };
}

const world = new World(document.getElementById('canvas'));

world.addParticleSystem({
    isControllable: true,
    coords: new Vector(250, 450),
    gravity: new Vector(0, -5),
    maxAmount: 100,
    creationAmount: 1,
    particleSize: 50,
    scatter: 1.5
});

world.addParticleSystem({
    coords: new Vector(250, 50),
    gravity: new Vector(0, 5),
    maxAmount: 100,
    creationAmount: 1,
    particleSize: 50,
    scatter: 1.5
});

world.addParticleSystem({
    coords: new Vector(50, 250),
    gravity: new Vector(5, 0),
    maxAmount: 100,
    creationAmount: 1,
    particleSize: 50,
    scatter: 1.5
});

world.addParticleSystem({
    coords: new Vector(450, 250),
    gravity: new Vector(-5, 0),
    maxAmount: 100,
    creationAmount: 1,
    particleSize: 50,
    scatter: 1.5
});

world.start();
