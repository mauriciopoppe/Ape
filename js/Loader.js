/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 1:59 PM
 * To change this template use File | Settings | File Templates.
 */
var Loader = function (callback) {

    function load(index) {
        if (index < Loader.list.length) {
            var script = document.createElement('script');
            script.onload = function () {
                load(index + 1);
            };
            script.src = Loader.list[index];
            document
                .getElementsByTagName('head')[0]
                .appendChild(script);
        } else {
            callback();
        }
    }

    load(0);
};

Loader.list = [
    // APE
    'T3/lib/Extend.js',
    'js/Core.js',
    'js/Vector3.js',
    'js/Constants.js'
];

Loader.list.T3 = [
    'T3/lib/Extend.js',
    'T3/lib/dat.gui.min.js',
    'T3/lib/stats.min.js',
    'T3/lib/jquery-1.9.1.js',
    'T3/lib/three.59.min.js',
    'T3/lib/Detector.js',
    'T3/lib/Coordinates.js',
    'T3/lib/THREEx.FullScreen.js',
    'T3/lib/THREEx.WindowResize.js',
    'T3/lib/OrbitAndPanControls.js',
    'T3/js/T3.js',
    'T3/js/Application.js',
    'T3/js/ObjectManager.js',
    'T3/js/controller/Keyboard.js',
    'T3/js/controller/World.js',
    'T3/js/model/Coordinates.js'
];

Loader.list.T3Extension = [
    'js/rigidBody/RigidBodyWorld.js'
];

Loader.list.particle = [
    'js/particle/Particle.js',
    'js/particle/ParticleFactory.js',
    'js/particle/ParticleForceRegistry.js',
    'js/particle/ParticleForceGenerator.js',
    'js/particle/ParticleDrag.js',
    'js/particle/ParticleSpring.js',
    'js/particle/ParticleBuoyancy.js',
    'js/particle/ParticleGravity.js',
    'js/collision/ParticleContact.js',
    'js/collision/ParticleContactResolver.js',
    'js/collision/ParticleLink.js',
    'js/collision/ParticleCable.js',
    'js/collision/ParticleRod.js'
];

Loader.list.rigidBody = [
    'js/Quaternion.js',
    'js/Matrix3.js',
    'js/Matrix4.js',
    'js/rigidBody/force/ForceRegistry.js',
    'js/rigidBody/force/ForceGenerator.js',
    'js/rigidBody/force/Gravity.js',
    'js/rigidBody/force/Spring.js',
    'js/rigidBody/force/Buoyancy.js',
    'js/rigidBody/force/Aero.js',
    'js/rigidBody/force/AeroControl.js',
    'js/rigidBody/RigidBody.js',
    'js/rigidBody/RigidBodyFactory.js',
    'js/rigidBody/CollisionShapeFactory.js',

    // primitive
    'js/rigidBody/primitive/Primitive.js',
    'js/rigidBody/primitive/Box.js',
    'js/rigidBody/primitive/Plane.js',
    'js/rigidBody/primitive/Sphere.js',

    // collision
    'js/rigidBody/collision/BoundingSphere.js',
    'js/rigidBody/collision/CollisionData.js',
    'js/rigidBody/collision/CollisionDetector.js',
    'js/rigidBody/collision/Contact.js',
    'js/rigidBody/collision/ContactResolver.js'
];