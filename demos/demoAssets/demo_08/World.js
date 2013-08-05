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
        var me = this;

        this.particles = [];

        var p1 = Ape.ParticleFactory(
            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
        );
        p1.velocity.set(40, 60, 0);
        p1.position.set(50, 0, 0);
        p1.setMass(1);
        scene.add(p1);

        var p2 = Ape.ParticleFactory(
            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
        );
        p2.velocity.set(-40, 60, 0);
        p2.position.set(350, 0, 0);
        p2.setMass(1);
        scene.add(p2);

        this.particles = [p1, p2];

        this.particleRegistry = new Ape.ParticleForceRegistry();
    },

    update: function (delta) {
        var me = this;
        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle) {
            particle.integrate(delta);
        });

        for (var i = 0; i < this.particles.length; i += 1) {
            for (var j = i + 1; j < this.particles.length; j += 1) {
                var contact = new Ape.ParticleContact();
                contact.particle = [
                    this.particles[i], this.particles[j]
                ];
                contact.contactNormal = this.particles[i].position.clone()
                    .sub(this.particles[j].position);
//                contact.penetration =
//                contact.resolve(delta);
            }
        }
    }
});