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
        this.restLength = 20;

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
        gravityBody.angularDamping = 0.4;
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
                new THREE.Vector3(0,-2.5, 0),       // otherConnectionPoint
                20,                                 // spring constant
                this.restLength                     // rest length
            )
        );

        this.bodies = [staticBody, gravityBody];
    },

    update: function (delta) {
        var me = this;

        me._super(delta);

        this.forceRegistry.update(delta);
        this.bodies.forEach(function (body) {
            body.integrate(delta);
        });
    }

});