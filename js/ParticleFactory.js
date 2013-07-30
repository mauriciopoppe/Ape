/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/30/13
 * Time: 4:48 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.ParticleFactory = function (type) {
    var particle = new Ape.Particle();
    switch (type) {
        case 'pistol':
            particle.setMass(2);                    // 2kg
            particle.velocity.set(0, 0, 35);        // 35m/s
            particle.acceleration.set(0, -1, 0);    // little gravity
            particle.setDamping(0.99);              // damping factor
            break;

        case 'artillery':
            particle.setMass(200);                  // 200kg
            particle.velocity.set(0, 30, 40);       // 50m/s
            particle.acceleration.set(0, -20, 0);   // high gravity
            particle.setDamping(0.99);              // damping factor
            break;

        case 'fireball':
            particle.setMass(1);                    // 1kg
            particle.velocity.set(0, 0, 10);        // 5m/s
            particle.acceleration.set(0, 0.6, 0);   // negative gravity!
            particle.setDamping(0.99);              // damping factor
            break;

        case 'laser':
            particle.setMass(0.1);                  // 2kg
            particle.velocity.set(0, 0, 100);       // 35m/s
            particle.acceleration.set(0, 0, 0);     // no gravity
            particle.setDamping(0.99);              // damping factor
            break;
    }
    return particle;
};
Ape.ParticleFactory.PISTOL = 'pistol';
Ape.ParticleFactory.ARTILLERY = 'artillery';
Ape.ParticleFactory.FIREBALL = 'fireball';
Ape.ParticleFactory.LASER = 'laser';