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
        this.mesh = [];
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
            p1, p2,
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
            p1 = this.links[i].particles[0];
            p2 = this.links[i].particles[1];
            if (this.links[i].fillContact(contact)) {
                contact.resolve(delta);
            }

            if (p1.position.y < 0 && p2.position.y < 0) {
                this.links.splice(i, 1);
                i -= 1;
            }
        }

        // draw the cable
        for (i = 0; i < this.particles.length; i += 2) {
            p1 = this.particles[i];
            p2 = this.particles[i + 1];
            this.drawCylinder(p1.position, p2.position, i / 2);
        }
    },

    generatePair: function () {
        var me = this,
            p1 = me.randomParticle(),
            p2 = me.randomParticle();

        this.links.push(new Ape.ParticleCable({
            particles: [p1, p2],
            maxLength: 50,
            restitution: 0.3
        }));

        this.particles.push(p1, p2);
    },

    randomParticle: function () {
        var particle = Ape.ParticleFactory(
            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
        );

        var max = 400,
            zDiff = 0;
        var position = new THREE.Vector3(
            Math.random() * max, 0, Math.random() * zDiff - zDiff * 0.5
        );
        var center = new THREE.Vector3(max / 2, 0, 0);
        var velocity = center.clone().sub(position).normalize().multiplyScalar(60);
        velocity.y = Math.random() * 100;
        particle.velocity = velocity.clone();
        particle.position = position;
        particle.setMass(1);
        scene.add(particle);

        return particle;
    },

    drawCylinder: function (vstart, vend, index) {
        var me = this,
            orientation,
            position,
            offsetRotation,
            distance,
            texture,
            material, geometry, mesh;

        mesh = me.mesh[index];
        position = vend.clone().add(vstart).divideScalar(2);
        distance = vstart.distanceTo(vend);

        if (!mesh) {

            texture = THREE.ImageUtils.loadTexture('demoAssets/demo_10/rope.jpg');
            material = new THREE.MeshBasicMaterial({
                color: 0xaaaaff,
                wireframe: true
            });
            geometry = new THREE.CylinderGeometry(1, 1, distance, 10, 10, false);
            me.mesh[index] = mesh = new THREE.Mesh(geometry, material);
            me.mesh[index].originalDistance = distance;
            scene.add(mesh);
        }
        // inverse the internal matrix to revert the previous changes
        var matrix = mesh.matrix.clone();
        mesh.applyMatrix(new THREE.Matrix4().getInverse(matrix));

        // reapply a new rotation
        orientation = new THREE.Matrix4();
        offsetRotation = new THREE.Matrix4();
        orientation.lookAt(vstart, vend, new THREE.Vector3(0, 1, 0));
        offsetRotation.makeRotationX(Math.PI * 0.5);
        orientation.multiply(offsetRotation);
        mesh.applyMatrix(orientation);

        mesh.scale.set(1, distance / mesh.originalDistance, 1);
        mesh.position = position;

    }
});