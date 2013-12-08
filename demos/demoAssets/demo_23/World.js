/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 2:59 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.World = T3.World.extend({
    init: function (config) {
        var me = this;
        this._super(config);

        // boat
        var loader = new THREE.JSONLoader();
        loader.load('demoAssets/demo_23/Sailboat.js', function (geometry) {
            var material = new THREE.MeshNormalMaterial({
                side: THREE.DoubleSide
            });
            var mesh = new Ape.RigidBody(geometry, material);
            var scale = 10;
            mesh.scale.set(scale, scale, scale);
            scene.add(mesh);

            me.sailboat = mesh;
            me.sailboat.acceleration = Ape.GRAVITY.clone();

            Ape.World.prototype.initWorld.call(me);
        });
        this.sailboat = Ape.RigidBodyFactory(
            Ape.RigidBodyFactory.SIMPLE,
            5
        );

        // force registry
        this.forceRegistry = new Ape.force.ForceRegistry();

        // buoyancy force
        this.buoyancy = new Ape.force.Buoyancy(
            new THREE.Vector3(0.001, 3, 0),         // center
            400,                                  // maxDepth
            1,                                  // volume
            6                                   // liquid height
        );

        // wind
        this.windSpeed = new THREE.Vector3(0, 0, 0);

        // tensors
        this.sail = new Ape.force.Aero(
            new Ape.Matrix3(
                -0.1, 0, 0,
                0, 0, 0,
                0, 0, -0.1
            ),        // base
            new THREE.Vector3(2, 0, 0),                               // position
            this.windSpeed
        );
    },

    initWorld: function () {
        this.resetSailBoat();
        this.sailboat.setMass(2.5);
        this.sailboat.setInertiaTensor(
            new Ape.Matrix3().setBlockInertialTensor(
                new THREE.Vector3(2, 1, 1),
                500 // this.sailboat.getMass()
            )
        );
        this.sailboat.setDamping(0.8, 0.8);
        this.sailboat.acceleration = Ape.GRAVITY.clone();

        // add forces to the plane
        this.forceRegistry.add(this.sailboat, this.sail);
        this.forceRegistry.add(this.sailboat, this.buoyancy);

        // init dat.gui for some objects
        this.inverse = false;
        this.initDatGui(T3.Application.datGUI);

        // cameras
        this.cameraControls.object.position.set(-50, 30, -50);
        this.cameraControls.target = new THREE.Vector3(0, 0, 0);
        this.cameraControls.maxPolarAngle = Math.PI;

        this.sailboat.add(this.cameraControls.object);
    },

    update: function (delta) {

        this.sailboat.clearAccumulators();

        // handle key presses
        this.handleKeys();

        // apply forces and update the sailboat physics
        this.forceRegistry.update(delta);
        this.sailboat.integrate(delta);

        this._super();
    },

    resetSailBoat: function () {
        this.sailboat.position.set(0, 0, 0);
        this.sailboat.orientation.set(1, 0, 0, 0);
        this.sailboat.linearVelocity.set(0, 0, 0);
        this.sailboat.angularVelocity.set(0, 0, 0);
    },

    initDatGui: function (gui) {
        var folder = gui.addFolder('Wind'),
            k = 1000;
        folder
            .add(this.windSpeed, 'x', -k, k)
            .name('Wind speed x');
        folder
            .add(this.windSpeed, 'y', -k, k)
            .name('Wind speed y');
        folder
            .add(this.windSpeed, 'z', -k, k)
            .name('Wind speed z');
    },

    handleKeys: function () {
        if (T3.Keyboard.get('R')) {
            this.resetSailBoat();
        }
    }
});