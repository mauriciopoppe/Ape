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
        var particles = [],
	        p;
        p = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        p.setMass(100);
        p.setDamping(0.7);
        p.acceleration = Ape.GRAVITY.clone();
        p.position.set(100, 10, 0);
        scene.add(p);
	    particles.push(p);

        p = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        p.setMass(1000);
        p.setDamping(0.7);
        p.acceleration = Ape.GRAVITY.clone();
        p.position.set(200, 10, 0);
        scene.add(p);
	    particles.push(p);

	    p = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
	    p.setMass(1);
	    p.setDamping(0.7);
	    p.acceleration = Ape.GRAVITY.clone();
	    p.position.set(300, 10, 0);
	    scene.add(p);
	    particles.push(p);

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