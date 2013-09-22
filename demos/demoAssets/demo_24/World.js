/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 2:59 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.World = Ape.RigidBodyWorld.extend({
    init: function (config) {
        // inherits:
        // this.maxContacts
        // this.resolver
        // this.contacts
        // this.forceRegistry
        this._super(config);

        Ape.World.prototype.initWorld.call(this);
    },

    initWorld: function () {
        var factory = Ape.CollisionShapeFactory;
        this.planes = [
            factory.createPlane({
                direction: new THREE.Vector3(0, 1, 0),
                createMesh: true
            }),
            factory.createPlane({
                direction: new THREE.Vector3(-0.2, 1, -0.5),
                createMesh: true
            })
        ];

        this.boxes = [
            (function () {
                var box = factory.createBox();
                box.body.position.set(Math.random() * 200, 100, 0);
                return box;
            })()
        ];
    },

    update: function (delta) {
        var me = this;
        me._super(delta);
    },

    updateObjects: function(delta) {
        this.forceRegistry.update(delta);
        this.boxes.forEach(function (box) {
            box.body.integrate(delta);
            box.calculateInternals();
        });
    },

    generateContacts: function() {
        // Set up the collision data structure
        this.collisionData.reset(this.maxContacts);
        this.collisionData.friction = 0;
        this.collisionData.restitution = 0.1;
        this.collisionData.tolerance = 0.1;

        var i, len = this.planes.length;
        for (i = 0; i < len; i += 1) {
            // collide the box with the planes
            Ape.CollisionDetector.prototype
                .detect(this.boxes[0], this.planes[i], this.collisionData);
        }
    }
});