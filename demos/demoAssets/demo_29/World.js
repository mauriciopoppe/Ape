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

        this.objects = [];

        // create the floor
        this.objects.push(
            factory.createPlane({
                direction: new THREE.Vector3(0, 1, 0)
            })
        );

        this.cameraControls.object.position.set(-272, 140, 140);
        this.cameraControls.target = new Ape.Vector3();
        this.cameraControls.maxPolarAngle = Math.PI;

        // create the sides
        this.createSides();
        this.createBalls();
    },

    update: function (delta) {
        var me = this;
        me._super(delta);
    },

    updateObjects: function(delta) {
        this.handleKeys();

        this.forceRegistry.update(delta);
        this.objects.forEach(function (box) {
            if (box.body) {
                box.body.integrate(delta);
                box.calculateInternals();
            }
        });
    },

    generateContacts: function() {
        // Set up the collision data structure
        this.collisionData.reset(this.maxContacts);
        this.collisionData.friction = 0;
        this.collisionData.restitution = 0.7;
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

    createSides: function () {
        var box,
            i,
            d = 100,
            y = 3,
            displacement = 10,
            leftRight = {
                width: 5,
                height: 5,
                depth: d
            },
            topBottom = {
                width: d * 2,
                height: 5,
                depth: 5
            },
            boxConfig = [leftRight, leftRight, topBottom, topBottom],
            positions = [
                {x: -d - displacement, y: y, z: 0},
                {x: d + displacement, y: y, z: 0},
                {x: 0, y: y, z: -d / 2 - 2 * displacement},
                {x: 0, y: y, z: d / 2 + 2 * displacement}
            ];


        for (i = 0; i < 4; i += 1) {
            var p = positions[i],
                config = boxConfig[i];

            var geometry = new THREE.CubeGeometry(
                config.width, config.height, config.depth
            );
            var material = new THREE.MeshNormalMaterial();
            var body = new Ape.RigidBody(geometry, material);
            body.acceleration.set(0, 0, 0);
            body.position.set(p.x, p.y, p.z);
            body.setMass(1e17);
            body.setInertiaTensor(
                new Ape.Matrix3().setBlockInertialTensor(
                    new Ape.Vector3(
                        config.width * 0.5, config.height * 0.5, config.depth * 0.5
                    ),
                    body.getMass()
                )
            );
            scene.add(body);

            // the mesh is represented with a box in the collision
            // detector
            box = new Ape.primitive.Box(
                body,                   // body
                new Ape.Matrix4(),      // offset (identity)
                new Ape.Vector3(
                    config.width / 2,
                    config.height / 2,
                    config.depth / 2
                )
            );
            box.calculateInternals();

            this.objects.push(box);
        }
    },

    createBalls: function () {
        var me = this,
            i, j,
            sphere,
            radius = 4,
            zD = radius,
            xD = radius,
            balls = [5, 4, 3, 2, 1];

        // sum(balls)
        var s = new Ape.Vector3(70, 0, -radius * balls[0] * 0.5 + radius / 2),
            sc = s.clone();
        for (i = 0; i < balls.length; i += 1) {
            s = sc.clone();
            s.x -= i * xD * 0.7;
            s.z += zD / 2 * i;
            for (j = 0; j < balls[i]; j += 1) {
                sphere = Ape.CollisionShapeFactory.createSphere({
                    radius: radius
                });
                sphere.body.position = s.clone();
                this.objects.push(sphere);
                s.z += zD;
            }
        }

        // white ball :D
        var geometry = new THREE.SphereGeometry(radius, 32, 32);
        var material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        // rigid body
        var body = new Ape.RigidBody(geometry, material);
        body.setInertiaTensor(
            new Ape.Matrix3().setSphereInertialTensor(
                radius,
                body.getMass()
            )
        );
        body.acceleration = Ape.GRAVITY.clone();
        body.position.set(-60, 0, 0);
        scene.add(body);

        // collisionable object
        sphere = new Ape.primitive.Sphere(
            body, new Ape.Matrix4(), radius
        );
        sphere.calculateInternals();
        this.objects.push(sphere);

//        this.cameraControls.object.position.set(15, 15, 0);
//        this.cameraControls.target = sphere.body.position.clone();
//        this.cameraControls.maxPolarAngle = Math.PI;
//        sphere.body.add(this.cameraControls.object);

        // 'global' access to the white ball
        this.whiteBall = sphere;
    },

    handleKeys: function () {
        var m = 50,
            body = this.whiteBall.body;
        if (T3.Keyboard.get('W')) {
            body.addForceAtBodyPoint(
                new Ape.Vector3(m, 0, 0),
                new Ape.Vector3()
            );
        }
        if (T3.Keyboard.get('S')) {
            body.addForceAtBodyPoint(
                new Ape.Vector3(-m, 0, 0),
                new Ape.Vector3()
            );
        }
        if (T3.Keyboard.get('A')) {
            body.addForceAtBodyPoint(
                new Ape.Vector3(0, 0, -m),
                new Ape.Vector3()
            );
        }
        if (T3.Keyboard.get('D')) {
            body.addForceAtBodyPoint(
                new Ape.Vector3(0, 0, m),
                new Ape.Vector3()
            );
        }
    }
});