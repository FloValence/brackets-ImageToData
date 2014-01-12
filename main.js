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
/*global define, brackets, $, Image, document, require, Mustache, window */

require.config({
    paths: {
        "text" : "lib/text",
        "i18n" : "lib/i18n"
    },
    locale: brackets.getLocale()
});

define(function (require, exports, module) {
	"use strict";
	var BUTTON_CMD = "urlimage.convertit",
        CONTEXT_CMD = "getimage.convertit";

	// Brackets modules
	var AppInit				= brackets.getModule("utils/AppInit"),
		EditorManager       = brackets.getModule("editor/EditorManager"),
		ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
		DocumentManager     = brackets.getModule("document/DocumentManager"),
		CommandManager      = brackets.getModule("command/CommandManager"),
		KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        ProjectManager      = brackets.getModule("project/ProjectManager"),
		Menus				= brackets.getModule("command/Menus"),
		Dialogs             = brackets.getModule("widgets/Dialogs"),
		Strings             = brackets.getModule("strings");
    
    var projectMenu         = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);

	// local modules
	var mainDialog		= require("text!html/itd-dialog.html"),
		idtToolbarHtml	= require("text!html/itd-toolbar.html");


	var Trad             = require("strings");

	var $toolbarIcon	= $(idtToolbarHtml),
		$mainDialog,
        localURL,
        dataURL;

	function loadImage(imgUrl, $getBodyControl) {
		// The convert to data trick
		var imgee = new Image();
		imgee.src = imgUrl;
		imgee.onload = function () {

			var canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(this, 0, 0);

			var dataURL = canvas.toDataURL("image/png");
			// Finally showing the result
			$getBodyControl.html(Trad.COPY_THAT + " : <br><textarea class='data'>" + dataURL + "</textarea><br>" + Trad.IMAGE_CONV + " : <br><img class='sucked' src='" + imgUrl + "'>");
		};
	}
    
    function convertToData(imgUrl) {
		// The convert to data trick
		var imgee = new Image();
		imgee.src = imgUrl;
		imgee.onload = function () {

			var canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(this, 0, 0);

			dataURL = canvas.toDataURL("image/png");
            
            $('body').trigger('convertCompleted');
            
        };
    }
    
    function showData(data, imgUrl, $getBodyControl) {
        
        // Finally showing the result
        $getBodyControl.html(Trad.COPY_THAT + " : <br><textarea class='data'>" + data + "</textarea><br>" + Trad.IMAGE_CONV + " : <br><img class='sucked' src='" + imgUrl + "'>");
        $getBodyControl.find(".data").focus();
    }
    
    
/*    Functions used when right clicking an image in the project bar */
    
    // determine if a file is an image that can be convert
    // parameter : entry - the current file entry object containing the file name
    function determineFileType(fileEntry) {
        if (fileEntry && fileEntry.fullPath && fileEntry.fullPath.match(/\.png$|.jpg$|.gif$/)) {
            return "image";
        } else {
            return "unknown";
        }
    }
    
    
    
    // Removes menu item
    function cleanMenu(menu) {
        menu.removeMenuItem(CONTEXT_CMD);
    }
    
    //adds a menuitem to a menu if the current file matches a known type
    //parameters: menu - the context menu or working files menu
    //           entry - the current file entry object containing the file name

    function checkFileTypes(menu, entry) {
        if (entry === null) {
            return "unknown";
        }
        var type = determineFileType(entry);
        if (type === "image") {
            menu.addMenuItem(CONTEXT_CMD, "", Menus.LAST);
        }
    }
    
    // check if the extension should add a menu item to the project menu (under the project name, left panel)
    $(projectMenu).on("beforeContextMenuOpen", function (evt) {
        var selectedEntry = ProjectManager.getSelectedItem(),
            text = '';
        if (selectedEntry && selectedEntry.fullPath && DocumentManager.getCurrentDocument() !== null && selectedEntry.fullPath === DocumentManager.getCurrentDocument().file.fullPath) {
            text = DocumentManager.getCurrentDocument().getText();
        }
        cleanMenu(projectMenu);
        localURL = selectedEntry.fullPath;
        checkFileTypes(projectMenu, selectedEntry, text);
    });
    

    
    
/*    Functions used when clicking the extention button */
    
//    Create dynamic path for local files
    function localPath(img) {
        return window.URL.createObjectURL(img);
    }

//    Open the dialog box and initialize the elements
	function openConvertDialog() {

		var $dlg,
			$getUrlControl,
            $getLocalUrlControl,
            $getLocalLabel,
			$getBodyControl;
        

		$dlg = $mainDialog;

		Dialogs.showModalDialogUsingTemplate($dlg);

		// URL input
		$getUrlControl = $dlg.find(".get-url");
		$getUrlControl.focus();
        
        // File input
        $getLocalUrlControl = $dlg.find(".get-local");
        $getLocalLabel = $dlg.find("[for='get-local']");
        $getLocalUrlControl.change(function () {
            var image = this.files[0];
            $getLocalLabel.html(image.name);
            $getUrlControl.html("");
        });

		// ModalBody
		$getBodyControl = $dlg.find(".data-show");

		// add OK button handler
		$dlg.on("click", ".dialog-button-ext", function () {
			$getBodyControl.empty();
			var imgUrl = $getUrlControl.val() || localPath($getLocalUrlControl[0].files[0]) || "";
			// Ready ? Let's go !
			if (imgUrl !== "") {
				loadImage(imgUrl, $getBodyControl);
			}
		});
        
        return $dlg;
	}
       
    
    // Launch the extension to directly return the data URI of the selected image
    function convertFromTree() {
        var $dlg = openConvertDialog();
        convertToData(localURL);
        $('body').on('convertCompleted', function () {
            showData(dataURL, localURL, $dlg.find(".data-show"));
        });
    }

	// load everything when brackets is done loading
	AppInit.appReady(function () {
		$toolbarIcon.appendTo("#main-toolbar .buttons");
		$toolbarIcon.on('click', openConvertDialog);
		// CSS
		ExtensionUtils.loadStyleSheet(module, "style/style.css");
	});

	CommandManager.register(Trad.COMMAND_NAME, BUTTON_CMD, openConvertDialog);
	CommandManager.register(Trad.COMMAND_NAME, CONTEXT_CMD, convertFromTree);
	KeyBindingManager.addBinding(BUTTON_CMD, "Alt-Shift-G");

	var menu = Menus.getMenu(Menus.AppMenuBar.NAVIGATE_MENU);
	menu.addMenuItem(BUTTON_CMD);

	$mainDialog = $(Mustache.render(mainDialog, Trad));

});
