/*
 * Genie Music Keyboard Shortcuts extension
 *
 * Author : Changje Jeong <changjej@gmail.com>
 * Version 1.0.1
 * 2014.06.09
 *
 * Deploy under MIT License
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Changje Jeong
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */

var keyFunc = function(){

	var keyPressing = false;
	var startPoint = -1;
	var endPoint = -1;
	var repeatDiv = $("<div>").css({
		"position":"absolute",
		"top":"10px",
		"left":"10px",
		"color":"#DDD"});

	$(document).keydown( function(e){
		// Functional Keys Filtering
		if (e.metaKey || e.ctrlKey) {
			return;
		}
		if (!e.shiftKey) {
			e.preventDefault();
		}

		// Player Status 
		var iNowSts = GetPlayer().fnGetStatus();


		// Init Volume
		if (!$('.volume').hasClass('mute')){
			var volume = Math.round($(".volume-bar a").width() / $(".volume-bar").width() * 100,2);
			music_control.thisVolumePosition = volume;
			music_control.volumePosition = volume;
		}

		// Actions
		if (e.keyCode == 32) { // Spacebar : Play / Pause
			if (iNowSts == 0) {
				fnPlayOn();
			} else {
				fnPlayOff();
			}
		} else if (e.keyCode == 37) { 
			if (e.shiftKey) { // Shift + <-(RIGHT) : Prev
				fnPlayPrev();
				e.preventDefault();
			} else { // <-(LEFT) : 10sec << 
				keyPressing = true;
				var thisTime = music_control.controllerTime;
				var movePrev = function(){	
					if (!keyPressing) return;
					thisTime -= 10;
					thisTime = thisTime < 0 ? 0 : thisTime;
					GetPlayer().fnSetTime(thisTime);
					if (thisTime > 0){
						setTimeout(movePrev,2000);
					}
				}
				movePrev();
			}
		} else if (e.keyCode == 39) {
			if (e.shiftKey){ // Shift + ->(RIGHT) : Next
				fnPlayNext();
				e.preventDefault();
			} else { // ->(RIGHT) : 10sec >> 
				keyPressing = true;
				var thisTime = music_control.controllerTime;
				var playTime = music_control.playTime;
				var moveForward = function(){
					if (!keyPressing) return;
					thisTime += 10;
					thisTime = thisTime > playTime ? playTime : thisTime;
					GetPlayer().fnSetTime(thisTime);
					if (thisTime < playTime){
						setTimeout(moveForward,2000);
					}
				}
				moveForward();
			}
		} else if (e.keyCode == 38) { // UP : Volume 10% Up
			var volume = music_control.thisVolumePosition;
		    volume = volume + 10 > 100 ? 100 : volume + 10;
			music_control.thisVolumePosition = volume;
			music_control.volumePosition = volume;
			music_control._setVolume();
			music_control._callVolume();
		} else if (e.keyCode == 40) { // DOWN : Volume 10% Down
			var volume = music_control.thisVolumePosition;
		    volume = volume - 10 < 0 ? 0 : volume - 10;
			music_control.thisVolumePosition = volume;
			music_control.volumePosition = volume;
			music_control._setVolume();
			music_control._callVolume();
		} else if (e.keyCode == 82) { // r : Repeat
			fnRepeatClick();
		} else if (e.keyCode == 83) { // s : Suffle
			fnRandomClick();
		} else if (e.keyCode == 77) { // m : Mute
			music_control._toggleVolume(new Event("mute"));
		} else if (e.keyCode == 78) { // n : Next
			fnPlayNext();
		} else if (e.keyCode == 80) { // p : Prev
			fnPlayPrev();
		} else if (e.keyCode == 76) { // l : Like
			fnPlayerLikeAct();
		} else if (e.keyCode == 49) { // 1 : List
			fnShowMenu('tab_1');
		} else if (e.keyCode == 50) { // 2 : Lyrics
			fnShowMenu('tab_2');
		} else if (e.keyCode == 65) { // A : A-B repeat
			if (startPoint === -1){
				// Save Position
				startPoint = music_control.controllerTime;

				// Show A Text on AlbumArt
				repeatDiv.text("A");
				repeatDiv.insertAfter("#AlbumImgArea");
			} else if (endPoint === -1){
				endPoint = music_control.controllerTime;
				
				// Exception Handling ( startPoint > endPoint )
				if (startPoint > endPoint) {
					startPoint = -1;
					endPoint = -1;
					repeatDiv.remove();
					return;
				}

				// Repeat Function
				var repeatFunc = function(){
					if (endPoint !== -1 && startPoint !== -1){
						if (music_control.controllerTime > endPoint) {
							GetPlayer().fnSetTime(startPoint);
						}
						setTimeout(repeatFunc,100);
					}
				};
				repeatFunc();
				
				// Show A-B Text on AlbumArt
				repeatDiv.text("A-B");

			} else {
				// Remove All Repeats
				startPoint = -1;
				endPoint = -1;
				repeatDiv.remove();
			}	
		}
	});

	$(document).keyup(function(e){
		if (e.keyCode == 37 || e.keyCode == 39){
			keyPressing = false;
		}
	});

	setTimeout(fnPlayOn,1000);
}

var script = document.createElement('script');
script.textContent = "("+keyFunc+")()";
(document.head||document.documentElement).appendChild(script);
