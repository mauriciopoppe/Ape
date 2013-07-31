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
        this.particles.push(new Ape.ParticleFactory(
            Ape.ParticleFactory.PISTOL
        ));
        this.particles.push(new Ape.ParticleFactory(
            Ape.ParticleFactory.ARTILLERY
        ));
        this.particles.push(new Ape.ParticleFactory(
            Ape.ParticleFactory.FIREBALL
        ));
        this.particles.push(new Ape.ParticleFactory(
            Ape.ParticleFactory.LASER
        ));

        // additional forces
        this.particleRegistry = new Ape.ParticleForceRegistry();
        // adding gravity to the artillery particle
        this.particleRegistry.add(
            this.particles[1],
            new Ape.ParticleGravity(
                Ape.GRAVITY
            )
        );
        // adding drag to the laser particle
        this.particleRegistry.add(
            this.particles[3],
            new Ape.ParticleDrag(0.5, 0.5)
        );

        this.particles.forEach(function (item) {
            scene.add(item);
        });
    },

    update: function (delta) {
        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle) {
            particle.integrate(delta);
        });
    }
});