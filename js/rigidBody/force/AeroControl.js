/**
 * AeroControl, a force generator that applies an aerodynamic
 * force doing interpolations between its min and max
 * tensor
 *
 * @class Ape.force.AeroControl
 * @extends Ape.force.Aero
 */
Ape.force.AeroControl = Ape.force.Aero.extend({
    /**
     * Ape.force.AeroControl constructor
     * @param {Ape.Matrix3} base Base tensor (tensor used if the object is resting)
     * @param {Ape.Matrix3} min Min tensor
     * @param {Ape.Matrix3} max Max tensor
     * @param {Ape.Vector3} position Position in the rigid body to apply
     * the aerodynamic force to
     * @param windSpeed
     */
    init: function (base, min, max, position, windSpeed) {

        this._super(base, position, windSpeed);

        /**
         * Holds the aerodynamic tensor for the surface, when
         * the control is at its maximum value
         * @property {Ape.Matrix3}
         */
        this.maxTensor = max;

        /**
         * Holds the aerodynamic tensor for the surface, when
         * the control is at its minimum value
         * @property {Ape.Matrix3}
         */
        this.minTensor = min;

        /**
         * The current position of the control for this surface,
         * this should be between the range [-1, 1]
         *
         *      -1 = the min tensor is used
         *      <0 = an interpolation between minTensor and base is used
         *       0 = the base tensor is used
         *      >0 = an interpolation between base and maxTensor is used
         *      +1 = the max tensor is used
         *
         * @property {number}
         */
        this.controlSetting = 0;
    },

    /**
     * Calculate the final aerodynamic tensor for the current
     * control setting
     * @return Ape.Matrix3
     */
    getTensor: function () {
        if (this.controlSetting <= -1) {
            return this.minTensor;
        } else if (this.controlSetting >= 1) {
            return this.maxTensor;
        } else if (this.controlSetting < 0) {
            // interpolate between min tensor and tensor
            return new Ape.Matrix3()
                .linearInterpolate(this.minTensor, this.tensor, this.controlSetting + 1);
        } else if (this.controlSetting > 0) {
            // interpolate between tensor and max tensor
            return new Ape.Matrix3()
                .linearInterpolate(this.tensor, this.maxTensor, this.controlSetting);
        } else {
            return this.tensor;
        }
    },

    /**
     * Sets the position of this control, it should be between
     * -1 and 1, values outside that range give undefined
     * results.
     * @param {number} value Value between -1 and 1, if it's -1 then the
     * min tensor is used, if the value is 1 then the max tensor is used,
     * if the value is 0 then the base tensor is used
     */
    setControl: function (value) {
        if (value < -1 || value > 1) {
            console.warn('Ape.force.AeroControl.setControl(): value should ' +
                'be in the range [-1, 1]');
        }
        this.controlSetting = value;
    },

    /**
     * Applies a force to a body by choosing the right tensor
     * @param body
     * @param duration
     */
    updateForce: function (body, duration) {
        var tensor = this.getTensor();
        this.updateForceFromTensor(body, duration, tensor);
    }
});