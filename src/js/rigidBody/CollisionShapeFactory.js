/**
 * @singleton
 *
 * Factory of known rigid bodies that are collision-able i.e. that can collision
 * with other rigid bodies through a wrapper (see Ape.primitive.Primitive subclasses)
 *
 * <hr>
 *
 * Fabrica de cuerpos rigidos conocidos que son colisionables, en otras palabras
 * que tienen la habilidad de detectar si esta en contacto con otros cuerpos rigidos
 * a traves de una instancia englobante (vea Ape.primitive.Primitive y sus subclases)
 *
 * @class Ape.CollisionShapeFactory
 */
Ape.CollisionShapeFactory = {

	/**
	 * Creates a collision-able box by creating a RigidBody
	 * attached to an `Ape.primitive.Box`
     * 
     *      var box;
     *      // simple collisionable box with the default options
     *      box = Ape.CollisionShapeFactory.createBox();
     *      // simple collisionable box with a particular configuration of
     *      // the rigid body
     *      box = Ape.CollisionShapeFactory.createBox({
     *          width: 10,
     *          height: 15,
     *          depth: 20
     *      });
     *      
     * 
	 * @param {Object} [config] Config object delivered
     * to the method Ape.RigidBodyFactory.createBox to create the rigid body
	 * @returns {Ape.primitive.Box}
	 */
    createBox: function (config) {
        // fix config
        config = config || {};
		config.size = config.size || 5;
		config.width = config.width || config.size;
		config.height = config.height || config.size;
		config.depth = config.depth || config.size;

		// default options
		var body,
			box;

        // create a cube mesh
        body = Ape.RigidBodyFactory.createBox(config);
        Ape.debug && scene.add(body);

        // the mesh is represented with a box in the collision
        // detector
        box = new Ape.primitive.Box(
            body,                                                   // body
            new Ape.Matrix4(),                                      // offset (identity)
            new Ape.Vector3(
	            config.width / 2,
	            config.height / 2,
	            config.depth / 2
            )         // half size
        );
        box.calculateInternals();
        return box;
    },

	/**
	 * Creates a collision-able sphere by creating a RigidBody
	 * attached to an `Ape.primitive.Sphere`
     * 
     *      var sphere;
     *      // simple collisionable sphere with the default options
     *      sphere = Ape.CollisionShapeFactory.createSphere();
     *      // simple collisionable sphere with a particular configuration of
     *      // the rigid body
     *      sphere = Ape.CollisionShapeFactory.createSphere({
     *          radius: 10
     *      });
     *      
     * @param {Object} [config] Config object delivered
     * to the method Ape.RigidBodyFactory.createSphere to create the rigid body
     * @returns {Ape.primitive.Sphere}
	 */
    createSphere: function (config) {
        // fix config
        config = config || {};
        config.radius = config.radius || 5;

        var body, sphere;

        // create a cube mesh
        body = Ape.RigidBodyFactory.createSphere(config);
        Ape.debug && scene.add(body);

        // the mesh is represented with a sphere
        // in the collision detector
        sphere = new Ape.primitive.Sphere(
            body,                       // body
            new Ape.Matrix4(),          // offset (identity)
            config.radius               // radius
        );
        sphere.calculateInternals();
        return sphere;
    },

	/**
	 * Creates a collision-able plane by creating a RigidBody
	 * attached to an `Ape.primitive.Box`
	 * @param {Object} config
	 * @param {Object} config.direction Normal of the plane
	 * @param {Object} config.offset Movement from the origin
	 * @returns {Ape.primitive.Plane}
	 */
    createPlane: function (config) {
        config = config || {};

        var plane = new Ape.primitive.Plane();

        plane.direction = (config.direction || new Ape.Vector3(0, 1, 0))
            .normalize();
        plane.offset = config.offset || 0;

        // mesh
        if (Ape.debug) {
            var orientation = new THREE.Matrix4();
            var mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(400, 400, 10, 10),
                new THREE.MeshBasicMaterial({
                    color: 0x555555,
                    side: THREE.DoubleSide,
                    wireframe: true
                })
            );
            orientation.lookAt(
                new Ape.Vector3(),
                plane.direction,
                new Ape.Vector3(0, 1, 0)
            );
            mesh.applyMatrix(orientation);
            scene.add(mesh);
        }

        return plane;
    }
};