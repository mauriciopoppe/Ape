/**
 * A wrapper class that holds the fine collision detection routines
 *
 * Each of the functions has the same format: it takes the details
 * of two objects and a pointer to a contact array to fill, it
 * returns the number of contacts it wrote into the array
 * @class Ape.collision.CollisionDetector
 */
Ape.collision.CollisionDetector = Class.extend({
    /**
     * Tries to generate a contact between two spheres
     * @param {Ape.primitive.Sphere} one
     * @param {Ape.primitive.Sphere} two
     * @param {Ape.collision.CollisionData} data
     */
    sphereAndSphere: function (one, two, data) {
        // only write contacts if there's enough room
        if (data.contactsLeft <= 0) {
            return 0;
        }

        var positionOne = one.getAxis(3),
            positionTwo = two.getAxis(3);

        var midLine = positionOne.clone().sub(positionTwo);
        var length = midLine.length();

        // check if the spheres are intersected
        if (length <= 0 || length >= one.radius + two.radius) {
            return 0;
        }

        // manually create the normal
        var normal = midLine.clone().normalize();

        var contact = this.createContact();
        contact.contactNormal = normal;
        contact.contactPoint = positionOne.add(
            midLine.clone().multiplyScalar(0.5)
        );
        contact.penetration = one.radius + two.radius - length;

        // set body data
        contact.body[0] = one.body;
        contact.body[1] = two.body;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Detects collisions between a sphere and a half space plane,
     * the difference between a plane and a half space plane
     * is that the plane is infinitely big
     * @param {Ape.primitive.Sphere} sphere
     * @param {Ape.primitive.Plane} plane
     * @param {Ape.collision.CollisionData} data
     * @returns {number}
     */
    sphereAndHalfSpace: function (sphere, plane, data) {
        // only write contacts if there's enough room
        if (data.contactsLeft <= 0) {
            return 0;
        }

        var position = sphere.getAxis(3);

        // distance from the plane

        // since plane.direction is a NORMALIZED vector then the
        // dot product will return the projection of the position
        // of the sphere in the direction of the normal vector
        // of the plane
        var ballDistance = plane.direction
            .dot(position) - sphere.radius - plane.offset;

        if (ballDistance >= 0) {
            // no collision detected
            return 0;
        }

        var contact = this.createContact();
        contact.contactNormal = plane.direction.clone();
        contact.penetration = -ballDistance;
        contact.contactPoint = position.sub(
            plane.direction.clone().multiplyScalar(
                ballDistance + sphere.radius
            )
        );

        // set body data
        contact.body[0] = sphere.body;
        contact.body[1] = null;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Detects collisions between a box and a half space plane
     * @param box
     * @param plane
     * @param data
     */
    boxAndHalfSpace: function (box, plane, data) {
        var me = this;

        // only write contacts if there's enough room
        if (data.contactsLeft <= 0) {
            return 0;
        }

        function checkBoxAndHalfSpaceIntersection(box, plane) {
            // work out the radius from the box to the plane
            var projectedRadius = me.transformToAxis(box, plane.direction);
            // compute how far is the box from the origin
            var boxDistance = plane.direction.
                dot(box.getAxis(3)) - projectedRadius;
            return boxDistance <= plane.offset;
        }

        if (!checkBoxAndHalfSpaceIntersection(box, plane)) {
            return 0;
        }

        var multipliers = [
            [ 1,  1,  1],
            [ 1,  1, -1],
            [ 1, -1,  1],
            [ 1, -1, -1],
            [-1,  1,  1],
            [-1,  1, -1],
            [-1, -1,  1],
            [-1, -1, -1]
        ];

        var i,
            contact,
            contactsWritten = 0;
        // iterate through all the 8 vertices of the box
        for (i = 0; i < 8; i += 1) {
            var vertexPos = new Ape.Vector3(
                multipliers[i][0] * box.halfSize.x,
                multipliers[i][1] * box.halfSize.y,
                multipliers[i][2] * box.halfSize.z
            );

            // transform the point using the box transformMatrix
            vertexPos = box.transform.transform(vertexPos);

            // calculate the distance from the plane
            var vertexDistance = vertexPos.dot(plane.direction);

            if (vertexDistance <= plane.offset) {
                contact = this.createContact();
                contact.contactPoint = plane.direction.clone()
                    .multiplyScalar(vertexDistance - plane.offset)
                    .add(vertexPos);
                contact.contactNormal = plane.direction.clone();
                contact.penetration = plane.offset - vertexDistance;

                // set body data
                contact.body[0] = box.body;
                contact.body[1] = null;
                contact.restitution = data.restitution;
                contact.friction = data.friction;
                data.contacts.push(contact);

                contactsWritten += 1;
            }
        }

        return contactsWritten;
    },

    /**
     * Detects collisions between a box and a sphere, there are 3 cases
     *
     *      sphere face - box face
     *      sphere face - box point
     *      sphere face - box edge
     *
     * @param {Ape.primitive.Box} box
     * @param {Ape.primitive.Sphere} sphere
     * @param {Ape.collision.CollisionData} data
     */
    boxAndSphere: function (box, sphere, data) {
        // transform the center of the sphere into box OBJECT coordinates
        var center = sphere.getAxis(3),
            relativeCenter = box.transform.transformInverse(center);

        if (Math.abs(relativeCenter.x) - sphere.radius > box.halfSize.x ||
                Math.abs(relativeCenter.y) - sphere.radius > box.halfSize.y ||
                Math.abs(relativeCenter.z) - sphere.radius > box.halfSize.z) {
            return 0;
        }

        // clamp each coordinate between [-box.halfSize.C, box.halfSize.C]
        var closestPoint = new Ape.Vector3(
            Math.min(Math.max(relativeCenter.x, -box.halfSize.x), box.halfSize.x),
            Math.min(Math.max(relativeCenter.y, -box.halfSize.y), box.halfSize.y),
            Math.min(Math.max(relativeCenter.z, -box.halfSize.z), box.halfSize.z)
        );
        var distance = closestPoint.clone().sub(relativeCenter).length();
        Ape.assert(typeof distance === 'number');
        if (distance > sphere.radius) {
            // no contact
            return 0;
        }

        // create the contact
        var closestPointWorld = box.transform.transform(closestPoint);
        var contact = this.createContact();
        contact.contactNormal = closestPointWorld.clone().sub(center).normalize();
        contact.contactPoint = closestPointWorld;
        contact.penetration = sphere.radius - distance;

        // set body data
        contact.body[0] = box.body;
        contact.body[1] = sphere.body;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Simulates the contact between any face of a box and a point
     * @param {Ape.primitive.Box} box
     * @param {Ape.Vector3} point
     * @param {Ape.collision.CollisionData} data
     * @returns {number}
     */
    boxAndPoint: function (box, point, data) {
        var pointObject = box.transform.transformInverse(point),
            normal,
            depth,
            minDepth;

        // check each axis looking for the axis on which the
        // penetration is least deep

        // x axis
        minDepth = box.halfSize.x - Math.abs(pointObject.x);
        if (minDepth < 0) {
            return 0;
        }
        normal = box.getAxis(0).multiplyScalar(pointObject.x < 0 ? -1 : 1);

        // y axis
        depth = box.halfSize.y - Math.abs(pointObject.y);
        if (depth < 0) {
            return 0;
        } else if (depth < minDepth) {
            minDepth = depth;
            normal = box.getAxis(1).multiplyScalar(pointObject.y < 0 ? -1 : 1);
        }

        // y axis
        depth = box.halfSize.z - Math.abs(pointObject.z);
        if (depth < 0) {
            return 0;
        } else if (depth < minDepth) {
            minDepth = depth;
            normal = box.getAxis(2).multiplyScalar(pointObject.z < 0 ? -1 : 1);
        }

        // create the contact
        var contact = this.createContact();
        contact.contactNormal = normal;
        contact.contactPoint = point;
        contact.penetration = minDepth;

        // set body data
        contact.body[0] = box.body;
        contact.body[1] = null;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Simulates the contact between two boxes
     * @param {Ape.primitive.Box} one
     * @param {Ape.primitive.Box} two
     * @param {Ape.collision.CollisionData} data
     */
    boxAndBox: function (one, two, data) {
        // lets assume that there's no contact
        var me = this,
            toCenter = two.getAxis(3).sub(one.getAxis(3)),
            penetration = Infinity,
            best = -1;

        // checks if the projections of the objects [one, two]
        // over the given axis intersect, this is checked by cutting the objects
        // with a plane that is perpendicular to the axis and passes through
        // each object's center, the projections of those "half sizes" are
        // computed in `me.transformToAxis`
        function penetrationOnAxis(axis) {
            var oneProject = me.transformToAxis(one, axis),
                twoProject = me.transformToAxis(two, axis),
                distance = Math.abs(toCenter.dot(axis));

            // returns the overlap amount:
            //  - positive means overlap
            //  - negative means separation
            return oneProject + twoProject - distance;
        }

        function tryAxis(axis, index) {
            if (axis.lengthSq() < 1e-4) {
                return true;
            }
            axis.normalize();
            var candidate = penetrationOnAxis(axis);
            if (candidate < 0) {
                return false;
            }
            if (candidate < penetration) {
                penetration = candidate;
                best = index;
            }
            return true;
        }

        // check if there's an overlap by checking if there's
        // a Separating Axis Test, this test says that the bodies are not colliding
        // if there's a axis (in 2d) or a plane (in 3d) that passes between the objects
        // without colliding any of them.
        //
        // What we'll do is check for each axis if there's some overlap
        // if not it means that there's an axis or plane that may go between the objects
        // In 3d we need 15 checks as explained here:
        // http://gamedev.stackexchange.com/questions/44500/how-many-and-which-axes-to-use-for-3d-obb-collision-with-sat
        //
        // In any case to avoid calculating all the overlap over one axis, we can
        // divide the shape in two parts (no matter which axis or plane we choose, if that
        // plane contains the center of the object it'll cut it in equally proportional
        // dimensions)

        // check overlap over one's (x, y, z) axes
        if (!tryAxis(one.getAxis(0), 0)) { return 0; }
        if (!tryAxis(one.getAxis(1), 1)) { return 0; }
        if (!tryAxis(one.getAxis(2), 2)) { return 0; }

        // check overlap over two's (x, y, z) axes
        if (!tryAxis(two.getAxis(0), 3)) { return 0; }
        if (!tryAxis(two.getAxis(1), 4)) { return 0; }
        if (!tryAxis(two.getAxis(2), 5)) { return 0; }

        var bestSingleAxis = best;

        // check overlap over the combination of two's and one's axes
        if (!tryAxis(one.getAxis(0).cross(two.getAxis(0)), 6)) { return 0; }
        if (!tryAxis(one.getAxis(0).cross(two.getAxis(1)), 7)) { return 0; }
        if (!tryAxis(one.getAxis(0).cross(two.getAxis(2)), 8)) { return 0; }
        if (!tryAxis(one.getAxis(1).cross(two.getAxis(0)), 9)) { return 0; }
        if (!tryAxis(one.getAxis(1).cross(two.getAxis(1)), 10)) { return 0; }
        if (!tryAxis(one.getAxis(1).cross(two.getAxis(2)), 11)) { return 0; }
        if (!tryAxis(one.getAxis(2).cross(two.getAxis(0)), 12)) { return 0; }
        if (!tryAxis(one.getAxis(2).cross(two.getAxis(1)), 13)) { return 0; }
        if (!tryAxis(one.getAxis(2).cross(two.getAxis(2)), 14)) { return 0; }

        Ape.assert(best !== -1);

        // We know which axis the collision is on (i.e. best),
        // but we need to work out which of the two faces that
        // are perpendicular to this axis need to be taken.
        function fillPointFaceBoxBox(one, two, toCenter, best) {
            var normal = one.getAxis(best);

            // The axis should point from box one to box two
            if (normal.dot(toCenter) > 0) {
                normal.multiplyScalar(-1);
            }

            // work out which vertex of box two we're colliding with
            var vertex = two.halfSize.clone();
            if (two.getAxis(0).dot(normal) < 0) { vertex.x *= -1; }
            if (two.getAxis(1).dot(normal) < 0) { vertex.y *= -1; }
            if (two.getAxis(2).dot(normal) < 0) { vertex.z *= -1; }

            // create the contact data
            var contact = me.createContact();
            contact.contactNormal = normal;
            contact.penetration = penetration;
            contact.contactPoint = two.transform.clone().multiplyVector(vertex);

            // set body data
            contact.body[0] = one.body;
            contact.body[1] = two.body;
            contact.restitution = data.restitution;
            contact.friction = data.friction;
            data.contacts.push(contact);
        }

        if (best < 3) {
            fillPointFaceBoxBox(one, two, toCenter, best);
            return 1;
        } else if (best < 6) {
            fillPointFaceBoxBox(two, one, toCenter.multiplyScalar(-1), best - 3);
            return 1;
        } else {
            best -= 6;
            var oneIndex = ~~(best / 3);
            var twoIndex = best % 3;
            var oneAxis = one.getAxis(oneIndex);
            var twoAxis = two.getAxis(twoIndex);
            var axis = oneAxis.clone().cross(twoAxis);
            axis.normalize();

            // The axis should point from box one to box two
            if (axis.dot(toCenter) > 0) { axis.multiplyScalar(-1); }

            var ptOnOneEdge = one.halfSize.clone();
            var ptOnTwoEdge = two.halfSize.clone();
            var map = ['x', 'y', 'z'];
            for (var i = 0; i < 3; i += 1) {
                if (i === oneIndex) { ptOnOneEdge[map[i]] = 0; }
                else if (one.getAxis(i).dot(axis) > 0) { ptOnOneEdge[map[i]] *= -1; }

                if (i === twoIndex) { ptOnTwoEdge[map[i]] = 0; }
                else if (two.getAxis(i).dot(axis) > 0) { ptOnTwoEdge[map[i]] *= -1; }
            }

            ptOnOneEdge = one.transform.multiplyVector(ptOnOneEdge);
            ptOnTwoEdge = two.transform.multiplyVector(ptOnTwoEdge);

            function contactPoint(
                    pOne, dOne, oneSize,
                    pTwo, dTwo, twoSize,
                    useOne) {
                // Ape.Vector3
                var toSt, cOne, cTwo;

                // number
                var dpStaOne, dpStaTwo, dpOneTwo, smOne, smTwo;
                var denominator, mua, mub;

                smOne = dOne.lengthSq();
                smTwo = dTwo.lengthSq();
                dpOneTwo = dTwo.dot(dOne);

                toSt = pOne.clone().sub(pTwo);
                dpStaOne = dOne.dot(toSt);
                dpStaTwo = dTwo.dot(toSt);

                denominator = smOne * smTwo - dpOneTwo * dpOneTwo;

                // Zero denominator indicates parallel lines
                if (Math.abs(denominator) < 1e-4) {
                    return useOne ? pOne : pTwo;
                }

                mua = (dpOneTwo * dpStaTwo - smTwo * dpStaOne) / denominator;
                mub = (smOne * dpStaTwo - dpOneTwo * dpStaOne) / denominator;

                // If either of the edges has the nearest point out
                // of bounds, then the edges aren't crossed, we have
                // an edge-face contact. Our point is on the edge, which
                // we know from the useOne parameter.
                if (mua > oneSize || mua < -oneSize ||
                    mub > twoSize || mub < -twoSize) {
                    return useOne ? pOne : pTwo;
                } else {
                    cOne = pOne.add(dOne.multiplyScalar(mua));
                    cTwo = pTwo.add(dTwo.multiplyScalar(mub));
                    return cOne.multiplyScalar(0.5).add(
                        cTwo.multiplyScalar(0.5)
                    );
                }
            }

            var vertex = contactPoint(
                ptOnOneEdge, oneAxis, one.halfSize[map[oneIndex]],
                ptOnTwoEdge, twoAxis, two.halfSize[map[twoIndex]],
                bestSingleAxis > 2
            );

            var contact = me.createContact();
            contact.penetration = penetration;
            contact.contactNormal = axis;
            contact.contactPoint = vertex;

            // set body data
            contact.body[0] = one.body;
            contact.body[1] = two.body;
            contact.restitution = data.restitution;
            contact.friction = data.friction;

            data.contacts.push(contact);
            return 1;
        }
    },

    /**
     * Projects a box to an axis, to avoid computing the whole projection of the box
     * we can project only half of the box
     * Check [this paper about Separating Axis Theorem in boxes](http://www.jkh.me/files/tutorials/Separating%20Axis%20Theorem%20for%20Oriented%20Bounding%20Boxes.pdf)
     * @param box
     * @param axis
     * @returns {number}
     */
    transformToAxis: function (box, axis) {
        return box.halfSize.x * Math.abs(axis.dot(box.getAxis(0))) +
               box.halfSize.y * Math.abs(axis.dot(box.getAxis(1))) +
               box.halfSize.z * Math.abs(axis.dot(box.getAxis(2)));
    },

    /**
     * Creates an instance of Ape.collision.Contact
     * @returns {Ape.collision.Contact}
     */
    createContact: function () {
        return new Ape.collision.Contact();
    },


	/**
	 * The `detect` method identifies which the method to be executed
	 * to detect collisions between a pair of objects:
	 *
	 *      // e.g.
	 *      // detect collision between: sphere and sphere
	 *      detector: {
	 *          sphere: {
	 *              sphere: 'sphereAndSphere'
	 *          }
	 *      }
	 *      // method `sphereAndSphere` will be called
     *      // this map defaults to:
     *      detector: {
     *          sphere: {
     *              sphere: 'sphereAndSphere',
     *              plane: 'sphereAndHalfSpace'
     *          },
     *          box: {
     *              box: 'boxAndBox',
     *              sphere: 'boxAndSphere',
     *              plane: 'boxAndHalfSpace',
     *              point: 'boxAndPoint'
     *          }
     *      },
	 *
     * @type {Object}
	 */
    detector: {
        sphere: {
            sphere: 'sphereAndSphere',
            plane: 'sphereAndHalfSpace'
        },
        box: {
            box: 'boxAndBox',
            sphere: 'boxAndSphere',
            plane: 'boxAndHalfSpace',
            point: 'boxAndPoint'
        }
    },

    /**
     * For any two objects passed, detects which is the method
     * to call to detect collisions based on the rules described in the
     * {@link Ape.collision.CollisionDetector#property-detector}
     * @param {Ape.primitive.Primitive} a
     * @param {Ape.primitive.Primitive} b
     * @param {Ape.collision.CollisionData} data
     */
    detect: function (a, b, data) {
        var i,
            first, second,
            method,
            objects = [a, b],
            types = [a.getType(), b.getType()];

        for (i = -1; ++i < 2;) {
            first = i;
            second = 1 - i;
            method = this.detector[types[first]] &&
                this.detector[types[first]][types[second]];
            if (method) {
                this[method](objects[first], objects[second], data);
                return;
            }
        }
    }
});