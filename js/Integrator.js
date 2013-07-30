/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 11:25 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.Integrator = {
    update: function (delta) {
        // iterate over all the objects registered in the scene
        this.particles.forEach(function (particle) {
            // PHASE 1: Position update
            particle.position = particle.position
                .add(particle.velocity.multiplyScalar(delta))
                // since delta squared times 0.5 gives a really small number,
                // the acceleration is commonly ignored
                .add(particle.acceleration.multiplyScalar(delta * delta * 0.5));

        });
    },
    particles: []
};