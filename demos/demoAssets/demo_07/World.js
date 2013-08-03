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

        var p1 = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        p1.acceleration.set(0, -10, 0);
        p1.position.set(200, 100, 0);
        p1.setMass(1);       // ∞ mass
        scene.add(p1);

        var p2 = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        p2.acceleration.set(0, -10, 0);
        p2.position.set(250, 100, 0);
        p2.setMass(1);
        scene.add(p2);

        // additional forces
        this.particleRegistry = new Ape.ParticleForceRegistry();

        // adding a spring between those particles
        this.particleRegistry.add(
            p2,
            // ### switch between these values to test the spring stiffness
            new Ape.ParticleSpring(p1, 100, 25)
//            new Ape.ParticleSpring(p1, 1000, 25)
//            new Ape.ParticleSpring(p1, 5000, 25)
        );

        this.particles = [p1, p2];
    },

    update: function (delta) {
        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle) {
            particle.integrate(delta);
        });
    }
});