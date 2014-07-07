/*
*  The "codemirror" plugin. It's indented to enhance the
*  "sourcearea" editing mode, which displays the xhtml source code with
*  syntax highlight and line numbers.
* Licensed under the MIT license
* CodeMirror Plugin: http://codemirror.net/ (MIT License)
*/

(function($) {
    CKEDITOR.plugins.add('codemirror', {
        icons: 'searchcode,autoformat,commentselectedrange,uncommentselectedrange,autocomplete',
        lang: 'fr-ca,fr', // %REMOVE_LINE_CORE%
        version: 1.11,
        init: function (editor) {
            var rootPath = this.path,
                defaultConfig = {
                    autoCloseBrackets: true,
                    autoCloseTags: true,
                    autoFormatOnStart: false,
                    autoFormatOnUncomment: true,
                    continueComments: true,
                    enableCodeFolding: true,
                    enableCodeFormatting: true,
                    enableSearchTools: true,
                    highlightActiveLine: true,
                    highlightMatches: true,
                    indentWithTabs: false,
                    lineNumbers: true,
                    lineWrapping: true,
                    mode: 'htmlmixed',
                    matchBrackets: true,
                    matchTags: true,
                    showAutoCompleteButton: true,
                    showCommentButton: true,
                    showFormatButton: true,
                    showSearchButton: true,
                    showTrailingSpace: true,
                    showUncommentButton: true,
                    theme: 'default',
                    useBeautify: false
                };

            // Get Config & Lang
            var config = CKEDITOR.tools.extend(defaultConfig, editor.config.codemirror || {}, true),
                lang = editor.lang.codemirror;

            // check for old config settings for legacy support
            if (editor.config.codemirror_theme) {
                config.theme = editor.config.codemirror_theme;
            }
            if (editor.config.codemirror_autoFormatOnStart) {
                config.autoFormatOnStart = editor.config.codemirror_autoFormatOnStart;
            }

            // automatically switch to bbcode mode if bbcode plugin is enabled
            if (editor.plugins.bbcode && config.mode.indexOf("bbcode") <= 0) {
                config.mode = "bbcode";
            }

            // Source mode isn't available in inline mode yet.
            if (editor.elementMode === CKEDITOR.ELEMENT_MODE_INLINE) {

                // Override Source Dialog
                CKEDITOR.dialog.add('sourcedialog', function (editor) {
                    var size = CKEDITOR.document.getWindow().getViewPaneSize(),
                        width = Math.min(size.width - 70, 800),
                        height = size.height / 1.5,
                        oldData;

                    function loadCodeMirrorInline(editor, textarea) {
                        var delay;

                        window["codemirror_" + editor.id] = CodeMirror.fromTextArea(textarea, {
                            mode: config.mode,
                            matchBrackets: config.matchBrackets,
                            matchTags: config.matchTags,
                            workDelay: 300,
                            workTime: 35,
                            readOnly: editor.config.readOnly,
                            lineNumbers: config.lineNumbers,
                            lineWrapping: config.lineWrapping,
                            autoCloseTags: config.autoCloseTags,
                            autoCloseBrackets: config.autoCloseBrackets,
                            highligctionMatches: config.highlightMatches,
                            continueComments: config.continueComments,
                            indentWithTabs: config.indentWithTabs,
                            theme: config.theme,
                            showTrailingSpace: config.showTrailingSpace,
                            showCursorWhenSelecting: true,
                            viewportMargin: Infinity,
                            //extraKeys: {"Ctrl-Space": "autocomplete"},
                            extraKeys: { "Ctrl-Q": function (codeMirror_Editor) { window["foldFunc_" + editor.id](codeMirror_Editor, codeMirror_Editor.getCursor().line); } },
                            onKeyEvent: function (codeMirror_Editor, evt) {
                                if (config.enableCodeFormatting) {
                                    var range = getSelectedRange();
                                    if (evt.type === "keydown" && evt.ctrlKey && evt.keyCode === 75 && !evt.shiftKey && !evt.altKey) {
                                        window["codemirror_" + editor.id].commentRange(true, range.from, range.to);
                                    } else if (evt.type === "keydown" && evt.ctrlKey && evt.keyCode === 75 && evt.shiftKey && !evt.altKey) {
                                        window["codemirror_" + editor.id].commentRange(false, range.from, range.to);
                                        if (config.autoFormatOnUncomment) {
                                            window["codemirror_" + editor.id].autoFormatRange(range.from, range.to);
                                        }
                                    } else if (evt.type === "keydown" && evt.ctrlKey && evt.keyCode === 75 && !evt.shiftKey && evt.altKey) {
                                        window["codemirror_" + editor.id].autoFormatRange(range.from, range.to);
                                    }
                                    /*else if (evt.type === "keydown") {
                                        CodeMirror.commands.newlineAndIndentContinueMarkdownList(window["codemirror_" + editor.id]);
                                    }*/
                                }
                            }
                        });

                        var holderHeight = height + 'px';
                        var holderWidth = width + 'px';

                        // Store config so we can access it within commands etc.
                        window["codemirror_" + editor.id].config = config;

                        if (config.autoFormatOnStart) {
                            if (config.useBeautify) {
                                var indent_size = 4,
                                    indent_char = ' ',
                                    brace_style = 'collapse'; //collapse, expand, end-expand

                                var source = window["codemirror_" + editor.id].getValue();

                                window["codemirror_" + editor.id].setValue(html_beautify(source, indent_size, indent_char, 120, brace_style));
                            } else {
                                window["codemirror_" + editor.id].autoFormatAll({
                                    line: 0,
                                    ch: 0
                                }, {
                                    line: window["codemirror_" + editor.id].lineCount(),
                                    ch: 0
                                });
                            }
                        }

                        function getSelectedRange() {
                            return {
                                from: window["codemirror_" + editor.id].getCursor(true),
                                to: window["codemirror_" + editor.id].getCursor(false)
                            };
                        }

                        window["codemirror_" + editor.id].on("change", function () {
                            clearTimeout(delay);
                            delay = setTimeout(function () {
                                var cm = window["codemirror_" + editor.id];

                                if (cm) {
                                    cm.save();
                                }
                            }, 300);
                        });

                        window["codemirror_" + editor.id].setSize(holderWidth, holderHeight);

                        // Enable Code Folding (Requires 'lineNumbers' to be set to 'true')
                        if (config.lineNumbers && config.enableCodeFolding) {
                            window["codemirror_" + editor.id].on("gutterClick", window["foldFunc_" + editor.id]);
                        }
                        // Highlight Active Line
                        if (config.highlightActiveLine) {
                            window["codemirror_" + editor.id].hlLine = window["codemirror_" + editor.id].addLineClass(0, "background", "activeline");
                            window["codemirror_" + editor.id].on("cursorActivity", function () {
                                var cur = window["codemirror_" + editor.id].getLineHandle(window["codemirror_" + editor.id].getCursor().line);
                                if (cur != window["codemirror_" + editor.id].hlLine) {
                                    window["codemirror_" + editor.id].removeLineClass(window["codemirror_" + editor.id].hlLine, "background", "activeline");
                                    window["codemirror_" + editor.id].hlLine = window["codemirror_" + editor.id].addLineClass(cur, "background", "activeline");
                                }
                            });
                        }

                        // Run config.onLoad callback, if present.
                        if (typeof config.onLoad === 'function') {
                            config.onLoad(window["codemirror_" + editor.id], editor);
                        }
                    }

                    return {
                        title: editor.lang.sourcedialog.title,
                        minWidth: width,
                        minHeight: height,
                        resizable : CKEDITOR.DIALOG_RESIZE_NONE,
                        onShow: function () {
                            // Set Elements
                            this.getContentElement('main', 'data').focus();
                            this.getContentElement('main', 'AutoComplete').setValue(config.autoCloseTags, true);

                            var textArea = this.getContentElement('main', 'data').getInputElement().$;

                            // Load the content
                            this.setValueOf('main', 'data', oldData = editor.getData());

                            if (typeof (CodeMirror) == 'undefined') {

                                CKEDITOR.document.appendStyleSheet(rootPath + 'css/codemirror.min.css');

                                if (config.theme.length && config.theme != 'default') {
                                    CKEDITOR.document.appendStyleSheet(rootPath + 'theme/' + config.theme + '.css');
                                }

                                CKEDITOR.scriptLoader.load(rootPath + 'js/codemirror.min.js', function () {

                                    CKEDITOR.scriptLoader.load(getCodeMirrorScripts(), function () {
                                        loadCodeMirrorInline(editor, textArea);
                                    });
                                });


                            } else {
                                loadCodeMirrorInline(editor, textArea);
                            }


                        },
                        onCancel: function (event) {
                            if (event.data.hide) {
                                window["codemirror_" + editor.id].toTextArea();

                                // Free Memory
                                window["codemirror_" + editor.id] = null;
                            }
                        },
                        onOk: (function () {

                            function setData(newData) {
                                var that = this;

                                editor.setData(newData, function () {
                                    that.hide();

                                    // Ensure correct selection.
                                    var range = editor.createRange();
                                    range.moveToElementEditStart(editor.editable());
                                    range.select();
                                });
                            }

                            return function () {
                                window["codemirror_" + editor.id].toTextArea();

                                // Free Memory
                                window["codemirror_" + editor.id] = null;

                                // Remove CR from input data for reliable comparison with editor data.
                                var newData = this.getValueOf('main', 'data').replace(/\r/g, '');

                                // Avoid unnecessary setData. Also preserve selection
                                // when user changed his mind and goes back to wysiwyg editing.
                                if (newData === oldData)
                                    return true;

                                // Set data asynchronously to avoid errors in IE.
                                CKEDITOR.env.ie ? CKEDITOR.tools.setTimeout(setData, 0, this, newData) : setData.call(this, newData);

                                // Don't let the dialog close before setData is over.
                                return false;
                            };
                        })(),

                        contents: [{
                            id: 'main',
                            label: editor.lang.sourcedialog.title,
                            elements: [
                                {
                                    type: 'hbox',
                                    style: 'width: 80px;margin:0;',
                                    widths: ['20px', '20px', '20px', '20px'],
                                    children: [
                                        {
                                            type: 'button',
                                            id: 'searchCode',
                                            label: '',
                                            title: lang.searchCode,
                                            'class': 'searchCodeButton',
                                            onClick: function() {
                                                CodeMirror.commands.find(window["codemirror_" + editor.id]);
                                            }
                                        }, {
                                            type: 'button',
                                            id: 'autoFormat',
                                            label: '',
                                            title: lang.autoFormat,
                                            'class': 'autoFormat',
                                            onClick: function() {
                                                var range = {
                                                    from: window["codemirror_" + editor.id].getCursor(true),
                                                    to: window["codemirror_" + editor.id].getCursor(false)
                                                };
                                                window["codemirror_" + editor.id].autoFormatRange(range.from, range.to);
                                            }
                                        }, {
                                            type: 'button',
                                            id: 'CommentSelectedRange',
                                            label: '',
                                            title: lang.commentSelectedRange,
                                            'class': 'CommentSelectedRange',
                                            onClick: function () {
                                                var range = {
                                                    from: window["codemirror_" + editor.id].getCursor(true),
                                                    to: window["codemirror_" + editor.id].getCursor(false)
                                                };
                                                window["codemirror_" + editor.id].commentRange(true, range.from, range.to);
                                            }
                                        }, {
                                            type: 'button',
                                            id: 'UncommentSelectedRange',
                                            label: '',
                                            title: lang.uncommentSelectedRange,
                                            'class': 'UncommentSelectedRange',
                                            onClick: function () {
                                                var range = {
                                                    from: window["codemirror_" + editor.id].getCursor(true),
                                                    to: window["codemirror_" + editor.id].getCursor(false)
                                                };
                                                window["codemirror_" + editor.id].commentRange(false, range.from, range.to);
                                                if (window["codemirror_" + editor.id].config.autoFormatOnUncomment) {
                                                    window["codemirror_" + editor.id].autoFormatRange(range.from, range.to);
                                                }
                                            }
                                        }]
                                }, {
                                    type: 'checkbox',
                                    id: 'AutoComplete',
                                    label: lang.autoCompleteToggle,
                                    title: lang.autoCompleteToggle,
                                    onChange: function () {
                                        window["codemirror_" + editor.id].setOption("autoCloseTags", this.getValue());
                                    }
                                }, {
                                    type: 'textarea',
                                    id: 'data',
                                    dir: 'ltr',
                                    inputStyle: 'cursor:auto;' +
                                        'width:' + width + 'px;' +
                                        'height:' + height + 'px;' +
                                        'tab-size:4;' +
                                        'text-align:left;',
                                    'class': 'cke_source cke_enable_context_menu'
                                }
                            ]
                        }]
                    };
                });

                return;
            }

            /*
            // Override Copy Button
            if (editor.commands.copy) {
                editor.commands.copy.modes = {
                    wysiwyg: 1,
                    source: 1
                };

                // TODO
            }

            // Override Paste Button
            if (editor.commands.paste) {
                editor.commands.paste.modes = {
                    wysiwyg: 1,
                    source: 1
                };
                // TODO

            }

            // Override Cut Button
            if (editor.commands.cut) {
                editor.commands.cut.modes = {
                    wysiwyg: 1,
                    source: 1
                };

                // TODO
            }*/

            // Override Find Button
            if (editor.commands.find) {
                editor.commands.find.modes = {
                    wysiwyg: 1,
                    source: 1
                };

                editor.commands.find.exec = function() {
                    if (editor.mode === 'wysiwyg') {
                        editor.openDialog('find');
                    } else {
                        CodeMirror.commands.find(window["codemirror_" + editor.id]);
                    }
                };
            }

            // Override Replace Button
            if (editor.commands.replace) {
                editor.commands.replace.modes = {
                    wysiwyg: 1,
                    source: 1
                };

                editor.commands.replace.exec = function () {
                    if (editor.mode === 'wysiwyg') {
                        editor.openDialog('replace');
                    } else {
                        CodeMirror.commands.replace(window["codemirror_" + editor.id]);
                    }
                };
            }

            var sourcearea = CKEDITOR.plugins.sourcearea;

            // check if sourcearea plugin is overrriden
            if (!sourcearea.commands.searchCode) {

                CKEDITOR.plugins.sourcearea.commands = {
                    source: {
                        modes: {
                            wysiwyg: 1,
                            source: 1
                        },
                        editorFocus: false,
                        readOnly: 1,
                        exec: function(editorInstance) {
                            if (editorInstance.mode === 'wysiwyg') {
                                editorInstance.fire('saveSnapshot');
                            }
                            editorInstance.getCommand('source').setState(CKEDITOR.TRISTATE_DISABLED);
                            editorInstance.setMode(editorInstance.mode === 'source' ? 'wysiwyg' : 'source');
                        },
                        canUndo: false
                    },
                    searchCode: {
                        modes: {
                            wysiwyg: 0,
                            source: 1
                        },
                        editorFocus: false,
                        readOnly: 1,
                        exec: function (editorInstance) {
                            CodeMirror.commands.find(window["codemirror_" + editorInstance.id]);
                        },
                        canUndo: true
                    },
                    autoFormat: {
                        modes: {
                            wysiwyg: 0,
                            source: 1
                        },
                        editorFocus: false,
                        readOnly: 1,
                        exec: function (editorInstance) {
                            var range = {
                                from: window["codemirror_" + editorInstance.id].getCursor(true),
                                to: window["codemirror_" + editorInstance.id].getCursor(false)
                            };
                            window["codemirror_" + editorInstance.id].autoFormatRange(range.from, range.to);
                        },
                        canUndo: true
                    },
                    commentSelectedRange: {
                        modes: {
                            wysiwyg: 0,
                            source: 1
                        },
                        editorFocus: false,
                        readOnly: 1,
                        exec: function (editorInstance) {
                            var range = {
                                from: window["codemirror_" + editorInstance.id].getCursor(true),
                                to: window["codemirror_" + editorInstance.id].getCursor(false)
                            };
                            window["codemirror_" + editorInstance.id].commentRange(true, range.from, range.to);
                        },
                        canUndo: true
                    },
                    uncommentSelectedRange: {
                        modes: {
                            wysiwyg: 0,
                            source: 1
                        },
                        editorFocus: false,
                        readOnly: 1,
                        exec: function (editorInstance) {
                            var range = {
                                from: window["codemirror_" + editorInstance.id].getCursor(true),
                                to: window["codemirror_" + editorInstance.id].getCursor(false)
                            };
                            window["codemirror_" + editorInstance.id].commentRange(false, range.from, range.to);
                            if (window["codemirror_" + editorInstance.id].config.autoFormatOnUncomment) {
                                window["codemirror_" + editorInstance.id].autoFormatRange(
                                    range.from,
                                    range.to);
                            }
                        },
                        canUndo: true
                    },
                    autoCompleteToggle: {
                        modes: {
                            wysiwyg: 0,
                            source: 1
                        },
                        editorFocus: false,
                        readOnly: 1,
                        exec: function (editorInstance) {
                            if (this.state == CKEDITOR.TRISTATE_ON) {
                                window["codemirror_" + editorInstance.id].setOption("autoCloseTags", false);
                            } else if (this.state == CKEDITOR.TRISTATE_OFF) {
                                window["codemirror_" + editorInstance.id].setOption("autoCloseTags", true);
                            }

                            this.toggleState();
                        },
                        canUndo: true
                    }
                };
            }




            editor.addMode('source', function(callback) {
                if (typeof (CodeMirror) == 'undefined') {

                    CKEDITOR.document.appendStyleSheet(rootPath + 'css/codemirror.min.css');

                    if (config.theme.length && config.theme != 'default') {
                        CKEDITOR.document.appendStyleSheet(rootPath + 'theme/' + config.theme + '.css');
                    }

                    CKEDITOR.scriptLoader.load(rootPath + 'js/codemirror.min.js', function() {

                        CKEDITOR.scriptLoader.load(getCodeMirrorScripts(), function() {
                            loadCodeMirror(editor);
                            callback();
                        });
                    });


                } else {
                    loadCodeMirror(editor);
                    callback();
                }
            });

            function getCodeMirrorScripts() {
                var scriptFiles = [rootPath + 'js/codemirror.addons.min.js'];

                switch (config.mode) {
                case "bbcode":
                    {
                        scriptFiles.push(rootPath + 'js/codemirror.mode.bbcode.min.js');
                    }

                    break;
                case "bbcodemixed":
                        {
                            scriptFiles.push(rootPath + 'js/codemirror.mode.bbcodemixed.min.js');
                        }

                        break;
                case "htmlmixed":
                    {
                        scriptFiles.push(rootPath + 'js/codemirror.mode.htmlmixed.min.js');
                    }

                    break;
                case "text/html":
                    {
                        scriptFiles.push(rootPath + 'js/codemirror.mode.htmlmixed.min.js');
                    }

                    break;
                case "application/x-httpd-php":
                    {
                        scriptFiles.push(rootPath + 'js/codemirror.mode.php.min.js');
                    }

                    break;
                case "text/javascript":
                    {
                        scriptFiles.push(rootPath + 'js/codemirror.mode.javascript.min.js');
                    }

                    break;
                default:
                    scriptFiles.push(rootPath + 'js/codemirror.mode.htmlmixed.min.js');
                }

                if (config.useBeautify) {
                    scriptFiles.push(rootPath + 'js/beautify.min.js');
                }

                if (config.enableSearchTools) {
                    scriptFiles.push(rootPath + 'js/codemirror.addons.search.min.js');
                }
                return scriptFiles;
            }

            function loadCodeMirror(editor) {
                var contentsSpace = editor.ui.space('contents'),
                    textarea = contentsSpace.getDocument().createElement('textarea');

                textarea.setStyles(
                    CKEDITOR.tools.extend({
                            // IE7 has overflow the <textarea> from wrapping table cell.
                            width: CKEDITOR.env.ie7Compat ? '99%' : '100%',
                            height: '100%',
                            resize: 'none',
                            outline: 'none',
                            'text-align': 'left'
                        },
                        CKEDITOR.tools.cssVendorPrefix('tab-size', editor.config.sourceAreaTabSize || 4)));
                var ariaLabel = [editor.lang.editor, editor.name].join(',');
                textarea.setAttributes({
                    dir: 'ltr',
                    tabIndex: CKEDITOR.env.webkit ? -1 : editor.tabIndex,
                    'role': 'textbox',
                    'aria-label': ariaLabel
                });
                textarea.addClass('cke_source cke_reset cke_enable_context_menu');
                editor.ui.space('contents').append(textarea);
                window["editable_" + editor.id] = editor.editable(new sourceEditable(editor, textarea));
                // Fill the textarea with the current editor data.
                window["editable_" + editor.id].setData(editor.getData(1));
                window["editable_" + editor.id].editorID = editor.id;
                editor.fire('ariaWidget', this);
                var delay;
                var sourceAreaElement = window["editable_" + editor.id],
                    holderElement = sourceAreaElement.getParent();

                /*CodeMirror.commands.autocomplete = function(cm) {
                    CodeMirror.showHint(cm, CodeMirror.htmlHint);
                };*/

                // Enable Code Folding (Requires 'lineNumbers' to be set to 'true')
                if (config.lineNumbers && config.enableCodeFolding) {
                    window["foldFunc_" + editor.id] = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
                }

                window["codemirror_" + editor.id] = CodeMirror.fromTextArea(sourceAreaElement.$, {
                    mode: config.mode,
                    matchBrackets: config.matchBrackets,
                    matchTags: config.matchTags,
                    workDelay: 300,
                    workTime: 35,
                    readOnly: editor.config.readOnly,
                    lineNumbers: config.lineNumbers,
                    lineWrapping: config.lineWrapping,
                    autoCloseTags: config.autoCloseTags,
                    autoCloseBrackets: config.autoCloseBrackets,
                    highlightSelectionMatches: config.highlightMatches,
                    continueComments: config.continueComments,
                    indentWithTabs: config.indentWithTabs,
                    theme: config.theme,
                    showTrailingSpace: config.showTrailingSpace,
                    showCursorWhenSelecting: true,
                    //extraKeys: {"Ctrl-Space": "autocomplete"},
                    extraKeys: { "Ctrl-Q": function (codeMirror_Editor) { window["foldFunc_" + editor.id](codeMirror_Editor, codeMirror_Editor.getCursor().line); } },
                    onKeyEvent: function (codeMirror_Editor, evt) {

                        if (config.enableCodeFormatting) {
                            var range = getSelectedRange();
                            if (evt.type === "keydown" && evt.ctrlKey && evt.keyCode === 75 && !evt.shiftKey && !evt.altKey) {
                                window["codemirror_" + editor.id].commentRange(true, range.from, range.to);
                            } else if (evt.type === "keydown" && evt.ctrlKey && evt.keyCode === 75 && evt.shiftKey && !evt.altKey) {
                                window["codemirror_" + editor.id].commentRange(false, range.from, range.to);
                                if (config.autoFormatOnUncomment) {
                                    window["codemirror_" + editor.id].autoFormatRange(range.from, range.to);
                                }
                            } else if (evt.type === "keydown" && evt.ctrlKey && evt.keyCode === 75 && !evt.shiftKey && evt.altKey) {
                                window["codemirror_" + editor.id].autoFormatRange(range.from, range.to);
                            }/* else if (evt.type === "keydown") {
                                CodeMirror.commands.newlineAndIndentContinueMarkdownList(window["codemirror_" + editor.id]);
                            }*/
                        }
                    }
                });

                var holderHeight = holderElement.$.clientHeight == 0 ? editor.ui.space('contents').getStyle('height') : holderElement.$.clientHeight + 'px';
                var holderWidth = holderElement.$.clientWidth + 'px';

                // Store config so we can access it within commands etc.
                window["codemirror_" + editor.id].config = config;
                if (config.autoFormatOnStart) {
                    if (config.useBeautify) {
                        var indent_size = 4;
                        var indent_char = ' ';
                        var brace_style = 'collapse'; //collapse, expand, end-expand

                        var source = window["codemirror_" + editor.id].getValue();

                        window["codemirror_" + editor.id].setValue(html_beautify(source, indent_size, indent_char, 120, brace_style));
                    } else {
                        window["codemirror_" + editor.id].autoFormatAll({
                            line: 0,
                            ch: 0
                        }, {
                            line: window["codemirror_" + editor.id].lineCount(),
                            ch: 0
                        });
                    }
                }

                function getSelectedRange() {
                    return {
                        from: window["codemirror_" + editor.id].getCursor(true),
                        to: window["codemirror_" + editor.id].getCursor(false)
                    };
                }

                window["codemirror_" + editor.id].on("change", function () {
                    clearTimeout(delay);
                    delay = setTimeout(function () {
                        var cm = window["codemirror_" + editor.id];

                        if (cm) {
                            cm.save();
                        }
                    }, 300);
                });

                window["codemirror_" + editor.id].setSize(null, holderHeight);

                // Enable Code Folding (Requires 'lineNumbers' to be set to 'true')
                if (config.lineNumbers && config.enableCodeFolding) {
                    window["codemirror_" + editor.id].on("gutterClick", window["foldFunc_" + editor.id]);
                }
                // Highlight Active Line
                if (config.highlightActiveLine) {
                    window["codemirror_" + editor.id].hlLine = window["codemirror_" + editor.id].addLineClass(0, "background", "activeline");
                    window["codemirror_" + editor.id].on("cursorActivity", function () {
                        try {
                            var cur = window["codemirror_" + editor.id].getLineHandle(window["codemirror_" + editor.id].getCursor().line);
                        } catch(e) {
                            cur = null;
                        } finally {
                            if (cur != null) {
                                if (cur != window["codemirror_" + editor.id].hlLine) {
                                    window["codemirror_" + editor.id].removeLineClass(window["codemirror_" + editor.id].hlLine, "background", "activeline");
                                    window["codemirror_" + editor.id].hlLine = window["codemirror_" + editor.id].addLineClass(cur, "background", "activeline");
                                }
                            }
                        }
                    });
                }

                // Run config.onLoad callback, if present.
                if (typeof config.onLoad === 'function') {
                    config.onLoad(window["codemirror_" + editor.id], editor);
                }
            }

            editor.addCommand('source', sourcearea.commands.source);
            if (editor.ui.addButton) {
                editor.ui.addButton('Source', {
                    label: editor.lang.codemirror.toolbar,
                    command: 'source',
                    toolbar: 'mode,10'
                });
            }
            if (config.enableCodeFormatting) {
                editor.addCommand('searchCode', sourcearea.commands.searchCode);
                editor.addCommand('autoFormat', sourcearea.commands.autoFormat);
                editor.addCommand('commentSelectedRange', sourcearea.commands.commentSelectedRange);
                editor.addCommand('uncommentSelectedRange', sourcearea.commands.uncommentSelectedRange);
                editor.addCommand('autoCompleteToggle', sourcearea.commands.autoCompleteToggle);

                if (editor.ui.addButton) {
                    if (config.showFormatButton || config.showCommentButton || config.showUncommentButton || config.showSearchButton) {
                        editor.ui.add('-', CKEDITOR.UI_SEPARATOR, { toolbar: 'mode,30' });
                    }
                    /*if (config.showSearchButton && config.enableSearchTools) {
                        editor.ui.addButton('searchCode', {
                            label: lang.searchCode,
                            command: 'searchCode',
                            toolbar: 'mode,40'
                        });
                    }*/
                    if (config.showFormatButton) {
                        editor.ui.addButton('autoFormat', {
                            label: lang.autoFormat,
                            command: 'autoFormat',
                            toolbar: 'mode,50'
                        });
                    }
                    if (config.showCommentButton) {
                        editor.ui.addButton('CommentSelectedRange', {
                            label: lang.commentSelectedRange,
                            command: 'commentSelectedRange',
                            toolbar: 'mode,60'
                        });
                    }
                    if (config.showUncommentButton) {
                        editor.ui.addButton('UncommentSelectedRange', {
                            label: lang.uncommentSelectedRange,
                            command: 'uncommentSelectedRange',
                            toolbar: 'mode,70'
                        });
                    }
                    if (config.showAutoCompleteButton) {
                        editor.ui.addButton('AutoComplete', {
                            label: lang.autoCompleteToggle,
                            command: 'autoCompleteToggle',
                            toolbar: 'mode,80'
                        });
                    }
                }
            }

            editor.on('beforeModeUnload', function (evt) {
                if (editor.mode === 'source' && editor.plugins.textselection) {

                    var range = editor.getTextSelection();

                    range.startOffset = LineChannelToOffSet(window["codemirror_" + editor.id], window["codemirror_" + editor.id].getCursor(true));
                    range.endOffset = LineChannelToOffSet(window["codemirror_" + editor.id], window["codemirror_" + editor.id].getCursor(false));

                    // Fly the range when create bookmark.
                    delete range.element;
                    range.createBookmark();
                    sourceBookmark = true;

                    evt.data = range.content;
                }
            });
            editor.on('mode', function () {
                editor.getCommand('source').setState(editor.mode === 'source' ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF);

                if (editor.mode === 'source') {
                    editor.getCommand('autoCompleteToggle').setState(window["codemirror_" + editor.id].config.autoCloseTags ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF);

                    if (editor.plugins.textselection && textRange) {

                        //textRange.element = new CKEDITOR.dom.element(editor._.editable.$);
                        //textRange.select();

                        var start, end;

                        start = OffSetToLineChannel(window["codemirror_" + editor.id], textRange.startOffset);

                        if (typeof (textRange.endOffset) == 'undefined') {
                            window["codemirror_" + editor.id].focus();
                            window["codemirror_" + editor.id].setCursor(start);
                        } else {
                            window["codemirror_" + editor.id].focus();
                            end = OffSetToLineChannel(window["codemirror_" + editor.id], textRange.endOffset);
                            window["codemirror_" + editor.id].setSelection(start, end);
                        }
                    }
                }

            });
            editor.on('resize', function() {
                if (window["editable_" + editor.id] && editor.mode === 'source') {
                    var holderElement = window["editable_" + editor.id].getParent();
                    var holderHeight = holderElement.$.clientHeight + 'px';
                    var holderWidth = holderElement.$.clientWidth + 'px';
                    window["codemirror_" + editor.id].setSize(holderWidth, holderHeight);
                }
            });

            editor.on('readOnly', function () {
                if (window["editable_" + editor.id] && editor.mode === 'source') {
                    window["codemirror_" + editor.id].setOption("readOnly", this.readOnly);
                }
            });

            editor.on('instanceReady', function () {
                var selectAllCommand = editor.commands.selectAll;

                // Replace Complete SelectAll command from the plugin, otherwise it will not work in IE10
                if (selectAllCommand != null) {
                    selectAllCommand.exec = function () {
                        if (editor.mode === 'source') {
                            window["codemirror_" + editor.id].setSelection({
                                line: 0,
                                ch: 0
                            }, {
                                line: window["codemirror_" + editor.id].lineCount(),
                                ch: 0
                            });
                        } else {
                            var editable = editor.editable();
                            if (editable.is('body'))
                                editor.document.$.execCommand('SelectAll', false, null);
                            else {
                                var range = editor.createRange();
                                range.selectNodeContents(editable);
                                range.select();
                            }

                            // Force triggering selectionChange (#7008)
                            editor.forceNextSelectionCheck();
                            editor.selectionChange();
                        }
                    };
                }
            });

            if (typeof ($) != 'undefined' && $('a[data-toggle="tab"]') && window["codemirror_" + editor.id]) {
                $('a[data-toggle="tab"]').on('shown.bs.tab', function() {
                    window["codemirror_" + editor.id].refresh();
                });
            }

            editor.on('setData', function (data) {
                if (window["editable_" + editor.id] && editor.mode === 'source') {
                    window["codemirror_" + editor.id].setValue(data.data.dataValue);
                }
            });
        }
    });
    var sourceEditable = CKEDITOR.tools.createClass({
        base: CKEDITOR.editable,
        proto: {
            setData: function(data) {
                this.setValue(data);

                if (this.codeMirror != null) {
                    this.codeMirror.setValue(data);
                }

                this.editor.fire('dataReady');
            },
            getData: function() {
                return this.getValue();
            },
            // Insertions are not supported in source editable.
            insertHtml: function() {
            },
            insertElement: function() {
            },
            insertText: function() {
            },
            // Read-only support for textarea.
            setReadOnly: function(isReadOnly) {
                this[(isReadOnly ? 'set' : 'remove') + 'Attribute']('readOnly', 'readonly');
            },
            editorID: null,
            detach: function() {
                window["codemirror_" + this.editorID].toTextArea();

                // Free Memory on destroy
                window["editable_" + this.editorID] = null;
                window["codemirror_" + this.editorID] = null;

                sourceEditable.baseProto.detach.call(this);

                this.clearCustomData();
                this.remove();
            }
        }
    });
})(jQuery);
CKEDITOR.plugins.sourcearea = {
    commands: {
        source: {
            modes: {
                wysiwyg: 1,
                source: 1
            },
            editorFocus: false,
            readOnly: 1,
            exec: function(editor) {
                if (editor.mode === 'wysiwyg') {
                    editor.fire('saveSnapshot');
                }

                editor.getCommand('source').setState(CKEDITOR.TRISTATE_DISABLED);
                editor.setMode(editor.mode === 'source' ? 'wysiwyg' : 'source');
            },
            canUndo: false
        },
        searchCode: {
            modes: {
                wysiwyg: 0,
                source: 1
            },
            editorFocus: false,
            readOnly: 1,
            exec: function(editor) {
                CodeMirror.commands.find(window["codemirror_" + editor.id]);
            },
            canUndo: true
        },
        autoFormat: {
            modes: {
                wysiwyg: 0,
                source: 1
            },
            editorFocus: false,
            readOnly: 1,
            exec: function (editor) {
                var range = {
                    from: window["codemirror_" + editor.id].getCursor(true),
                    to: window["codemirror_" + editor.id].getCursor(false)
                };
                window["codemirror_" + editor.id].autoFormatRange(range.from, range.to);
            },
            canUndo: true
        },
        commentSelectedRange: {
            modes: {
                wysiwyg: 0,
                source: 1
            },
            editorFocus: false,
            readOnly: 1,
            exec: function (editor) {
                var range = {
                    from: window["codemirror_" + editor.id].getCursor(true),
                    to: window["codemirror_" + editor.id].getCursor(false)
                };
                window["codemirror_" + editor.id].commentRange(true, range.from, range.to);
            },
            canUndo: true
        },
        uncommentSelectedRange: {
            modes: {
                wysiwyg: 0,
                source: 1
            },
            editorFocus: false,
            readOnly: 1,
            exec: function(editor) {
                var range = {
                    from: window["codemirror_" + editor.id].getCursor(true),
                    to: window["codemirror_" + editor.id].getCursor(false)
                };
                window["codemirror_" + editor.id].commentRange(false, range.from, range.to);
                if (window["codemirror_" + editor.id].config.autoFormatOnUncomment) {
                    window["codemirror_" + editor.id].autoFormatRange(
                        range.from,
                        range.to);
                }
            },
            canUndo: true
        },
        autoCompleteToggle: {
            modes: {
                wysiwyg: 0,
                source: 1
            },
            editorFocus: false,
            readOnly: 1,
            exec: function (editor) {
                if (this.state == CKEDITOR.TRISTATE_ON) {
                    window["codemirror_" + editor.id].setOption("autoCloseTags", false);
                } else if (this.state == CKEDITOR.TRISTATE_OFF) {
                    window["codemirror_" + editor.id].setOption("autoCloseTags", true);
                }

                this.toggleState();
            },
            canUndo: true
        }
    }
};

function LineChannelToOffSet(ed, linech) {
    var line = linech.line;
    var ch = linech.ch;
    var n = (line + ch); //for the \n s & chars in the line
    for (i = 0; i < line; i++) {
        n += (ed.getLine(i)).length;//for the chars in all preceeding lines
    }
    return n;
}

function OffSetToLineChannel(ed, n) {
    var line = 0, ch = 0, index = 0;
    for (i = 0; i < ed.lineCount() ; i++) {
        len = (ed.getLine(i)).length;
        if (n < index + len) {

            line = i;
            ch = n - index;
            return { line: line, ch: ch };
        }
        len++;//for \n char
        index += len;
    }
    return { line: line, ch: ch };
}
