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
/*global define, brackets, $, Image, document, require, Mustache, window, PathUtils */

require.config({
    paths: {
        "text" : "lib/text",
        "i18n" : "lib/i18n"
    },
    locale: brackets.getLocale()
});

define(function (require, exports, module) {
    "use strict";
    var COMMAND_ID = "getimage.convertit";
    
    // Brackets modules
    var AppInit				= brackets.getModule("utils/AppInit"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        Menus				= brackets.getModule("command/Menus"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        Strings             = brackets.getModule("strings");
    
    // local modules
    var mainDialog		= require("text!html/itd-dialog.html"),
        idtToolbarHtml	= require("text!html/itd-toolbar.html");
    
    var Trad             = require("strings");
    
    var $toolbarIcon	= $(idtToolbarHtml),
        $mainDialog;
    
    var currentDoc;
    
    function loadImage(imgUrl, $getBodyControl, $getload) {
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
            $getBodyControl.append(Trad.COPY_THAT + " : <br><textarea class='data'>" + dataURL + "</textarea><br>" + Trad.IMAGE_CONV + " : <br><img class='sucked' src='" + imgUrl + "'>");
        };
    }
    
    function localPath(img) {
        //return img;
        
        return window.URL.createObjectURL(img);
    }
    
    function launchUrlDialog() {
        
        var $dlg,
            $getUrlControl,
            $getLocalUrlControl,
            $getLocalLabel,
            $getBodyControl,
            $getload;
        
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
        
        // Loading Image
        $getload = $dlg.find(".loading");
        
        // add OK button handler
        $dlg.on("click", ".dialog-button-ext", function () {
            $getBodyControl.empty();
            var imgUrl = $getUrlControl.val() || localPath($getLocalUrlControl[0].files[0]) || "";
            // Ready ? Let's go !
            if (imgUrl !== "") {
                loadImage(imgUrl, $getBodyControl, $getload);
            }
        });
    }
    
    function _setPanelVisibility(isVisible) {
        console.log(isVisible);
    }
    
    function currentDocChangedHandler() {
        var doc = DocumentManager.getCurrentDocument(),
            ext = doc ? PathUtils.filenameExtension(doc.file.fullPath).toLowerCase() : "";
        
        console.log(DocumentManager.getCurrentDocument());
        
        if (currentDoc) {
            //$(currentDoc).off("change", _documentChange);
            currentDoc = null;
        }
        
        if (doc && /jpg|png|gif/.test(ext)) {
            currentDoc = doc;
            console.log(doc);
            //$(currentDoc).on("change", _documentChange);
            //$icon.css({display: "block"});
            _setPanelVisibility("visible");
            //_loadDoc(doc);
        } else {
            //$icon.css({display: "none"});
            _setPanelVisibility(false);
        }
    }
    
    // Add a document change handler
    $(DocumentManager).on("currentDocumentChange", currentDocChangedHandler);
    
    // load everything when brackets is done loading
    AppInit.appReady(function () {
        $toolbarIcon.appendTo("#main-toolbar .buttons");
        $toolbarIcon.on('click', launchUrlDialog);
        // CSS
        ExtensionUtils.loadStyleSheet(module, "style/style.css");
    });
    
    CommandManager.register(Trad.COMMAND_NAME, COMMAND_ID, launchUrlDialog);
    KeyBindingManager.addBinding(COMMAND_ID, "Alt-Shift-G");
    
    var menu = Menus.getMenu(Menus.AppMenuBar.NAVIGATE_MENU);
    menu.addMenuItem(COMMAND_ID);
    
    $mainDialog = $(Mustache.render(mainDialog, Trad));
    
});
