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
        this.bodies = [];
        this.restLength = 15;

        // static body
        var staticBody = Ape.RigidBodyFactory(
            Ape.RigidBodyFactory.SIMPLE
        );
        staticBody.setInverseMass(0);
        staticBody.position.set(200, 100, 0);
        scene.add(staticBody);

        // body with gravity
        var gravityBody = Ape.RigidBodyFactory(
            Ape.RigidBodyFactory.SIMPLE
        );
        gravityBody.setMass(10);
        gravityBody.angularDamping = 0.5;
        gravityBody.position.set(210, 100, 10);
        scene.add(gravityBody);

        // additional forces
        this.forceRegistry = new Ape.ForceRegistry();

        // adding gravity to the one body
        this.forceRegistry.add(
            gravityBody,
            new Ape.Gravity(Ape.GRAVITY)
        );

        // adding a spring between the bodies
        this.forceRegistry.add(
            gravityBody,
            new Ape.Spring(
                new THREE.Vector3(-2.5, 0, 0),      // localConnectionPoint
                staticBody,                         // other
                new THREE.Vector3(0, -2.5, 0),      // otherConnectionPoint
                20,                                 // spring constant
                this.restLength                     // rest length
            )
        );

        this.bodies = [staticBody, gravityBody];
    },

    update: function (delta) {
        var me = this,
            staticBody = this.bodies[0],
            gravityBody = this.bodies[1];

        me._super(delta);

        this.forceRegistry.update(delta);
        this.bodies.forEach(function (body) {
            body.integrate(delta);
        });

        // draw a cylinder between the contact points
        this.drawCylinder(
            gravityBody.getPointInWorldSpace(
                new THREE.Vector3(-2.5, 0, 0)
            ),
            staticBody.getPointInWorldSpace(
                new THREE.Vector3(0, -2.5, 0)
            ),
            0
        );
    },

    drawCylinder: function (vstart, vend, index) {
        var me = this,
            orientation,
            position,
            offsetRotation,
            distance,
            geometry,
            mesh;

        me.mesh = me.mesh || [];
        mesh = me.mesh[index];
        position = vend.clone().add(vstart).divideScalar(2);
        distance = vstart.distanceTo(vend);

        if (!mesh) {
            geometry = new THREE.CylinderGeometry(0.5, 0.5, distance, 8, 1, false);
            me.mesh[index] = mesh = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({
                    wireframe: true,
                    color: 0xaaaaff
                })
            );
            mesh.wireframe = true;
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