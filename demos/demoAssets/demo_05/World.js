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
        this.restLength = 25;

        var staticParticle = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
        staticParticle.position.set(200, 100, 0);
        staticParticle.setMass(1);       // ∞ mass
        scene.add(staticParticle);

        var gravityParticle = Ape.ParticleFactory(
            Ape.ParticleFactory.SIMPLE
        );
//        gravityParticle.setDamping(0.5);
        gravityParticle.position.set(250, 100, 0);
        gravityParticle.setMass(1);
        scene.add(gravityParticle);

        // additional forces
        this.particleRegistry = new Ape.ParticleForceRegistry();

        // adding gravity to the movable particle
        this.particleRegistry.add(
            gravityParticle,
            new Ape.ParticleGravity(Ape.GRAVITY)
        );

        // adding a spring between those particles
        this.particleRegistry.add(
            gravityParticle,
            new Ape.ParticleSpring(staticParticle, 20, this.restLength)
        );

        // uncomment to add the force to the other particle too
//        this.particleRegistry.add(
//            staticParticle,
//            new Ape.ParticleSpring(gravityParticle, 20, 25)
//        );
//        this.particleRegistry.add(
//            staticParticle,
//            new Ape.ParticleGravity(Ape.GRAVITY)
//        );

        // spring
//        var loader = new THREE.JSONLoader();
//        loader.load('demoAssets/demo_05/spring.js', function (geometry) {
//            var material = new THREE.MeshNormalMaterial();
//            var mesh = new THREE.Mesh(geometry, material);
//            scene.add(mesh);
//            me.spring = mesh;
//        });

        var material = new THREE.MeshLambertMaterial({color:0x0000ff});
        var cylinder = new THREE.CylinderGeometry(10, 10, 1, 10, 10, false);
        me.spring = new THREE.Mesh(cylinder,material);
        scene.add(me.spring);

        this.particles = [staticParticle, gravityParticle];
    },

    update: function (delta) {
        var me = this;
        this._super(delta);

        this.particleRegistry.update(delta);
        this.particles.forEach(function (particle) {
            particle.integrate(delta);
        });

        var spring = this.spring;
        if (spring) {
            var vs = this.particles[0].position;
            var ve = this.particles[1].position;

            function drawCylinder(vstart, vend){
                var distance = vstart.distanceTo(vend);
                var position  = vend.clone().add(vstart).divideScalar(2);

                var material = new THREE.MeshBasicMaterial({
                    color: me.interpolate(
                        new THREE.Color(0xAAAAAA),
                        new THREE.Color(0xFF0000),
                        Math.abs(me.restLength - distance),
                        me.restLength
                    )
                });
                var cylinder = new THREE.CylinderGeometry(1, 1, distance, 10, 10, false);

                var orientation = new THREE.Matrix4();
                var offsetRotation = new THREE.Matrix4();
                orientation.lookAt(vstart, vend, new THREE.Vector3(0, 1, 0));
                offsetRotation.makeRotationX(Math.PI * 0.5);
                orientation.multiply(offsetRotation);
                cylinder.applyMatrix(orientation);

                me.mesh && scene.remove(me.mesh);
                me.mesh = new THREE.Mesh(cylinder,material);
                me.mesh.position = position;
                scene.add(me.mesh);
            }

            drawCylinder(vs, ve);
        }
    },

    interpolate: function (A, B, distance, total) {
        // function to interpolate
        // (y - A) / distance = (B - A) / total
        // y = (B - A) * distance / total + A
        var properties = ['r', 'g', 'b'],
            newColor = new THREE.Color('rgb(0, 0, 0)'),
            i;
        for (i = 0; i < properties.length; i += 1) {
            var current = properties[i];
            newColor[current] = (B[current] - A[current]) * distance / total + A[current];
            Ape.assert(newColor[current] < 1 && newColor[current] >= 0);
        }
        return newColor;
    }
});