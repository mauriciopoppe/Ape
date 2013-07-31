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
        var geometry = new THREE.CubeGeometry(10, 10, 10);
        var material = new THREE.MeshNormalMaterial();
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 100, 0);
        scene.add(mesh);

        this.cube = mesh;
    },

    update: function (delta) {
        this._super(delta);
        this.cube.rotation.x += delta;
        this.cube.rotation.y += delta;
    }
});