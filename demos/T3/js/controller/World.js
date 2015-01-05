/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 1:51 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var World = Class.extend({
        init: function (config) {
            /**
             * The world can have many cameras, so the this is a reference to
             * the active camera that's being used right now
             * @type {T3.model.Camera}
             */
            this.activeCamera = null;

            /**
             * THREE Renderer
             * @type {Object}
             */
            this.renderer = config.renderer;

            /**
             * The number of calls to the update method % 1000000007
             * @type {number}
             */
            this.ticks = 0;

            World.prototype.initWorld.call(this, config);
        },

        initWorld: function (config) {
            var me = this;

            // cameras used for the world
            me.initCameras();
            // coordinates helper
            me.initCoordinates(config.coordinates);
        },

        /**
         * Initializes the cameras used in the world
         */
        initCameras: function () {
            var defaults = {
                fov: 38,
                ratio: window.innerWidth / window.innerHeight,
                near: 1,
                far: 10000
            }, camera;

            camera = new THREE.PerspectiveCamera(
                defaults.fov,
                defaults.ratio,
                defaults.near,
                defaults.far
            );
            camera.position = new THREE.Vector3(200, 100, 600);
            this.activeCamera = camera;

            // transparently support window resize
            THREEx.WindowResize.bind(this.renderer, camera);

            this.cameraControls = new THREE.OrbitAndPanControls(camera, this.renderer.domElement);
            // avoid panning to see the bottom face
            this.cameraControls.maxPolarAngle = Math.PI / 2 * 0.99;
            this.cameraControls.target.set(200, 100, 0);
            return this;
        },


        /**
         * Initializes the coordinate helper (its wrapped in a model in T3)
         */
        initCoordinates: function (options) {
            this.coordinatesHelper = new T3.model.Coordinates($.extend({
                ground: true,
                gridX: true,
                gridZ: true,
                axes: true
            }, options));
        },

        /**
         * The world is responsible of updating its children
         * @param delta
         */
        update: function (delta) {
            this.ticks = (this.ticks + 1) % 1000000007;

            // camera update
            this.cameraControls.update(delta);
        },

        render: function () {
            this.renderer.render(scene, this.activeCamera);
        }
    });

    T3.World = T3.controller.World = World;

})();