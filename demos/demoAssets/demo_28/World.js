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
            box,
            i;

//        var it = 50, maxContacts = 256;
//        this.resolver.velocityIterations = maxContacts * it;
//        this.resolver.positionIterations = maxContacts * it;

        this.objects = [];
        this.boxes = [];
        // generate planes
        this.planes = [
            factory.createPlane({
                direction: new THREE.Vector3(0, 1, 0)
            })
        ];
        for (i = 0; i < this.planes.length; i += 1) {
            this.objects.push(this.planes[i]);
        }

        for (i = 0; i < 50; i += 1) {
            box = this.createBox(10);
            this.boxes.push(box);
            this.objects.push(box);
        }

//        box = this.createBox(10);
//        box.body.position.set(0, 50, 0);
//        this.boxes.push(box);
//        this.objects.push(box);
//
//        box = this.createBox(10);
//        box.body.position.set(0, 100, 0);
//        box.body.rotation.set(0, 0, 0);
//        this.boxes.push(box);
//        this.objects.push(box);

        // fix camera
        this.cameraControls.target.set(0, 0, 0);
        this.cameraControls.object// THREE.Camera
            .position.set(210, 70, 210);
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
        this.collisionData.friction = 0.9;
        this.collisionData.restitution = 0.1;
        this.collisionData.tolerance = 0.1;

        var i, j,
            total = this.objects.length;

        // collide the box with the planes
        for (i = 0; i < total; i += 1) {
            for (j = i + 1; j < total; j += 1) {
                Ape.collision.CollisionDetector.prototype
                    .detect(this.objects[i], this.objects[j], this.collisionData);
            }
        }
    },

    createBox: function (size) {
        var box = Ape.CollisionShapeFactory.createBox({
                size: size
            });
        box.body.position.set(
            Math.random() * 50,
            100 + Math.random() * 100,
            Math.random() * 50
        );
        return box;
    }
});