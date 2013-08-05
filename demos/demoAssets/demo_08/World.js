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

//        var p1 = Ape.ParticleFactory(
//            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
//        );
//        p1.velocity.set(40, 60, 0);
//        p1.position.set(50, 0, 0);
//        p1.setMass(1);
//        scene.add(p1);
//
//        var p2 = Ape.ParticleFactory(
//            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
//        );
//        p2.velocity.set(-40, 60, 0);
//        p2.position.set(350, 0, 0);
//        p2.setMass(1);
//        scene.add(p2);

        for (var i = 0; i < 10; i += 1) {
            this.particles.push(me.randomParticle());
        }

        this.particleRegistry = new Ape.ParticleForceRegistry();
    },

    update: function (delta) {
        var me = this;
        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle, index) {
            particle.integrate(delta);

            // remove from the scene if it's not present anymore
            if (particle.position.y < 0) {
                scene.remove(particle);
                me.particles.splice(index, 1);

                me.particles.push(me.randomParticle());
            }
        });

        for (var i = 0; i < this.particles.length; i += 1) {
            for (var j = i + 1; j < this.particles.length; j += 1) {
                var posI = this.particles[i].position,
                    posJ = this.particles[j].position;

                if (posI.distanceTo(posJ) <= this.particles[i].radius * 2) {
                    var contact = new Ape.ParticleContact();
                    contact.particle = [
                        this.particles[i], this.particles[j]
                    ];
                    contact.contactNormal = posI.clone()
                        .sub(posJ).normalize();
                    contact.penetration = 5 - posI.distanceTo(posJ);
                    contact.resolve(delta);
                }
            }
        }
    },

    randomParticle: function () {
        var particle = Ape.ParticleFactory(
            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
        );

        var max = 600;
        var position = new THREE.Vector3(
            Math.random() * max, 1, 0// Math.random() * max - max * 0.5
        );
        var center = new THREE.Vector3(max / 2, 0, 0);
        var velocity = center.clone().sub(position).normalize().multiplyScalar(60);
        velocity.y = Math.random() * 60;
        particle.velocity = velocity.clone();
        particle.position = position;
        particle.setMass(1 + Math.random() * 10);
        scene.add(particle);

        return particle;
    }
});