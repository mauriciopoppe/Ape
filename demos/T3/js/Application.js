/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/7/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */

/* GLOBALS:
 * THREE
 * Coordinates
 * THREEx.FullScreen
 * T3.ObjectManager
 */
T3.Application = {
    /**
     * Clock helper (its delta method is used to update the camera)
     */
    clock: new THREE.Clock(),
    /**
     * Toggle to pause the animation
     */
    pause: false,
    /**
     * THREE.WebGL Renderer
     */
    renderer: null,
    /**
     * Instance of T3.controller.World
     */
    controller: null,
    /**
     * Stats instance
     */
    stats: null,
    /**
     * dat.GUI instance
     */
    datGUI: new dat.GUI(),
    /**
     * Desired frame duration (in s)
     */
    fps: 60,
	/**
     * Crates the WebGL Renderer and binds the fullscreen key 'f'
     * @chainable
     */
    createRender: function () {
        var me = this;

        // init the renderer
        if( !Detector.webgl ) {
            Detector.addGetWebGLMessage();
        }
        me.renderer = new THREE.WebGLRenderer({
//            antialias: true
        });
        me.renderer.setClearColor( 0xAAAAAA, 1 );
        me.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('webgl-container').appendChild(me.renderer.domElement);

        // allow 'f' to go fullscreen where this feature is supported
        if( THREEx.FullScreen.available() ){
            THREEx.FullScreen.bindKey();
        }

        return this;
    },

    /**
     * Creates the basic scene adding some fog and lights
     * @chainable
     */
    createScene: function () {
        // instantiate the scene (global)
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );
        return this;
    },

    /**
     * Creates the lights used in the scene
     * @chainable
     */
    createSceneLights: function () {
        var light;
            // http://planetpixelemporium.com/tutorialpages/light.html
//            color = 0xffd6aa,       // 100W Tungsten like color
//            color = 0xfff1e0;

        light = new THREE.AmbientLight(0x222222);
        T3.ObjectManager.add('ambient-light-1', light);

        light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light.position.set( 200, 400, 500 );
        T3.ObjectManager.add('directional-light-1', light);

        light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light.position.set( -500, 250, -200 );
        T3.ObjectManager.add('directional-light-2', light);

        return this;
    },

    /**
     * Initializes the world controller and the keyboard controller
     * @chainable
     */
    initControllers: function (className, worldOptions) {
        var me = this;
        className = className || T3.World;
        worldOptions = worldOptions || {};

	    // gui controller for the app
	    me.initDatGui(this.datGUI);

	    // World
        me.world = new className($.extend({
            renderer: me.renderer
        }, worldOptions));

        T3.Keyboard.init();

        return this;
    },

    /**
     * Initializes the Stat helper
     * @chainable
     */
    initHelpers: function () {
        var me = this;
        // add Stats.js - https://github.com/mrdoob/stats.js
        me.stats = new Stats();
        me.stats.domElement.style.position	= 'absolute';
        me.stats.domElement.style.bottom	= '0px';
        document.body.appendChild( me.stats.domElement );
        return this;
    },

    bindPauseKey: function () {
        var me = this;
        document.addEventListener('keydown', function (event) {
            if (event.keyCode === 80) {
                me.pause = !me.pause;
            }
        }, false);
    },

	initDatGui: function (gui) {
		var folder = gui.addFolder('Application');
		folder
			.add(this, 'fps', 10, 60, 1)
			.name('Frame rate');
	},

    /**
     * Animation loop (calls Application.render)
     */
    animate: function () {
	    var me = this,
		    elapsedTime = 0,
		    loop;

	    loop = function () {
		    var delta = me.clock.getDelta(),
			    frameRateInS = 1 / me.fps;

		    // constraint delta to be <= frameRate
            // (to avoid frames with a big delta caused because of the app sent to sleep)
		    delta = Math.min(delta, frameRateInS);
		    elapsedTime += delta;

		    if (!me.pause &&
			        elapsedTime >= frameRateInS) {

			    // update Stats helper
			    me.stats.update();

			    // update the world and render its objects
			    me.world.update(delta);
			    me.world.render();

			    elapsedTime -= frameRateInS;
		    }

		    // loop on request animation loop
		    // - it has to be at the beginning of the function
		    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
		    requestAnimationFrame(loop);
	    };

	    loop();
    },

	setUp: function (fn) {
		// calls fn with `this` as its scope
		fn.call(this);
	},

    /************** LAUNCHER *************/
    launch: function (className, worldOptions) {

        // init the world
        this.createRender()
            .createScene()
            .createSceneLights()
            .bindPauseKey();

        this.initHelpers();

        this.datGUI.close();

        // inits the world controller
        this.initControllers(className, worldOptions);

        // game loop
        this.animate();
    }
};