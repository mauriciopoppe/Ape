/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/30/13
 * Time: 4:48 PM
 * To change this template use File | Settings | File Templates.
 */
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
            new THREE.Vector3(size * 0.5, size * 0.5, size * 0.5),
            body.getMass()
        )
    );
    return body;
};

/**
 * Creates a RigidBody which has a box as its geometry,
 * this method also applies the corresponding inertia tensor
 *
 * This method should be rarely called, use `CollisionShapeFactory.createBox` instead
 *
 * @param {Object} config
 * @param {number} config.size Box's side length
 * @param {number} config.size Box's width (if width is not provided
 * `size` is used instead)
 * @param {number} config.size Box's height (if height is not provided
 * `size` is used instead)
 * @param {number} config.size Box's depth (if depth is not provided
 * `size` is used instead)
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
            new THREE.Vector3(width * 0.5, height * 0.5, depth * 0.5),
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
 *
 * @param {Object} config
 * @param {Object} config.radius Radius of the geometric representation
 * @param {Object} config.type Particular c
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
 * @private
 * Identifies the type of pre-configured option through
 * `config.type`, if there's a matching property it applies
 * the corresponding characteristics to the `body`
 * @param body
 * @param config
 */
Ape.RigidBodyFactory.applyConfig = function (body, config) {
    var types = Ape.RigidBodyFactory.types,
	    method = types[config.type] || types.gravity;
    method(body);
    body.setMass(1);
};

/**
 * Callbacks executed depending on the type of object
 * @type {Object}
 */
Ape.RigidBodyFactory.types = {
	gravity: function (body) {
		body.acceleration = Ape.GRAVITY.clone();
	},
	simple: function (body) {}
};