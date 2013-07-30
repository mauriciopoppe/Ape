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
            particle.color = 'green';
            particle.setMass(2);                    // 2kg
            particle.velocity.set(35, 0, 0);        // 35m/s
            particle.acceleration.set(0, -1, 0);    // little gravity
            particle.setDamping(0.99);              // damping factor
            break;

        case 'artillery':
            particle.color = 'blue';
            particle.setMass(200);                  // 200kg
            particle.velocity.set(30, 40, 0);       // 50m/s
            particle.acceleration.set(0, -20, 0);   // high gravity
            particle.setDamping(0.99);              // damping factor
            break;

        case 'fireball':
            particle.color = 'orange';
            particle.setMass(1);                    // 1kg
            particle.velocity.set(10, 0, 0);        // 5m/s
            particle.acceleration.set(0, 0.6, 0);   // negative gravity!
            particle.setDamping(0.99);              // damping factor
            break;

        case 'laser':
            particle.color = 'red';
            particle.setMass(0.1);                  // 2kg
            particle.velocity.set(100, 0, 0);       // 35m/s
            particle.acceleration.set(0, 0, 0);     // no gravity
            particle.setDamping(0.99);              // damping factor
            break;
    }
    particle.position.set(100, 100, 0);
    return particle;
};
Ape.ParticleFactory.PISTOL = 'pistol';
Ape.ParticleFactory.ARTILLERY = 'artillery';
Ape.ParticleFactory.FIREBALL = 'fireball';
Ape.ParticleFactory.LASER = 'laser';