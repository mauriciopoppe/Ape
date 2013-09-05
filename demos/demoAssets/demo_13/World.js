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
            separation = 1,
            i, j,
            particle;

        this.radius = 0.5;
        this.particles = [];
        this.rows = 10;
        this.cols = 10;
        this.springConstant = 800;

        // wind
        this.wind = new THREE.Vector3();

        // generate static particles
        for(j = 0; j < this.cols; j += 1) {
            particle = Ape.ParticleFactory(
                Ape.ParticleFactory.SIMPLE, this.radius
            );
            particle.position.set(200 + j * separation, 100, 0);
            particle.setInverseMass(0);
            scene.add(particle);
            this.particles.push(particle);
        }

        // generate movable particles (affected by gravity)
        for(i = 1; i < this.rows; i += 1) {
            for(j = 0; j < this.cols; j += 1) {
                particle = Ape.ParticleFactory(
                    Ape.ParticleFactory.AFFECTED_BY_GRAVITY, this.radius
                );
                particle.position.set(200 + j * separation, 100, i * separation);
                particle.setMass(8);
                scene.add(particle);
                this.particles.push(particle);
            }
        }

        // additional forces
        this.particleRegistry = new Ape.ParticleForceRegistry();

        // springs
        for (i = 0; i < this.rows; i += 1) {
            for (j = 0; j < this.cols; j += 1) {
                // F - p
                // | x |
                // p - p

                // distance = 1
                if (j + 1 < this.cols) {
                    this.addSpring(this.getParticle(i, j), this.getParticle(i, j + 1));
                }
                if (i + 1 < this.rows) {
                    this.addSpring(this.getParticle(i, j), this.getParticle(i + 1, j));
                }
                // distance = sqrt(2)
                if (j + 1 < this.cols && i + 1 < this.rows) {
                    // top left -> bottom right
                    this.addSpring(this.getParticle(i, j), this.getParticle(i + 1, j + 1));
                }
                if (j + 1 < this.cols && i + 1 < this.rows) {
                    // top right -> bottom left
                    this.addSpring(this.getParticle(i, j + 1), this.getParticle(i + 1, j));
                }

                // distance = 2
                if (j + 2 < this.cols) {
                    this.addSpring(this.getParticle(i, j), this.getParticle(i, j + 2));
                }
                if (i + 2 < this.rows) {
                    this.addSpring(this.getParticle(i, j), this.getParticle(i + 2, j));
                }
                // distance = sqrt(4)
                if (j + 2 < this.cols && i + 2 < this.rows) {
                    // top left -> bottom right
                    this.addSpring(this.getParticle(i, j), this.getParticle(i + 2, j + 2));
                }
                if (j + 2 < this.cols && i + 2 < this.rows) {
                    // top right -> bottom left
                    this.addSpring(this.getParticle(i, j + 2), this.getParticle(i + 2, j));
                }

            }
        }


//        this.particleRegistry.add(
//            gravityParticle,
//            new Ape.ParticleSpring(staticParticle, 20, this.restLength)
//        );

        // spring
//        var material = new THREE.MeshLambertMaterial({color:0x0000ff});
//        var cylinder = new THREE.CylinderGeometry(10, 10, 1, 10, 10, false);
//        me.spring = new THREE.Mesh(cylinder,material);
//        scene.add(me.spring);

        this.initDatGui(T3.Application.datGUI);
    },

    update: function (delta) {
        var me = this,
            apply = Math.random() < 0.5;
        this._super(delta);

        this.particleRegistry.update(delta);

        this.particles.forEach(function (particle, index) {
            // apply wind at random times
            apply &&  //index / me.rows * me.cols * 0.3 &&
                particle.addForce(me.wind);
            particle.integrate(delta);
        });
    },

    addSpring: function (p1, p2) {
        var distance = p1.position.distanceTo(p2.position);
        this.particleRegistry.add(
            p1,
            new Ape.ParticleSpring(p2, this.springConstant, distance)
        );
        this.particleRegistry.add(
            p2,
            new Ape.ParticleSpring(p1, this.springConstant, distance)
        );
    },

    getParticle: function (i, j) {
        if (i * this.cols + j >= this.rows * this.cols) {
            throw new Error('not a particle!');
        }
        return this.particles[i * this.cols + j];
    },

    initDatGui: function (gui) {
        var folder = gui.addFolder('Wind'),
            limit = 1000;
        folder
            .add(this.wind, 'x', -limit, limit)
            .name('Wind x');
        folder
            .add(this.wind, 'y', -limit, limit)
            .name('Wind y');
        folder
            .add(this.wind, 'z', -limit, limit)
            .name('Wind z');
    }
});