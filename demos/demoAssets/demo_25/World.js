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
        var factory = Ape.CollisionShapeFactory,
            i;

        this.objects = [];

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

        this.objects.push(this.planes[0], this.planes[1]);

        this.spheres = [];
        for (i = 0; i < 5; i += 1) {
            var sphere = this.createSphere();
            this.spheres.push(sphere);
            this.objects.push(sphere);
        }
    },

    update: function (delta) {
        var me = this;
        me._super(delta);
    },

    updateObjects: function(delta) {
        this.forceRegistry.update(delta);
        this.spheres.forEach(function (sphere) {
            sphere.body.integrate(delta);
            sphere.calculateInternals();
        });
    },

    generateContacts: function() {
        // Set up the collision data structure
        this.collisionData.reset(this.maxContacts);
        this.collisionData.friction = 0;
        this.collisionData.restitution = 0.2;
        this.collisionData.tolerance = 0.1;

        var i, j,
            total = this.objects.length;

        // collide the box with the planes
        for (i = 0; i < total; i += 1) {
            for (j = i + 1; j < total; j += 1) {
                Ape.CollisionDetector.prototype
                    .detect(this.objects[i], this.objects[j], this.collisionData);
            }
        }
    },

    createSphere: function () {
        var sphere = Ape.CollisionShapeFactory.createSphere();
        sphere.body.position.set(100, 100 + Math.random() * 200, 0);
        return sphere;
    }
});