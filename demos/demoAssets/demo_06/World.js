/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 2:59 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.World = T3.World.extend({
    init: function (config) {
        this._super(config);
        Ape.World.prototype.initWorld.call(this);
    },

    initWorld: function () {
        var particles = [];
        particles[0] = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        particles[0].setMass(100);
        particles[0].setDamping(0.7);
        particles[0].acceleration = Ape.GRAVITY.clone();
        particles[0].position.set(100, 10, 0);
        scene.add(particles[0]);

        particles[1] = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        particles[1].setMass(1000);
        particles[1].setDamping(0.7);
        particles[1].acceleration = Ape.GRAVITY.clone();
        particles[1].position.set(200, 10, 0);
        scene.add(particles[1]);

        particles[2] = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        particles[2].setMass(1);
        particles[2].setDamping(0.7);
        particles[2].acceleration = Ape.GRAVITY.clone();
        particles[2].position.set(300, 10, 0);
        scene.add(particles[2]);

        // liquid
        var pGeometry = new THREE.PlaneGeometry(1000, 1000);
        var pMaterial = new THREE.MeshPhongMaterial({
            color: 0x0000aa,
            transparent: true,
            opacity: 0.2
        });
        var pMesh = new THREE.Mesh(pGeometry, pMaterial);
        pMesh.rotation.x -= Math.PI / 2;
        scene.add(pMesh);

        this.particlesRegistry = new Ape.ParticleForceRegistry();

        this.particlesRegistry.add(
            particles[0],
            new Ape.ParticleBuoyancy(10, 2, 0)
        );
        this.particlesRegistry.add(
            particles[1],
            new Ape.ParticleBuoyancy(10, 2, 0)
        );
        this.particlesRegistry.add(
            particles[2],
            new Ape.ParticleBuoyancy(10, 2, 0)
        );

        this.particless = particles;
    },

    update: function (delta) {
        this._super(delta);

        this.particlesRegistry.update(delta);
        this.particless.forEach(function (particles) {
            particles.integrate(delta);
        });
    }
});