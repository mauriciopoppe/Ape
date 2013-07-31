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
        var particle = new Ape.ParticleFactory(
            Ape.ParticleFactory.ARTILLERY
        );
        scene.add(particle);

        this.particle = particle;
    },

    update: function (delta) {
        this._super(delta);

        this.particle.integrate(delta);
//        this.particle.rotation.x += delta;
//        this.particle.rotation.y += delta;
    }
});