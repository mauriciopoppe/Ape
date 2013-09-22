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

Ape.RigidBodyFactory.createCube = function (config) {
    // default options
    var size = config.size || 5;

    var geometry = new THREE.CubeGeometry(size, size, size);
    var material = new THREE.MeshNormalMaterial();
    var body = new Ape.RigidBody(geometry, material);
    this.applyConfig(body, config);
    body.setInertiaTensor(
        new Ape.Matrix3().setBlockInertialTensor(
            new THREE.Vector3(size * 0.5, size * 0.5, size * 0.5),
            body.getMass()
        )
    );
    return body;
};

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

Ape.RigidBodyFactory.applyConfig = function (body, config) {
    config.type = config.type || Ape.RigidBodyFactory.GRAVITY;
    switch (config.type) {
        case Ape.RigidBodyFactory.GRAVITY:
            body.acceleration = Ape.GRAVITY.clone();
            break;
        default:
            break;
    }
    body.setMass(1);
};

Ape.RigidBodyFactory.SIMPLE = 'simple';
Ape.RigidBodyFactory.GRAVITY = 'gravity';
