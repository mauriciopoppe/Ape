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

        // link
        this.links = [];

        for (var i = 0; i < 1; i += 1) {
            this.generatePair();
        }

        this.accumulatedTime = 0;

        // force registry
        this.particleRegistry = new Ape.ParticleForceRegistry();
    },

    update: function (delta) {
        var me = this,
            contact;

        this.accumulatedTime += delta;
        if (this.accumulatedTime >= 2) {
            this.generatePair();
            this.accumulatedTime = 0;
        }

        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle) {
            particle.integrate(delta);

            // remove from the scene if it's not present anymore
            if (particle.position.y < 0) {
                particle.setInverseMass(0);
                particle.velocity.set(0, 0, 0);
                particle.acceleration.set(0, 0, 0);
            }
        });

        // contact resolution
        for (var i = 0; i < this.particles.length; i += 1) {
            for (var j = i + 1; j < this.particles.length; j += 1) {
                var posI = this.particles[i].position,
                    posJ = this.particles[j].position;

                if (posI.distanceTo(posJ) <= this.particles[i].radius * 2) {
                    contact = new Ape.ParticleContact({
                        particles: [this.particles[i], this.particles[j]],
                        restitution: 0,
                        contactNormal: posI.clone()
                            .sub(posJ).normalize(),
                        penetration: this.particles[i].radius * 2 - posI.distanceTo(posJ)
                    });
                    contact.resolve(delta);
                }
            }
        }

        // generate link contact
        for (i = 0; i < this.links.length; i += 1) {
            contact = new Ape.ParticleContact();
            if (this.links[i].fillContact(contact)) {
                contact.resolve(delta);
            }

            if (this.links[i].particles[0].position.y < 0 &&
                this.links[i].particles[1].position.y < 0) {
                this.links.splice(i, 1);
                i -= 1;
            }
        }



    },

    generatePair: function () {
        var me = this,
            p1 = me.randomParticle(),
            p2 = me.randomParticle();

        this.links.push(new Ape.ParticleCable({
            particles: [p1, p2],
            maxLength: 50,
            restitution: 0.1
        }));

        this.particles.push(p1, p2);
    },

    randomParticle: function () {
        var particle = Ape.ParticleFactory(
            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
        );

        var max = 400;
        var position = new THREE.Vector3(
            Math.random() * max, 0, 0// Math.random() * max - max * 0.5
        );
        var center = new THREE.Vector3(max / 2, 0, 0);
        var velocity = center.clone().sub(position).normalize().multiplyScalar(60);
        velocity.y = Math.random() * 100;
        particle.velocity = velocity.clone();
        particle.position = position;
        particle.setMass(1);
        scene.add(particle);

        return particle;
    }
});