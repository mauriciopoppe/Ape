/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/14/13
 * Time: 9:36 AM
 * To change this template use File | Settings | File Templates.
 */
/**
 * AeroControl, a force generator that applies an aerodynamic
 * force doing interpolations between its min and max
 * tensor
 *
 * @class Ape.Spring
 */
Ape.AeroControl = Ape.Aero.extend({
    init: function (base, min, max, position, windSpeed) {

        this._super(base, position, windSpeed);

        /**
         * Holds the aerodynamic tensor for the surface, when
         * the control is at its maximum value
         * @type {Ape.Matrix3}
         */
        this.maxTensor = max;

        /**
         * Holds the aerodynamic tensor for the surface, when
         * the control is at its minimum value
         * @type {Ape.Matrix3}
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
         * @type {number}
         */
        this.controlSetting = 0;
    },

    /**
     * Calculate the final aerodynamic tensor for the current
     * control setting
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
     * @param value
     */
    setControl: function (value) {
        if (value < -1 || value > 1) {
            console.warn('Ape.AeroControl.setControl(): value should ' +
                'be in the range [-1, 1]');
        }
        this.controlSetting = value;
    },

    updateForce: function (body, duration) {
        var tensor = this.getTensor();
        this.updateForceFromTensor(body, duration, tensor);
    }
});