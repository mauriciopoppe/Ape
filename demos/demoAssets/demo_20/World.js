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
        var i;

        this.size = 5;
        this.bodies = [];
        this.links = [];

        for (i = 0; i < 1; i += 1) {
            var body = this.createRigidBody(this.size);
            body.position.set(200, 100, 0);
            this.bodies.push(body);
        }

        // force registry
        this.forceRegistry = new Ape.ForceRegistry();

        // init dat.gui for some objects
        this.inverse = false;
        this.initDatGui(T3.Application.datGUI);
    },

    update: function (delta) {
        var me = this,
            body = this.bodies[0],
            keys = "QWEASDZXC",
            half = this.size,
            forces = [
                new THREE.Vector3(-half, half, 0),
                new THREE.Vector3(0, half, 0),
                new THREE.Vector3(half, half, 0),
                new THREE.Vector3(-half, 0, 0),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(half, 0, 0),
                new THREE.Vector3(-half, -half, 0),
                new THREE.Vector3(0, -half, 0),
                new THREE.Vector3(half, -half, 0)
            ];

        this._super(delta);

        keys.split('').forEach(function (key, index) {
            if (T3.Keyboard.get(key)) {
                body.addForceAtPoint(
                    new THREE.Vector3(0, 0, me.inverse ? 1 : -1),
                    body.position.clone().add(forces[index])
                );
            }
        });

        this.forceRegistry.update(delta);
        this.bodies.forEach(function (body) {
            body.integrate(delta);
        });
    },

    createRigidBody: function (size) {
        var rigidBody = Ape.RigidBodyFactory.createBox({
            size: size,
            type: 'simple'
        });
        scene.add(rigidBody);
        return rigidBody;
    },

    initDatGui: function (gui) {
        var folder = gui.addFolder('Mesh');
        folder
            .add(this, 'inverse', false)
            .name('Inverse movements');
    }
});