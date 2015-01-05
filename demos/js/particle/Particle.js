/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 10:07 PM
 * To change this template use File | Settings | File Templates.
 */

(function () {
    var Particle;

    Particle = function () {
        THREE.Mesh.apply(this, arguments);
        /**
         * Holds the linear position of the particle in
         * world space.
         */
        this.position = this.position || new Ape.Vector3();
        /**
         * Holds the linear velocity of the particle in
         * world space.
         */
        this.velocity = new Ape.Vector3();
        /**
         * Holds the acceleration of the particle. This value
         * can be used to set acceleration due to gravity (its primary
         * use) or any other constant acceleration.
         */
        this.acceleration = new Ape.Vector3();
        /**
         * Holds the amount of damping applied to linear
         * motion. Damping is required to remove energy added
         * through numerical instability in the integrator.
         */
        this.damping = 0.9;
        /**
         * Inverse of the mass:
         * f = m * a (force equals mass times acceleration)
         * a = (1 / m) * f (1 / m is the inverse of the mass)
         *
         * This means that infinite mass object have a zero inverse mass since 1 / ∞ = 0
         * Objects of zero mass have an undefined inverse mass
         * @type {*}
         */
        this.inverseMass = 1.0;
        /**
         * Holds the accumulated force to be applied at the next
         * simulation iteration only. This value is zeroed at each integration step.
         */
        this.accumulatedForce = new Ape.Vector3();

    };

    Particle.prototype = new THREE.Mesh();

    $.extend(Particle.prototype, {
        setMass: function (m) {
            Ape.assert(m !== 0);
            this.inverseMass = 1 / m;
        },

        setInverseMass: function (m) {
            this.inverseMass = m;
        },

        getMass: function () {
            if (this.inverseMass < 1e-9) {
                return Infinity;
            }
            return 1 / this.inverseMass;
        },

        getInverseMass: function () {
            return this.inverseMass;
        },

        setDamping: function (v) {
            this.damping = v;
        },

        integrate: function (delta) {
            Ape.assert(delta > 0);
            Ape.assert(this.inverseMass >= 0);

            // PHASE 1: Velocity update
            var resultingAcceleration =
                this.acceleration.clone()
                    .add(
                        this.accumulatedForce.clone()
                            .multiplyScalar(this.inverseMass)
                    );

//            console.log(JSON.stringify(resultingAcceleration));
//            console.log(this.accumulatedForce);
//            console.log(this.inverseMass);
//            console.log(JSON.stringify(this.accumulatedForce
//                .multiplyScalar(this.inverseMass)));

            this.velocity
                .multiplyScalar(
                    Math.pow(this.damping, delta)
                )
                .add(
                    resultingAcceleration
                        .multiplyScalar(delta)
                );

            // PHASE 2: Position update
            this.position
                .add(
                    this.velocity.clone()
                        .multiplyScalar(delta)
                )
                // since delta squared times 0.5 gives a really small number,
                // the acceleration is commonly ignored
                .add(
                    this.acceleration.clone()
                        .multiplyScalar(delta * delta * 0.5)
                );

            this.clearAccumulator();
        },

        /**
         * Clears the forces applied to the particle.
         * This will be called automatically after each integration step.
         */
        clearAccumulator: function () {
            this.accumulatedForce.set(0, 0, 0);
        },

        /**
         * Adds a force to this particle to be applied in the integrate function
         * @param f
         */
        addForce: function (f) {
            this.accumulatedForce
                .add(f);
        }
    });

    Ape.Particle = Particle;
})();

