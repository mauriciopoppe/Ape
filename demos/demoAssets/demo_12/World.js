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
            start = 100,
            limit = 5,
            i;

        this.particles = [];
        this.mesh = [];
        this.links = [];

        for (i = 0; i < limit; i += 1) {
            this.createDanglingObject(start, i);
        }

        var particles = this.createDanglingObject(start, limit);
        particles[1].position.add(
            new THREE.Vector3(30, 30, 0)
        );

        // force registry
        this.particleRegistry = new Ape.ParticleForceRegistry();
    },

    update: function (delta) {
        var me = this,
            i, j,
            p1, p2,
            contact;

        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle) {
            particle.integrate(delta);
        });


        // CONTACT RESOLUTION
        // Particle contact resolution
        for (i = 0; i < this.particles.length; i += 1) {
            for (j = i + 1; j < this.particles.length; j += 1) {
                var posI = this.particles[i].position,
                    posJ = this.particles[j].position,
                    sumOfRadius = this.particles[i].radius +
                        this.particles[j].radius;

                if (posI.distanceTo(posJ) <= sumOfRadius) {
                    contact = new Ape.ParticleContact({
                        particles: [this.particles[i], this.particles[j]],
                        restitution: 1,
                        contactNormal: posI.clone()
                            .sub(posJ).normalize(),
                        penetration: sumOfRadius - posI.distanceTo(posJ)
                    });
                    contact.resolve(delta);
                }
            }
        }

        // link contact resolution
        for (i = 0; i < this.links.length; i += 1) {
            contact = new Ape.ParticleContact();
            p1 = this.links[i].particles[0];
            p2 = this.links[i].particles[1];
            if (this.links[i].fillContact(contact)) {
                contact.resolve(delta);
            }

            // draw the cylinder
            this.drawCylinder(p1.position, p2.position, i);
        }
    },

    createDanglingObject: function (start, index) {
        var me = this,
            high = 100,
            low = 50,
            p1 = me.createParticle(),
            p2 = me.createParticle();

        // position the particles
        p1.position.set(start + index * 10, high, 0);
        p2.position.set(start + index * 10, low, 0);

        // the first object has infinite mass
        p1.acceleration.set(0, 0, 0);
        p1.setInverseMass(0);

        // link the particles with a rod
        this.links.push(new Ape.ParticleRod({
            particles: [p1, p2],
            maxLength: high - low
        }));

        // push the particles to the world's particles
        this.particles.push(p1, p2);
        return [p1, p2];
    },

    createParticle: function () {
        var particle = Ape.ParticleFactory(
            Ape.ParticleFactory.AFFECTED_BY_GRAVITY
        );
        particle.setMass(5);
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
                map: texture
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