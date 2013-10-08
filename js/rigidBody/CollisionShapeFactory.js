/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/30/13
 * Time: 4:48 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.CollisionShapeFactory = {

	/**
	 * Creates a collision-able box by creating a RigidBody
	 * attached to an `Ape.Box`
	 * @param {Object} config
	 * @param {number} config.size Size of each side of the box
	 * @param {number} config.size Box's width (if width is not provided
	 * `size` is used instead)
	 * @param {number} config.size Box's height (if height is not provided
	 * `size` is used instead)
	 * @param {number} config.size Box's depth (if depth is not provided
	 * `size` is used instead)
	 * @returns {Ape.Box}
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
        scene.add(body);

        // the mesh is represented with a box in the collision
        // detector
        box = new Ape.Box(
            body,                                                   // body
            new Ape.Matrix4(),                                      // offset (identity)
            new THREE.Vector3(
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
	 * attached to an `Ape.Sphere`
	 * @param {Object} config
	 * @param {number} config.radius Radius of the sphere
	 * @returns {Ape.Sphere}
	 */
    createSphere: function (config) {
        // fix config
        config = config || {};
        config.radius = config.radius || 5;

        var body, sphere;

        // create a cube mesh
        body = Ape.RigidBodyFactory.createSphere(config);
        scene.add(body);

        // the mesh is represented with a sphere
        // in the collision detector
        sphere = new Ape.Sphere(
            body,                       // body
            new Ape.Matrix4(),          // offset (identity)
            config.radius               // radius
        );
        sphere.calculateInternals();
        return sphere;
    },

	/**
	 * Creates a collision-able plane by creating a RigidBody
	 * attached to an `Ape.Box`
	 * @param {Object} config
	 * @param {Object} config.direction Normal of the plane
	 * @param {Object} config.offset Movement from the origin
	 * @returns {Ape.Plane}
	 */
    createPlane: function (config) {
        config = config || {};

        var plane = new Ape.Plane();

        plane.direction = (config.direction || new THREE.Vector3(0, 1, 0))
            .normalize();
        plane.offset = config.offset || 0;

        // mesh
        if (config.createMesh) {
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
                new THREE.Vector3(),
                plane.direction,
                new THREE.Vector3(0, 1, 0)
            );
            mesh.applyMatrix(orientation);
            scene.add(mesh);

            // in case the mesh needs to be changed
            plane.body = mesh;
        }

        return plane;
    }
};
