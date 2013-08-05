/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/30/13
 * Time: 4:48 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.ParticleFactory = function (type) {
    var radius = 5;
    var geometry = new THREE.SphereGeometry(radius, 32, 32);
    var material = new THREE.MeshNormalMaterial();
    var particle = new Ape.Particle(geometry, material);
    switch (type) {
        case 'simple':
            break;

        case 'gravity':
            particle.acceleration = Ape.GRAVITY.clone();
            break;

        case 'pistol':
            particle.color = 'green';
            particle.setMass(2);                    // 2kg
            particle.velocity.set(35, 0, 0);        // 35m/s
            particle.acceleration.set(0, -1, 0);    // little gravity
            break;

        case 'artillery':
            particle.color = 'blue';
            particle.setMass(200);                  // 200kg
            particle.velocity.set(30, 40, 0);       // 30 and 40 m/s
            particle.acceleration.set(0, -20, 0);   // double gravity
            break;

        case 'fireball':
            particle.color = 'orange';
            particle.setMass(1);                    // 1kg
            particle.velocity.set(10, 0, 0);        // 10m/s
            particle.acceleration.set(0, 0.6, 0);   // negative gravity!
            break;

        case 'laser':
            particle.color = 'red';
            particle.setMass(0.1);                  // 2kg
            particle.velocity.set(100, 0, 0);       // 100m/s
            particle.acceleration.set(0, 0, 0);     // no gravity
            break;
    }
    particle.radius = radius;
    particle.position.set(100, 100, 0);
    particle.setDamping(0.99);              // damping factor
    return particle;
};
Ape.ParticleFactory.SIMPLE = 'simple';
Ape.ParticleFactory.AFFECTED_BY_GRAVITY = 'gravity';
Ape.ParticleFactory.PISTOL = 'pistol';
Ape.ParticleFactory.ARTILLERY = 'artillery';
Ape.ParticleFactory.FIREBALL = 'fireball';
Ape.ParticleFactory.LASER = 'laser';