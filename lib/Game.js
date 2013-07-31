/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/30/13
 * Time: 4:56 PM
 * To change this template use File | Settings | File Templates.
 */
"use strict";
var Game = {
    update: function (delta) {},
    render: function () {},
    reset: function () {},
    run: function (delta) {
        this.stats.update();

        this.reset();

        // update forces and positions
        this.update(delta);

        // render
        this.render();
    },
    animate: function () {
        if (this.gameTime.tick() && !this.controls.paused) {
            this.run(this.gameTime.frameTime / 1000);
        }
        window.requestAnimationFrame(this.animate);
    },

    // game launcher
    setUp: function (params) {
        this.context = params.context;
        this.reset = params.reset;
        this.update = params.update;
        this.render = params.render;
        this.animate = this.animate.bind(this);
        return this;
    },
    extra: function () {
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild(this.stats.domElement);
    },
    launch: function () {
        // extra function helpers like stats
        this.extra();

        this.animate();
    }
};

Game.controls = {
    paused: false,
    togglePause: function () {
        this.paused = !this.paused;
    }
};

Game.gameTime = {
    lastTime: Date.now(),
    frameTime: 0,
    typicalFrameTime: 10,
    minFrameTime: 2,
    time: 0,
    tick: function () {
        var now = Date.now();
        var delta = now - this.lastTime;
        if (delta < this.minFrameTime) {
            return false;
        }
//        if (delta > 2 * this.typicalFrameTime) {
//            this.frameTime = this.typicalFrameTime;
//        } else {
//            this.frameTime = delta;
//        }
        this.frameTime = delta;
        this.time += delta;
        this.lastTime = now;
        return true;
    }
};