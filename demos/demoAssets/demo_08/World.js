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
        var me = this,
	        p;

        this.particles = [];

        for (var i = 0; i < 100; i += 1) {
            this.particles.push(me.randomParticle());
        }

	    // two particle tests
//	    p = this.particles[0];
//	    p.position.set(0, 0, 0);
//	    p.velocity.set(50, 50, 0);
//	    p.setMass(1);
//
//	    p = this.particles[1];
//	    p.position.set(300, 0, 0);
//	    p.velocity.set(-50, 50, 0);
//      p.setMass(1);

	    this.accumulatedTime = 0;
        this.particleRegistry = new Ape.ParticleForceRegistry();
    },

    update: function (delta) {
        var me = this;
        this.accumulatedTime += delta;
        if (this.accumulatedTime >= 1) {
            me.particles.push(me.randomParticle());
            this.accumulatedTime = 0;
        }


        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle, index) {
            particle.integrate(delta);

            // remove from the scene if it's not present anymore
            if (particle.position.y < 0) {
                particle.setInverseMass(0);
                particle.velocity.set(0, 0, 0);
                particle.acceleration.set(0, 0, 0);
            }
        });

        for (var i = 0; i < this.particles.length; i += 1) {
            for (var j = i + 1; j < this.particles.length; j += 1) {
                var posI = this.particles[i].position,
                    posJ = this.particles[j].position;

                if (posI.distanceTo(posJ) <=
                        this.particles[i].radius +
                        this.particles[j].radius) {
                    var contact = new Ape.ParticleContact();
                    contact.particles = [
                        this.particles[i], this.particles[j]
                    ];
                    contact.restitution = 0;
                    contact.contactNormal = posI.clone()
                        .sub(posJ).normalize();
                    contact.penetration = this.particles[i].radius +
                        this.particles[j].radius - posI.distanceTo(posJ);
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
            Math.random() * max, 0, 0 //Math.random() * 0.3// * max - max * 0.5
        );
        var center = new THREE.Vector3(max / 2, 0, 0);
        var velocity = center.clone().sub(position).normalize().multiplyScalar(60);
        velocity.y = Math.random() * 60;
        particle.velocity = velocity.clone();
        particle.position = position;
        particle.setMass(1);
        scene.add(particle);

        return particle;
    }
});