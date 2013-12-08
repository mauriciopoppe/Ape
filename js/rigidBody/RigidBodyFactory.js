Ape.RigidBodyFactory = function (type, size) {
    size = size || 5;
    var geometry = new THREE.CubeGeometry(size, size, size);
    var material = new THREE.MeshNormalMaterial();
    var body = new Ape.RigidBody(geometry, material);

    switch (type) {
        case 'simple':
            break;

        case 'gravity':
            body.acceleration = Ape.GRAVITY.clone();
            break;
    }
    body.setMass(1);
    body.position.set(100, 100, 0);
    body.setInertiaTensor(
        new Ape.Matrix3().setBlockInertialTensor(
            new Ape.Vector3(size * 0.5, size * 0.5, size * 0.5),
            body.getMass()
        )
    );
    return body;
};

/**
 * @singleton
 * 
 * Factory of known rigid bodies, besides creating rigid bodies
 * the methods of this singleton also apply known inertia tensors
 * depending on the type of rigid body.
 * 
 * @class Ape.RigidBodyFactory
 */

/**
 * Creates a RigidBody which has a box as its geometry,
 * this method also applies the corresponding inertia tensor
 *
 * This method should be rarely called, use `CollisionShapeFactory.createBox` instead
 * 
 *      var box;
 *      // a box with width, height and depth equal to 5 
 *      box = new Ape.RigidBodyFactory.createBox();
 *      // a box with a different size
 *      box = new Ape.RigidBodyFactory.createBox({
 *          size: 5
 *      });
 *      // a box with a different sides length
 *      box = new Ape.RigidBodyFactory.createBox({
 *          width: 10,
 *          height: 15,
 *          depth: 20
 *      });
 *      // By default all the rigid bodies are affected by the gravity
 *      // if the box isn't affected by it then the parameter 'type'
 *      // should be set to 'simple'
 *      box = new Ape.RigidBodyFactory.createBox({
 *          type: 'simple'
 *      });
 *
 * @param {Object} config
 * @param {number} [config.size=5] Box's side length
 * @param {number} config.width Box's width (if width is not provided
 * `size` is used instead)
 * @param {number} config.height Box's height (if height is not provided
 * `size` is used instead)
 * @param {number} config.depth Box's depth (if depth is not provided
 * `size` is used instead)
 * @param {string} config.type 'simple' or 'gravity'
 * @returns {Ape.RigidBody}
 */
Ape.RigidBodyFactory.createBox = function (config) {
    // default options
    var size = config.size || 5,
	    width = config.width || size,
	    height = config.height || size,
	    depth = config.depth || size;

    var geometry = new THREE.CubeGeometry(width, height, depth);
    var material = new THREE.MeshNormalMaterial();
    var body = new Ape.RigidBody(geometry, material);
    this.applyConfig(body, config);
    body.setInertiaTensor(
        new Ape.Matrix3().setBlockInertialTensor(
            new Ape.Vector3(width * 0.5, height * 0.5, depth * 0.5),
            body.getMass()
        )
    );
    return body;
};

/**
 * Creates a RigidBody which has a sphere as its geometry,
 * this method also applies the corresponding inertia tensor.
 *
 * This method should be rarely called, use `CollisionShapeFactory.createSphere` instead
 
 *      var sphere;
 *      // a sphere with a radius equal to 5
 *      sphere = new Ape.RigidBodyFactory.createSphere();
 *      // a sphere with a different radius
 *      sphere = new Ape.RigidBodyFactory.createSphere({
 *          radius: 10
 *      });
 *      // By default all the rigid bodies are affected by the gravity
 *      // if the sphere isn't affected by it then the parameter 'type'
 *      // should be set to 'simple'
 *      sphere = new Ape.RigidBodyFactory.createSphere({
 *          type: 'simple'
 *      });
 *
 * @param {Object} config
 * @param {Object} config.radius Radius of the geometric representation
 * @param {string} config.type 'simple' or 'gravity'
 * @returns {Ape.RigidBody}
 */
Ape.RigidBodyFactory.createSphere = function (config) {
    // default options
    var radius = config.radius || 5;

    var geometry = new THREE.SphereGeometry(radius, 32, 32);
    var material = new THREE.MeshNormalMaterial();
    var body = new Ape.RigidBody(geometry, material);
    this.applyConfig(body, config);
    body.setInertiaTensor(
        new Ape.Matrix3().setSphereInertialTensor(
            radius,
            body.getMass()
        )
    );
    return body;
};

/**
 * Identifies the type of pre-configured option through
 * `config.type`, if there's a matching property it applies
 * the corresponding characteristics to the `body`
 * @param {Ape.RigidBody} body
 * @param {Object} config
 */
Ape.RigidBodyFactory.applyConfig = function (body, config) {
    var types = Ape.RigidBodyFactory.types,
	    method = types[config.type] || types.gravity;
    method(body);
    body.setMass(1);
};

Ape.RigidBodyFactory.types = {
    /**
     * Callback executed if the object is affected by a GRAVITY
     * @param {Ape.RigidBody} body
     */
	gravity: function (body) {
		body.acceleration = Ape.GRAVITY.clone();
	},
    /**
     * Callback executed if the object is not affected by any force
     * @param {Ape.RigidBody} body
     */
	simple: function (body) {}
};