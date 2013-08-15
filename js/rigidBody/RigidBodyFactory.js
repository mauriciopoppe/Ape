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
Ape.RigidBodyFactory.SIMPLE = 'simple';
Ape.RigidBodyFactory.GRAVITY = 'gravity';
