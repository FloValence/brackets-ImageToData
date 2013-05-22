/*
 * Copyright (c) 2013 Florian Valence. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, Image, document */

define(function (require, exports, module) {
	"use strict";
	var COMMAND_ID = "getimage.getimage";

	// Brackets modules
	var EditorManager       = brackets.getModule("editor/EditorManager"),
		DocumentManager     = brackets.getModule("document/DocumentManager"),
		NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
		CommandManager      = brackets.getModule("command/CommandManager"),
		KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
		Dialogs             = brackets.getModule("widgets/Dialogs"),
		Strings             = brackets.getModule("strings");

	// local modules
	var mainDialog       = require("text!dialog.html");

	function getBase64Image(imgUrl, $getBodyControl) {
		var imgee = new Image();
		imgee.src = imgUrl;
		imgee.onload = function () {


			var canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(this, 0, 0);


			var dataURL = canvas.toDataURL("image/png");

			$getBodyControl.append("<textarea id='data' style='height:80px; width:100%'>" + dataURL + "</textarea>");
		};
	}
//    test url    http://images.gs-cdn.net/static/users/40_user.png


	function loadImage(imgUrl, $getBodyControl) {
		$getBodyControl.append("<br>Here is the image : <br><img class='sucked' style='max-width:550px; max-height:560px' src='" + imgUrl + "'><br>And now just copy that : <br>");
		getBase64Image(imgUrl, $getBodyControl);
	}

	function launchUrlDialog(imgUrl) {

		var $dlg,
			$title,
			$getUrlControl,
			$getBodyControl;

		$dlg = $(mainDialog);
		Dialogs.showModalDialogUsingTemplate($dlg);
		// we implement our own OK button handler so we have

		// URL input
		$getUrlControl = $dlg.find(".get-url");
		$getUrlControl.focus();

		// ModalBody
		$getBodyControl = $dlg.find(".data-show");

		// add OK button handler
		$dlg.on("click", ".dialog-button-ext", function (e) {
			$getBodyControl.empty();
			var imgUrl = $getUrlControl.val();
			console.log("Sucking" + imgUrl);
			loadImage(imgUrl, $getBodyControl);
		});

	}

	CommandManager.register("Edit File", COMMAND_ID, launchUrlDialog);
	KeyBindingManager.addBinding(COMMAND_ID, "Alt-Shift-G");
});
