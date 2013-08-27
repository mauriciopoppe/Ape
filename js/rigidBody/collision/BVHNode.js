/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/17/13
 * Time: 7:47 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * A base class for nodes in a bounding volume hierarchy
 * @class Ape.BVHNode
 */
Ape.BVHNode = Class.extend({
    init: function (parent, volume, body) {
        /**
         * Holds the child nodes of this node
         * @type {Array<Ape.BVHNode>}
         */
        this.children = [null, null];

        /**
         * Holds a single bounding volume encompassing
         * all the descendants of this node
         * @type {Ape.BoundingSphere}
         */
        this.volume = volume;

        /**
         * Holds the rigid body at this node of the hierarchy.
         * Only leaf nodes can have a rigid body defined if it's not
         * a leaf node then it's NULL
         * @type {Ape.RigidBody}
         */
        this.body = body || null;

        /**
         * Holds the parent of this node
         * @type {Ape.BVHNode}
         */
        this.parent = parent;
    },

    /**
     * Checks if this node is at the bottom of the hierarchy
     * (Only leaf nodes can have a rigid body defined)
     * @returns {boolean}
     */
    isLeaf: function () {
        return !!this.body;
    },

    overlaps: function (other) {
        return this.volume.overlaps(other.volume);
    },

    getPotentialContacts: function (contacts, limit) {
        if (this.isLeaf() || !limit) {
            return 0;
        }
        return this.children[0].getPotentialContactsWith(
            this.children[1], contacts, limit
        );
    },

    getPotentialContactsWith: function (other, contacts, limit) {
        var count;

        if (!this.overlaps(other) || !limit) {
            return 0;
        }

        // if both nodes are leafs then we have a potential contact
        if (this.isLeaf() && other.isLeaf()) {
            contacts.bodies[0] = this.body;
            contacts.bodies[1] = other.body;
            return 1;
        }

        // determine which node to descend into. If either is a leaf,
        // then we descend the other, if both are branches, then we
        // use the one with the largest size
        if (other.isLeaf() || (this.isLeaf() &&
            this.volume.getSize() >= other.volume.getSize())) {
            count = this.children[0].getPotentialContactsWith(
                other, contacts, limit
            );
            if (limit > count) {
                return count + this.children[1].getPotentialContactsWith(
                    other, contacts + count, limit - count
                );
            } else {
                return count;
            }
        } else {
            count = this.getPotentialContactsWith(
                other.children[0], contacts, limit
            );
            if (limit > count) {
                return count + this.getPotentialContactsWith(
                    other.children[1], contacts + count, limit - count
                );
            } else {
                return count;
            }
        }
    },

    /**
     * Inserts the given rigid body, with the given bounding volume
     * @param newBody
     * @param {Ape.BoundingSphere} newVolume
     */
    insert: function (newBody, newVolume) {
        // if we're at a leaf then the only option is to spawn two
        // new children and place the new body in one
        if (this.isLeaf()) {
            // clone this node and set it as a the child of a new node
            this.children[0] = new Ape.BVHNode(
                this,
                this.volume,
                this.body
            );
            // create a new node with the given parameters
            this.children[1] = new Ape.BVHNode(
                this,
                newVolume,
                newBody
            );
            // since this node is no longer a leaf set it's body property to NULL
            this.body = null;

            // we need to recalculate the bounding volume
            this.recalculateBoundingVolume();
        } else {
            // otherwise we need to check which child gets to keep
            // the inserted body. We give it to whoever would grow the
            // least to incorporate it
            var left = this.children[0],
                right = this.children[1];
            if (left.volume.getGrowth(newVolume) <
                right.volume.getGrowth(newVolume)) {
                left.insert(newBody, newVolume);
            } else {
                right.insert(newBody, newVolume);
            }
        }
    },

    /**
     * Recalculates the volume of this node
     */
    recalculateBoundingVolume: function () {
        if (this.isLeaf()) {
            return;
        }
        this.volume = new Ape.BoundingSphere().join(
            this.children[0].volume,
            this.children[1].volume
        );

        // recalculate the bounding volume of its parents
        if (this.parent) {
            this.parent.recalculateBoundingVolume();
        }
    },

    /**
     * Deletes this node removing it first from the hierarchy, along
     * with its associated rigid body and child nodes, it also has
     * the effect of deleting its sibling and changing the parent
     * node so that it contains the data currently in that sibling
     */
    remove: function () {
        // the root node has no siblings, so execute the sibling
        // processing only if this node has a parent (which means
        // that it isn't a root node)
        if (this.parent) {
            // find the sibling
            var sibling;
            if (this.parent.children[0] === this) {
                sibling = this.parent.children[1];
            } else {
                sibling = this.parent.children[0];
            }

            // write its data to the parent
//            this.parent.volume = sibling.volume;
//            this.parent.body = sibling.body;
//            this.parent.children[0] = sibling.children[0];
//            this.parent.children[1] = sibling.children[1];
            this.parent = sibling;
            this.parent.recalculateBoundingVolume();
        }

        // delete the children of this node
        if (this.children[0]) {
            this.children[0].parent = null;
        }
        if (this.children[1]) {
            this.children[1].parent = null;
        }
    }
});