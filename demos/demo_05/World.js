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
        this.particles = [];

        var staticParticle = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        staticParticle.position.set(200, 100, 0);
        staticParticle.setInverseMass(0);       // ∞ mass
        scene.add(staticParticle);

        var gravityParticle = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        gravityParticle.position.set(205, 100, 0);
        gravityParticle.setMass(5);
        scene.add(gravityParticle);

        // additional forces
        this.particleRegistry = new Ape.ParticleForceRegistry();

        // adding gravity to the artillery particle
        this.particleRegistry.add(
            gravityParticle,
            new Ape.ParticleGravity(Ape.GRAVITY)
        );
        this.particleRegistry.add(
            staticParticle,
            new Ape.ParticleGravity(Ape.GRAVITY)
        );

        // adding spring between those particles
        this.particleRegistry.add(
            gravityParticle,
            new Ape.ParticleSpring(staticParticle, 5, 5)
        );
        this.particleRegistry.add(
            staticParticle,
            new Ape.ParticleSpring(gravityParticle, 5, 5)
        );

        this.particles = [staticParticle, gravityParticle];
    },

    update: function (delta) {
        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle) {
            particle.integrate(delta);
        });
    }
});