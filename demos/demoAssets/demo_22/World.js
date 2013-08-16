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

        // aircraft
        var loader = new THREE.JSONLoader();
        loader.load('demoAssets/demo_22/f22.js', function (geometry) {
            var material = new THREE.MeshNormalMaterial();
            var mesh = new Ape.RigidBody(geometry, material);
            scene.add(mesh);

            me.aircraft = mesh;
            me.aircraft.acceleration.set(0, -10, 0);

            Ape.World.prototype.initWorld.call(me);
        });
        this.aircraft = Ape.RigidBodyFactory(
            Ape.RigidBodyFactory.SIMPLE,
            5
        );

        // force registry
        this.forceRegistry = new Ape.ForceRegistry();

        // wind
        this.windSpeed = new THREE.Vector3(0, 0, 0);

        // tensors
        this.rightWing = new Ape.AeroControl(
            new Ape.Matrix3(0, 0, 0, -1.000, -0.5, 0, 0, 0, 0),      // base
            new Ape.Matrix3(0, 0, 0, -0.995, -0.5, 0, 0, 0, 0),      // min
            new Ape.Matrix3(0, 0, 0, -1.005, -0.5, 0, 0, 0, 0),      // max
            new THREE.Vector3(-1, 0, 2),                             // position
            this.windSpeed                                           // windSpeed
        );
        this.leftWing = new Ape.AeroControl(
            new Ape.Matrix3(0, 0, 0, -1.000, -0.5, 0, 0, 0, 0),      // base
            new Ape.Matrix3(0, 0, 0, -0.995, -0.5, 0, 0, 0, 0),      // min
            new Ape.Matrix3(0, 0, 0, -1.005, -0.5, 0, 0, 0, 0),      // max
            new THREE.Vector3(-1, 0, -2),                            // position
            this.windSpeed                                           // windSpeed
        );
        this.rudder = new Ape.AeroControl(
            new Ape.Matrix3(0, 0, 0, 0, 0, 0,     0, 0, 0),          // base
            new Ape.Matrix3(0, 0, 0, 0, 0, 0,  0.01, 0, 0),          // min
            new Ape.Matrix3(0, 0, 0, 0, 0, 0, -0.01, 0, 0),          // max
            new THREE.Vector3(2, 0.5, 0),                            // position
            this.windSpeed                                           // windSpeed
        );
        this.tail = new Ape.Aero(
            new Ape.Matrix3(
                0, 0, 0,
                -1, -0.5, 0,
                0, 0, -0.1
            ),        // base
            new THREE.Vector3(2, 0, 0),                               // position
            this.windSpeed                                            // windSpeed
        );

        // controls for the tensors
        this.rightWingControl = 0;
        this.leftWingControl = 0;
        this.rudderControl = 0;

    },

    initWorld: function () {
        this.resetPlane();
        this.aircraft.setMass(2.5);
        this.aircraft.setInertiaTensor(
            new Ape.Matrix3().setBlockInertialTensor(
                new THREE.Vector3(2, 1, 1),
                1 // this.aircraft.getMass()
            )
        );
        this.aircraft.setDamping(0.8, 0.8);
        this.aircraft.acceleration = Ape.GRAVITY.clone();

        // add forces to the plane
        this.forceRegistry.add(this.aircraft, this.leftWing);
        this.forceRegistry.add(this.aircraft, this.rightWing);
        this.forceRegistry.add(this.aircraft, this.rudder);
        this.forceRegistry.add(this.aircraft, this.tail);

        // init dat.gui for some objects
        this.inverse = false;
        this.initDatGui(T3.Application.datGUI);

        // cameras
        this.cameraControls.object.position.set(15, 0, 0);
        this.cameraControls.target = this.aircraft.position.clone();
        this.cameraControls.maxPolarAngle = Math.PI;

        this.aircraft.add(this.cameraControls.object);
    },

    update: function (delta) {

        this.aircraft.clearAccumulators();

        // add the propeller force
        var propulsion = new THREE.Vector3(-10, 0, 0);
        this.aircraft.addForce(
            this.aircraft.transformMatrix.transformDirection(propulsion)
        );

        // handle key presses
        this.handleKeys();

        // apply forces and update the aircraft physics
        this.forceRegistry.update(delta);
        this.aircraft.integrate(delta);

        if (this.aircraft.position.y < 0) {
            this.aircraft.position.y = 0;
            if (this.aircraft.linearVelocity.y < -10) {
                this.resetPlane();
            }
        }

        this._super();

        // only apply the controls in this frame and not in the next
        this.rightWingControl = 0;
        this.leftWingControl = 0;
        this.rudderControl = 0;

    },

    resetPlane: function () {
        this.aircraft.position.set(0, 0, 0);
        this.aircraft.orientation.set(1, 0, 0, 0);
        this.aircraft.linearVelocity.set(0, 0, 0);
        this.aircraft.angularVelocity.set(0, 0, 0);

        this.leftWingControl = 0;
        this.rightWingControl = 0;
        this.rudderControl = 0;
    },

    initDatGui: function (gui) {
        var folder = gui.addFolder('Mesh');
        folder
            .add(this, 'inverse', false)
            .name('Inverse movements');
    },

    handleKeys: function () {
        // yaw
        if (T3.Keyboard.get('Q')) {
            this.rudderControl += 0.1;
        }
        if (T3.Keyboard.get('E')) {
            this.rudderControl -= 0.1;
        }

        // pitch (both wings in the same direction)
        if (T3.Keyboard.get('W')) {
            this.leftWingControl -= 0.1;
            this.rightWingControl -= 0.1;
        }
        if (T3.Keyboard.get('S')) {
            this.leftWingControl += 0.1;
            this.rightWingControl += 0.1;
        }

        // roll (both wings in opposite directions)
        if (T3.Keyboard.get('D')) {
            this.leftWingControl -= 0.1;
            this.rightWingControl += 0.1;
        }
        if (T3.Keyboard.get('A')) {
            this.leftWingControl += 0.1;
            this.rightWingControl -= 0.1;
        }

        // natural position
        if (T3.Keyboard.get('X')) {
            this.leftWingControl = 0;
            this.rightWingControl = 0;
            this.rudderControl = 0;
        }

        if (T3.Keyboard.get('R')) {
            this.resetPlane();
        }
        
        // make sure the controls are in range
        if (this.rudderControl > 1) {
            this.rudderControl = 1;
        }  
        if (this.rudderControl < -1) {
            this.rudderControl = -1;
        }
        if (this.leftWingControl > 1) {
            this.leftWingControl = 1;
        }
        if (this.leftWingControl < -1) {
            this.leftWingControl = -1;
        }
        if (this.rightWingControl > 1) {
            this.rightWingControl = 1;
        }
        if (this.rightWingControl < -1) {
            this.rightWingControl = -1;
        }

        // update the control surfaces
        this.rightWing.setControl(this.rightWingControl);
        this.leftWing.setControl(this.leftWingControl);
        this.rudder.setControl(this.rudderControl);
    }
});