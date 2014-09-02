/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var each = tinymce.each;
	
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('wetkitcleanup');
	
	tinymce.create('tinymce.plugins.WAS_Cleanup', {
		init : function(ed, url) {
			var t = this;

			ed.splitColumn = {
				active:false,
				thisLang:'en',
				oppLang:'fr',
				fields:{}
			};

			t.url = url;
			t.editor = ed;
			t.sbCtrl = null;
			t.acronymRunCount = 0;

		},

		getInfo : function() {
			return {
				longname : 'WAS Tools and Cleanup Operations',
				author : 'Mike Block Consulting Inc.',
				authorurl : 'http://www.bistromatics.com',
				infourl : 'http://www.bistromatics.com/?wetkitcleanup',
				version : "0.1"
			};
		},

		createControl : function(n, cm) {
			var t = this, c, ed = t.editor;
			if (n == 'wetkitcleanup') {
				c = cm.createSplitButton(n, {title : ed.getLang('wetkitcleanup.title'), onclick : t._aboutPlugin, image : t.url + "/img/wetkitcleanup.png"});

				c.onRenderMenu.add(function(c, m) {
					// var this_lang = 'en', opp_lang = 'fr',this_lang_full = 'en', opp_lang_full = 'fr', en_id = null, fr_id = null, is_multilingual = false;
					if (typeof(WET_EF_Splitter_Pairs) == 'object') {
						var langList = Array('en','fr');
						for (var i in WET_EF_Splitter_Pairs) {
							var flds = WET_EF_Splitter_Pairs[i];
							for (var l in langList) {
								var lng = langList[l], fld = flds[lng];
								if (ed.id == fld) {
									ed.splitColumn.thisLang = lng;
									ed.splitColumn.oppLang = lng == 'en' ? 'fr' : 'en';
									if (tinyMCE.get(flds[ed.splitColumn.oppLang])) {
										ed.splitColumn.active = true;
										ed.splitColumn.fields = flds;
										console.log("Found a match set of editors. This editor is the "+lng+" editor");
									}
								}
							}						
						}
					}


					m.add({title : ed.getLang('wetkitcleanup.quick_fix_all'), onclick : function () {t._QuickFixAll()}}).setDisabled(0);
					//m.add({title : 'Cleanup/Transformation Operations', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
					var sub = m.addMenu({title : ed.getLang('wetkitcleanup.convert_titles'), onclick : function () {return false;}, onmouseover : function () {alert(1);}}); 
					sub.add({title : ed.getLang('wetkitcleanup.demote_titles'), onclick : function () {t._dropHeadingLevels()}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.promote_titles'), onclick : function () {t._liftHeadingLevels()}}).setDisabled(0);
					var sub2 = sub.addMenu({title : ed.getLang('wetkitcleanup.create_toc_here'), onclick : function () {t._generateTOC(2,6)}}); 
						sub2.add({title : ed.getLang('wetkitcleanup.toc_levels_2'), onclick : function () {t._generateTOC(2,2)}}).setDisabled(0);
						sub2.add({title : ed.getLang('wetkitcleanup.toc_levels_23'), onclick : function () {t._generateTOC(2,3)}}).setDisabled(0);
						sub2.add({title : ed.getLang('wetkitcleanup.toc_levels_234'), onclick : function () {t._generateTOC(2,4)}}).setDisabled(0);
						sub2.add({title : ed.getLang('wetkitcleanup.toc_levels_all'), onclick : function () {t._generateTOC(2,6)}}).setDisabled(0);
					t.hideHeading = sub.add({title : ed.getLang('wetkitcleanup.hide_heading_from_index'), onclick : function () {t._hideHeading(true)}}).setDisabled(0);
					t.showHeading = sub.add({title : ed.getLang('wetkitcleanup.show_heading_in_index'), onclick : function () {t._hideHeading(false)}}).setDisabled(0);

					sub = m.addMenu({title : ed.getLang('wetkitcleanup.convert_tables'), onclick : function () {return false;}}); 
					t.convertThisTable = sub.add({title : ed.getLang('wetkitcleanup.convert_table_text'), onclick : function () {t._tableToText()}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.convert_tables_text'), onclick : function () {t._stripAllTables()}}).setDisabled(0);

					sub = m.addMenu({title : ed.getLang('wetkitcleanup.table_headers'), onclick : function () {return false;}});
					sub.add({title : ed.getLang('wetkitcleanup.first_row_headers'), onclick : function () {t._addTableHeaders(false)}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.thead_col_headers'), onclick : function () {t._addTableHeaders(true)}}).setDisabled(0);
					t.firstColumnHeadersThisTable = sub.add({title : ed.getLang('wetkitcleanup.first_col_row_headers_active_table'), onclick : function () {t._addTableRowHeaders(true)}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.first_col_row_headers'), onclick : function () {t._addTableRowHeaders(false)}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.add_header_ids'), onclick : function () {t._addTableCellIDHeaders(true)}}).setDisabled(0);

					sub = m.addMenu({title : ed.getLang('wetkitcleanup.change_selection_case'), onclick : function () {return false;}});
					sub.add({title : ed.getLang('wetkitcleanup.uppercase'), onclick : function () {t._changeCaseIgnoreHTML("upper")}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.lowercase'), onclick : function () {t._changeCaseIgnoreHTML("lower")}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.sentence_case'), onclick : function () {t._changeCaseIgnoreHTML("sentence")}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.title_case'), onclick : function () {t._changeCaseIgnoreHTML("title")}}).setDisabled(0);

					if (ed.splitColumn.active) {
						m.add({title : ed.getLang('wetkitcleanup.fix_footnotes'), onclick : function () {t._fixFootnotes(ed.splitColumn.thisLang)}}).setDisabled(0);
					} else {
						sub = m.addMenu({title : ed.getLang('wetkitcleanup.fix_footnotes'), onclick : function () {return false;}}); 
						sub.add({title : ed.getLang('wetkitcleanup.fix_footnotes') + ' (' + ed.getLang('wetkitcleanup.set_language_en') + ')', onclick : function () {t._fixFootnotes('en')}}); 
						sub.add({title : ed.getLang('wetkitcleanup.fix_footnotes') + ' (' + ed.getLang('wetkitcleanup.set_language_fr') + ')', onclick : function () {t._fixFootnotes('fr')}}); 
					}

					sub = m.addMenu({title : ed.getLang('wetkitcleanup.process_acronyms'), onclick : function () {return false;}}); 
					sub.add({title : ed.getLang('wetkitcleanup.process_acronyms_saved'), onclick : function () {t._findReplaceAcronyms(false)}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.process_acronyms_custom'), onclick : function () {t._findReplaceAcronyms(true)}}).setDisabled(0);

					sub = m.addMenu({title : ed.getLang('wetkitcleanup.set_language'), onclick : function () {return false;}}); 
					sub.add({title : ed.getLang('wetkitcleanup.set_language_en'), onclick : function () {t._setLanguage('en')}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.set_language_fr'), onclick : function () {t._setLanguage('fr')}}).setDisabled(0);

					sub = m.addMenu({title : ed.getLang('wetkitcleanup.extract_column'), onclick : function () {return false;}}); 
					if (ed.splitColumn.active) {
						sub.add({title : ed.getLang('wetkitcleanup.split_content_ef'), onclick : function () {t._splitColumnContent(Array(ed.splitColumn.fields.en,ed.splitColumn.fields.fr),Array(1,2))}}).setDisabled(0);
						sub.add({title : ed.getLang('wetkitcleanup.split_content_fe'), onclick : function () {t._splitColumnContent(Array(ed.splitColumn.fields.en,ed.splitColumn.fields.fr),Array(2,1))}}).setDisabled(0);
					}
					sub.add({title : ed.getLang('wetkitcleanup.extract_column_1'), onclick : function () {t._extractTableColumn(1)}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.extract_column_2'), onclick : function () {t._extractTableColumn(2)}}).setDisabled(0);

					//m.add({title : 'Quick Fix All', onclick : function () {t._QuickFixAll()}}).setDisabled(0);
                         //m.add({title : ed.getLang('wetkitcleanup.quick_fix_all'), onclick : function () {t._QuickFixAll()}}).setDisabled(0);
					sub = m.addMenu({title : ed.getLang('wetkitcleanup.other_cleanup'), onclick : function () {return false;}}); 
					sub.add({title : ed.getLang('wetkitcleanup.remove_empty_blocks'), onclick : function () {t._removeEmptyBlocks()}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.remove_table_dimensions'), onclick : function () {t._tableStripWidthHeight(false)}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.remove_table_dimensions_active'), onclick : function () {t._tableStripWidthHeight(true)}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.convert_cell_alignments'), onclick : function () {t._tableConvertAlignToStyles()}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.right_align_data'), onclick : function () {t._tableDataAlign('right')}}).setDisabled(0);
					sub.add({title : ed.getLang('wetkitcleanup.join_number_groups'), onclick : function () {t._numberGroups()}}).setDisabled(0);
				});
				t.sbCtrl = c;
				return c;
			}
		},

		// Private methods

		_aboutPlugin : function() {
			var t = this;
			alert(t.editor.getLang('wetkitcleanup.description'));
		},

		// Private methods

		_getMenuOptions : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			t.firstColumnHeadersThisTable;
		},

		// Private methods

		_QuickFixAll : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			t._removeEmptyBlocks();
			t._numberGroups();
			t._tableDataParas();
			if (confirm("Right align numeric data cells?"))
				t._tableDataAlign('right');
			t._tableStripWidthHeight(false);
			t._tableConvertAlignToStyles();
			var emptyMatch = new RegExp("^(?:<[^>]*>|&nbsp;|\\s)*$");
			var tags = null;
			// remove any paragraph or heading that has only tags or whitespace
			var tags = ed.dom.select('p,h1,h2,h3,h4,h5,h6');
			for (var i=tags.length-1;i>=0;i--) {
				if (emptyMatch.test(tags[i].innerHTML)) {
					ed.dom.remove(tags[i]);
				}
			}
			// remove strong and em from headings
			var plainText = new RegExp("(?:<[^>]*>|&nbsp;|\\s)+",'g');
			var tags = ed.dom.select('h1,h2,h3,h4,h5,h6');
			for (var i=0;tags[i];i++) {
				var pt = tags[i].innerHTML.replace(plainText,' ');
				pt = pt.replace(/^\s+/,'').replace(/\s+$/,''); // trim
				var rmTags = ed.dom.select('em,strong',tags[i]);
				for (var j=rmTags.length-1;j>=0;j--) {
					var it = rmTags[j].innerHTML.replace(plainText,' ');
					it = it.replace(/^\s+/,'').replace(/\s+$/,''); // trim
					// only replace if the whole string matches
					if (it == pt) {
						ed.dom.setOuterHTML(rmTags[j],rmTags[j].innerHTML);
					}
				}
			}
			// convert image attributes to styles
			var tags = ed.dom.select('img[align],img[hspace],img[vspace]');
			for (var i=0;tags[i];i++) {
				if (ed.dom.getAttrib(tags[i], "align"))
					ed.dom.setStyles(tags[i], {"float": ed.dom.getAttrib(tags[i], "align")});
				ed.dom.setAttrib(tags[i], "align", null);
				ed.dom.setAttrib(tags[i], "hspace", null);
				ed.dom.setAttrib(tags[i], "vspace", null);
			}
			// change attributes in table cells to style attributes instead
			ed.dom.setAttrib(ed.dom.select('table[align]'), "align", null);
			var tags = ed.dom.select('*[valign],*[align],*[nowrap],br[clear],*[bgcolor],*[cellpadding],*[cellspacing]');
			for (var i=0;tags[i];i++) {
				if (ed.dom.getAttrib(tags[i], "valign"))
					ed.dom.setStyles(tags[i], {"vertical-align": ed.dom.getAttrib(tags[i], "valign")});
				if (ed.dom.getAttrib(tags[i], "align"))
					ed.dom.setStyles(tags[i], {"text-align": ed.dom.getAttrib(tags[i], "align")});
				ed.dom.setAttrib(tags[i], "valign", null);
				ed.dom.setAttrib(tags[i], "align", null);
				ed.dom.setAttrib(tags[i], "nowrap", null);
				ed.dom.setAttrib(tags[i], "clear", null);
				ed.dom.setAttrib(tags[i], "bgcolor", null);
				ed.dom.setAttrib(tags[i], "border", null);
				ed.dom.setAttrib(tags[i], "cellpadding", null);
				ed.dom.setAttrib(tags[i], "cellspacing", null);
			}
			var newData = b.innerHTML;
			// apply any unaccepted tracked changes in documents
			newData = newData.replace(/<del [^>]+>.*?<\/del>/ig, "");
			newData = newData.replace(/<ins [^>]+>(.*?)<\/ins>/ig, "$1");
			// fix long hyphens used in URLs
			newData = newData.replace(/%1e/g, "-");
			// recode up arrows
			newData = newData.replace(/(?:&uarr;|↑)/g, "&#8593;");
			// add hard space in empty cells
			newData = newData.replace(/(<td[^>]*>)\s*(<\/td>)/ig, "$1&nbsp;$2");
			// remove line breaks that start or end paragraphs and heading
			newData = newData.replace(/(<(?:p|h[1-6])(?:>|\s[^>]*>))(&nbsp;|\s|<br[^>]*>)+/ig, "$1");
			newData = newData.replace(/(?:<(p|h[1-6])(?:>|\s[^>]*>))(&nbsp;|\s|<br[^>]*>)*<\/\1>/ig, "");
			// remove repeated hard spaces
			newData = newData.replace(/&nbsp;(&nbsp;)+\s/ig, " ");
			// remove strong/em from wrapping whitespace/br
			newData = newData.replace(/<(strong|em)>((?:&nbsp;|\s|<br \/>)*)<\/\1>/ig, "$2");
			newData = newData.replace(/<(strong|em)>((?:&nbsp;|\s|<br \/>)*)<\/\1>/ig, "$2");

			// fix MS Word footnote / endnote references that lose the name and id attributes on paste
			newData = newData.replace(/(<a[^>]*href=")file:[^"#]+/ig, "$1");
			newData = newData.replace(/(<a[^>]*)\sid="_(ftn|edn)ref(\d+)"/ig, "$1");
			newData = newData.replace(/(<a[^>]*)\sname="_(ftn|edn)ref(\d+)"/ig, "$1");
			newData = newData.replace(/(<a[^>]*\shref="[^"]*#_(ftn|edn)ref(\d+)")([^>]*)/ig, "$1 name=\"_$2$3\" id=\"_$2$3\"$4");
			newData = newData.replace(/(<a[^>]*\shref="[^"]*#_(ftn|edn)(\d+)")([^>]*)/ig, "$1 name=\"_$2ref$3\" id=\"_$2ref$3\"$4");
			newData = newData.replace(/(<\/a>)(\[(\d+)\])/ig, "$2$1");
			b.innerHTML = newData;
		},

		_removeEmptyBlocks : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();

			var re = new RegExp("(<(h[1-6]|p)[^>]*>)(?:&nbsp;|\s)*(</\\2>)", "ig");
			b.innerHTML = b.innerHTML.replace(re,"");
		},

		_dropHeadingLevels : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();

			for (var i=6; i>=1; i--) {
				var re = new RegExp("(</*h)"+i, "ig");
				b.innerHTML = b.innerHTML.replace(re,"$1"+(i+1));
			}
		},

		_liftHeadingLevels : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();

			for (var i=2; i<=6; i++) {
				var re = new RegExp("(</*h)"+i, "ig");
				b.innerHTML = b.innerHTML.replace(re,"$1"+(i-1));
			}
		},

		_hideHeading : function(addClass) {
			var t = this;
			var focusElm = t.editor.selection.getNode();
			var headingElm = t.editor.dom.getParent(focusElm, "h1,h2,h3,h4,h5,h6");
			if (!headingElm) {
				alert(t.editor.getLang('wetkitcleanup.no_heading_selected'));
				return false;
			}
			if (addClass)
				t.editor.dom.addClass(headingElm,'noidxentry');
			else
				t.editor.dom.removeClass(headingElm,'noidxentry');
		},
		
		_generateTOC : function(sl,el) {
			var t = this, ed = t.editor, i, c;
			var hl = Array();
			for (i=sl;i<=el;i++) {
				hl[hl.length] = "h"+i;
			}
			t.editor.dom.remove('auto-toc');
			t.editor.dom.remove(t.editor.dom.select('a[id^=toc-tm]',h));
			var toc = tinyMCE.activeEditor.dom.create('div', {id : 'auto-toc'});
			var focusElm = t.editor.selection.getNode();
			if (focusElm)
				t.editor.dom.insertAfter(toc,focusElm);
			else
				t.editor.dom.insertAfter(toc);
			tocBlock = t.editor.dom.select('#auto-toc');
			var headings = t.editor.dom.select(hl.join(','));
			var lastLevel = sl;
			var c = 1;
			var cUL = t.editor.dom.add(tocBlock, 'ul');
			var cLI = null;
			var activeUL = Array();
			activeUL[sl] = cUL;
			var hlCount = Array();
			for (i=0;headings[i];i++) {
				var h = headings[i];
				if (ed.dom.hasClass(h,'noidxentry'))
					continue;
				var hl = parseInt(h.tagName.replace(/h/i,''),10);
				hlCount[hl-2] = hlCount[hl-2] ? hlCount[hl-2]+1 : 1;
				if (hl > lastLevel) {
					if (cLI == null) {
						alert("Levels aren't in order!");
						return false;
					} else {
						activeUL[hl] = t.editor.dom.add(cLI, 'ul');
					}
				} else if (hl < lastLevel) {
					for (var j=lastLevel;j>hl;j--) {
						hlCount[j-2] = 0;
					}
				}
				lastLevel = hl;
				
				var thisId = 'toc-tm';
				for (var j=sl;hlCount[j-2];j++) {
					thisId = thisId + '-' + hlCount[j-2];
				}
				var txt = h.innerHTML.replace(/<\/?(a|div|span)[^>]>/,' ').replace(/\s\s+/,' ');
				cLI = t.editor.dom.add(activeUL[hl], 'li',null,'<a href="#'+thisId+'">' + txt + '</a>');
				t.editor.dom.setHTML(h, '<a name="'+thisId+'" id="'+thisId+'"></a>' + h.innerHTML);
			}
		},

		_setLanguage : function(newLang) {
			var t = this, ed = t.editor, i;
			if (!ed.selection) return false;
			if (ed.selection.getStart().tagName != ed.selection.getEnd().tagName) {
				return false;
			}
			var currContent = ed.selection.getContent();
			currContent = '<span lang="' + newLang + '">' + currContent + '</span>';
			ed.selection.setContent(currContent);
		},

		_fixFootnotes: function (lang) {
			var t = this, ed = t.editor, i, dom = ed.dom;
			var fnRegEx = new RegExp("_(ftn|edn)(\\d+)",'i');
			var fnRefRegEx = new RegExp("_(ftn|edn)ref(\\d+)",'i');
			var refPattern = '<sup id="fnb%d-ref"><a href="#fnb%d" class="note-link"><span class="wb-invisible">Note </span>%d</a></sup>';
			var noteSectionPattern = '<div class="wet-boew-note"><h2>Notes</h2><dl>%s</dl></div>';
			var notePattern = '<dt>Note %d</dt><dd id="fnb%d"><p>%s</p><p class="note-return"><a href="#fnb%d-ref"><span class="wb-invisible">Return to reference</span> %d</a></p></dd>';
			if (lang == 'fr') {
				notePattern = '<dt>Note %d</dt><dd id="fnb%d"><p>%s</p><p class="note-return"><a href="#fnb%d-ref"><span class="wb-invisible">Retour &agrave; la r&eacute;f&eacute;rence</span> %d</a></p></dd>';
			}
			var firstNote = null;
			var notesHTML = '';
			each(dom.select('a'), function(a) {
				if (fnRegEx.test(a.getAttribute('href'))) {
					var match = fnRegEx.exec(a.getAttribute('href'));
					dom.setOuterHTML(a,refPattern.replace(/%d/g,match[2]));
				} else if (fnRefRegEx.test(a.getAttribute('href'))) {
					var match = fnRefRegEx.exec(a.getAttribute('href'));
					var p = dom.getParent(a,'p');
					dom.remove(a);
					var tmpHTML = notePattern.replace(/%d/g,match[2]);
					tmpHTML = tmpHTML.replace(/%s/g,p.innerHTML);
					notesHTML += tmpHTML;
					if (parseInt(match[2]) == 1) {
						firstNote = p;
					} else {
						dom.remove(p);
					}
				}
			});
			if (firstNote != null && notesHTML != '') {
				dom.setOuterHTML(firstNote,noteSectionPattern.replace(/%s/,notesHTML));
			}
		},

		_changeCaseIgnoreHTML : function(newCase) {
			var t = this, ed = t.editor, i;
			var htmlTags = Array();
			if (!ed.selection) return false;
			if (ed.selection.getStart().tagName != ed.selection.getEnd().tagName) {
				alert(t.editor.getLang('wetkitcleanup.tool_title'));
				return false;
			}
			var content = ed.selection.getContent();
			content = t._convertExtended(content);
			var chNodes = content.match(/(<.*?>)/ig);
			for (i = 0; chNodes && chNodes[i]; i++) {
				htmlTags[i] = chNodes[i];
				content = content.replace(htmlTags[i],"%_%%"+i+"%%_%");
			}
			if (newCase == "upper")
				content = content.toUpperCase();
			else if (newCase == "lower")
				content = content.toLowerCase();
			else if (newCase == "sentence") {
				var sentences = content.split('.');
				content = "";
				for (i = 0; sentences[i]; i++) {
					var nonCharacterStart = sentences[i].replace(/^([^a-zA-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðñòóôõöùúûüýÿ]*).*/,"$1");
					sentences[i] = sentences[i].replace(/^[^a-zA-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðñòóôõöùúûüýÿ]*(.*)/,"$1");
					content = content + nonCharacterStart + sentences[i].substring(0,1).toUpperCase() + sentences[i].substring(1).toLowerCase() + (sentences[i+1]?'.':'');
				}
			}
			else if (newCase == "title") {
				var pat = new RegExp("([^a-zA-Z0-9ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðñòóôõöùúûüýÿ'`]|%_%%\d+%%_%)+");
				var words = content.split(pat);
				for (i = 0; words[i]; i++)
					content = content.replace(new RegExp("(^|[^a-zA-Z0-9ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðñòóôõöùúûüýÿ'`]|%)"+words[i]),"$1"+words[i].substring(0,1).toUpperCase()+words[i].substring(1).toLowerCase());
			}
			for (i = 0; htmlTags && htmlTags[i]; i++)
				content = content.replace("%_%%"+i+"%%_%",htmlTags[i]);
			ed.selection.setContent(content.replace(/^<[^>]*>/,'').replace(/<[^>]*>$/,''));
		},


		__buildGrid: function (table,dom) {
			var startY = 0;

			var grid = [];

			each(['thead', 'tbody', 'tfoot'], function(part) {
				var rows = dom.select(part + ' tr', table);

				each(rows, function(tr, y) {
					y += startY;

					each(dom.select('td,th', tr), function(td, x) {
						var x2, y2, rowspan, colspan;

						// Skip over existing cells produced by rowspan
						if (grid[y]) {
							while (grid[y][x])
								x++;
						}

						// Get col/rowspan from cell
						rowspan = parseInt(td.getAttribute('rowspan') || 1);
						colspan = parseInt(td.getAttribute('colspan') || 1);

						// Fill out rowspan/colspan right and down
						for (y2 = y; y2 < y + rowspan; y2++) {
							if (!grid[y2])
								grid[y2] = [];

							for (x2 = x; x2 < x + colspan; x2++) {
								grid[y2][x2] = {
									part : part,
									real : y2 == y && x2 == x,
									elm : td,
									rowspan : rowspan,
									colspan : colspan
								};
							}
						}
					});
				});

				startY += rows.length;
			});
			return grid;
		},

		_extractTableColumn : function(colNumber) {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			if (colNumber == 2) {
				var colHasContent = t._checkColumnContent(t.editor);
				if (colHasContent.length == 3 && colHasContent[1] == false) {
					colNumber = 3;
				}
			}
			colNumber = colNumber - 1; // convert to zero-based for arrays
			var emptyCellMatch = new RegExp("^(?:<[^>]*>|&nbsp;|\\s)*$");
			var tables = ed.dom.select('body > table, body > div > table');
			for (var tbl=0; tbl<tables.length; tbl++) {
				var contentBuffer = '';
				var rows = ed.dom.select('tbody > tr, thead > tr',tables[tbl]);
				for (var trw=0; trw<rows.length; trw++) {
					var tcells = ed.dom.select('th, td',rows[trw]);
					if (tcells.length < colNumber+1) {
						alert(ed.getLang('wetkitcleanup.not_exists_chosen_column'));
						return;
					}
					if (ed.dom.select('p, div, ul, ol',tcells[colNumber]).length > 0) {
						contentBuffer += tcells[colNumber].innerHTML;
					} else {
						contentBuffer += '<p>' + tcells[colNumber].innerHTML + '</p>';
					}
				}
				ed.dom.setOuterHTML(tables[tbl],contentBuffer);
			}
		},
		
		_checkColumnContent : function(ed) {
			var emptyCellMatch = new RegExp("^(?:<[^>]*>|&nbsp;|\\s)*$");
			var colHasContent = Array();
			var tables = ed.dom.select('body > table, body > div > table');
			for (var tbl=0; tbl<tables.length; tbl++) {
				var rows = ed.dom.select('tbody > tr, thead > tr',tables[tbl]);
				for (var trw=0; trw<rows.length; trw++) {
					var tcells = ed.dom.select('th, td',rows[trw]);
					for (var tc = 0; tc < tcells.length; tc++) {
						if (!emptyCellMatch.test(tcells[tc].innerHTML)) {
							colHasContent[tc] = true;
						} else {
							colHasContent[tc] = colHasContent[tc] ? colHasContent[tc] : false;
						}
					}
				}
			}
			return colHasContent;
		},

		_splitColumnContent : function(editorIds,colIndexes) {
			var t = this, ed = t.editor, edOther = tinyMCE.get(editorIds[1]);
			var colHasContent = t._checkColumnContent(t.editor);
			var emptyCellMatch = new RegExp("^(?:<[^>]*>|&nbsp;|\\s)*$");
			if (colHasContent.length == 3 && colHasContent[1] == false) {
				if (colIndexes[0] == 1) {
					colIndexes = Array(1,3);
				} else {
					colIndexes = Array(3,1);
				}
			}
			edOther.dom.setHTML(edOther.dom.getRoot(), t.editor.getContent());
			for (var idx=0;idx<2;idx++) {
				var colNumber = colIndexes[idx] - 1; // convert to zero-based for arrays
				var ed = tinyMCE.get(editorIds[idx]), d = ed.getDoc(), b = ed.getBody();
				var tables = ed.dom.select('body > table, body > div > table');
				for (var tbl=0; tbl<tables.length; tbl++) {
					var contentBuffer = '';
					var rows = ed.dom.select('tbody > tr, thead > tr',tables[tbl]);
					for (var trw=0; trw<rows.length; trw++) {
						var tcells = ed.dom.select('th, td',rows[trw]);
						if (tcells.length < colNumber+1) {
							alert(ed.getLang('wetkitcleanup.not_exists_chosen_column'));
							return;
						}
						if (ed.dom.select('p, div, ul, ol',tcells[colNumber]).length > 0) {
							contentBuffer += tcells[colNumber].innerHTML;
						} else {
							contentBuffer += '<p>' + tcells[colNumber].innerHTML + '</p>';
						}
					}
					ed.dom.setOuterHTML(tables[tbl],contentBuffer);
				}
			}
		},

		_addTableHeaders : function(useThead) {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tables = d.getElementsByTagName(useThead ? "thead" : "table");
			var emptyCellMatch = new RegExp("^(?:<[^>]*>|&nbsp;|\\s)*$");
			for (var tbl=0; tbl<tables.length; tbl++) {
				var tableElm = tables[tbl];
				var rows = tableElm.getElementsByTagName("tr");
				for (var trw=0; trw<rows.length; trw++) {
					var tcells = rows[trw].getElementsByTagName("td");
					var tcCount = tcells ? tcells.length : 0;
					var skipCell = 0;
					for (var tc=1; tc<=tcCount; tc++) {
						var tcells = rows[trw].getElementsByTagName("td");
						var td = tcells[skipCell];
						if (td && emptyCellMatch.test(td.innerHTML)) {
							tcCount++;
							skipCell++;
						} else if (td) {
							// changing to a different node type
							var newCell = d.createElement("th");

							for (var c=0; c<td.childNodes.length; c++)
								newCell.appendChild(td.childNodes[c].cloneNode(1));

							for (var a=0; a<td.attributes.length; a++)
								ed.dom.setAttrib(newCell, td.attributes[a].name, ed.dom.getAttrib(td, td.attributes[a].name));

							ed.dom.setAttrib(newCell, "scope", (ed.dom.getAttrib(td, "colspan") > 1 ? "colgroup" : "col"));
							td.parentNode.replaceChild(newCell, td);
							td = newCell;
						}
					}
					// just process the first row until we figure out how to detect multiple rows
					if (!useThead)
						trw=rows.length; 
				}
			}
		},

		_tableStripWidthHeight : function(activeTable) {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tables = Array();
			if (activeTable)
				tables[0] = t._getSetActiveTableDom();
			else
				tables = d.getElementsByTagName("table");
			for (var tbl=0; tables[tbl]; tbl++) {
				ed.dom.setAttribs(tables[tbl], {"width":null, "height":null});
				ed.dom.setStyle(tables[tbl], "width", null);
				ed.dom.setStyle(tables[tbl], "height", null);
				var rows = tables[tbl].getElementsByTagName("tr");
				for (var trw=0; trw<rows.length; trw++) {
					ed.dom.setStyles(rows[trw], {"height": null});
					ed.dom.setAttribs(rows[trw], {"width":null, "height":null});
					ed.dom.setStyles(rows[trw].getElementsByTagName("td"), {"width":null, "height":null});
					ed.dom.setAttribs(rows[trw].getElementsByTagName("td"), {"width":null, "height":null});
					ed.dom.setStyles(rows[trw].getElementsByTagName("th"), {"width":null, "height":null});
					ed.dom.setAttribs(rows[trw].getElementsByTagName("th"), {"width":null, "height":null});
				}
			}
		},

		_numberGroups : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var re = new RegExp("(\\d+)\\s+(\\d{3})", "ig");
			b.innerHTML = b.innerHTML.replace(re,"$1&nbsp;$2");
			b.innerHTML = b.innerHTML.replace(re,"$1&nbsp;$2");
			b.innerHTML = b.innerHTML.replace(re,"$1&nbsp;$2");
			var re = new RegExp("(\\d+)\\s+\\$", "ig");
			b.innerHTML = b.innerHTML.replace(re,"$1&nbsp;$");
		},

		_tableDataAlign : function(useAlign) {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tables = Array();
			tables = d.getElementsByTagName("table");
			var dataCellMatch = new RegExp(/^\s*(?:<p[^>]*>)?((?:[\d,\.$%()-]|\s|<\/?(?:strong|em)>|&nbsp;)+)(?:<\/p>)?\s*$/i);
			for (var tbl=0; tables[tbl]; tbl++) {
				var tableElm = tables[tbl];
				var rows = tableElm.getElementsByTagName("tr");
				for (var trw=0; trw<rows.length; trw++) {
					var tcells = rows[trw].getElementsByTagName("td");
					var tcCount = tcells ? tcells.length : 0;
					for (var tc=0; tc<tcCount; tc++) {
						var td = tcells[tc];
						if (tcells[tc] && dataCellMatch.test(tcells[tc].innerHTML)) {
							tcells[tc].innerHTML = tcells[tc].innerHTML.replace(dataCellMatch, "$1");
							ed.dom.setStyle(tcells[tc], "text-align", useAlign);
						}
					}
				}
			}
		},
		
		_tableDataParas : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tables = Array();
			tables = d.getElementsByTagName("table");
			for (var tbl=0; tables[tbl]; tbl++) {
				var tcells = tables[tbl].getElementsByTagName("th");
				for (var tc=0; tc<tcells.length; tc++) {
					var td = tcells[tc];
					var p = td.getElementsByTagName("p");
					if (p.length == 1) {
						td.innerHTML = p[0].innerHTML;
					}
				}
				var tcells = tables[tbl].getElementsByTagName("td");
				for (var tc=0; tc<tcells.length; tc++) {
					var td = tcells[tc];
					var p = td.getElementsByTagName("p");
					if (p.length == 1) {
						td.innerHTML = p[0].innerHTML;
					}
				}
			}
		},
		
		_tableConvertAlignToStyles : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tables = Array();
			tables = d.getElementsByTagName("table");
			for (var tbl=0; tables[tbl]; tbl++) {
				var rows = tables[tbl].getElementsByTagName("tr");
				for (var trw=0; trw<rows.length; trw++) {
					var tcells = rows[trw].getElementsByTagName("td");
					var tcCount = tcells ? tcells.length : 0;
					for (var tc=0; tc<tcCount; tc++) {
						if (tcells[tc] && ed.dom.getAttrib(tcells[tc],'valign'))
							ed.dom.setStyle(tcells[tc], "vertical-align", ed.dom.getAttrib(tcells[tc],'valign'));
						if (tcells[tc] && ed.dom.getAttrib(tcells[tc],'align'))
							ed.dom.setStyle(tcells[tc], "text-align", ed.dom.getAttrib(tcells[tc],'align'));
						ed.dom.setAttribs(tcells[tc], {"valign":null, "align":null});
					}
					var tcells = rows[trw].getElementsByTagName("th");
					var tcCount = tcells ? tcells.length : 0;
					for (var tc=0; tc<tcCount; tc++) {
						if (tcells[tc] && ed.dom.getAttrib(tcells[tc],'valign'))
							ed.dom.setStyle(tcells[tc], "vertical-align", ed.dom.getAttrib(tcells[tc],'valign'));
						if (tcells[tc] && ed.dom.getAttrib(tcells[tc],'align'))
							ed.dom.setStyle(tcells[tc], "text-align", ed.dom.getAttrib(tcells[tc],'align'));
						ed.dom.setAttribs(tcells[tc], {"valign":null, "align":null});
					}
				}
			}
			
		},

		_addTableRowHeaders : function(activeTable) {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tables = Array();
			if (activeTable)
				tables[0] = t._getSetActiveTableDom();
			else
				tables = d.getElementsByTagName("table");
			var emptyCellMatch = new RegExp("^(?:<[^>]*>|&nbsp;|\\s)*$");
			for (var tbl=0; tables[tbl]; tbl++) {
				var tableElm = tables[tbl];
				var rows = tableElm.getElementsByTagName("tr");
				for (var trw=0; trw<rows.length; trw++) {
					var tcells = rows[trw].getElementsByTagName("td");
					var td = tcells[0];
					if (td && !emptyCellMatch.test(td.innerHTML)) {
						// changing to a different node type
						var newCell = d.createElement("th");

						for (var c=0; c<td.childNodes.length; c++)
							newCell.appendChild(td.childNodes[c].cloneNode(1));

						for (var a=0; a<td.attributes.length; a++)
							ed.dom.setAttrib(newCell, td.attributes[a].name, ed.dom.getAttrib(td, td.attributes[a].name));

						ed.dom.setAttrib(newCell, "scope", (ed.dom.getAttrib(td, "rowspan") > 1 ? "rowgroup" : "row"));
						td.parentNode.replaceChild(newCell, td);
						td = newCell;
					}
				}
			}
		},

		_addTableCellIDHeaders : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tables = Array();
			var allTables = d.getElementsByTagName("table");
			if (!confirm(ed.getLang('wetkitcleanup.confirm_apply_ids_to_all_tables')))
				tables[0] = t._getSetActiveTableDom();
			else
				tables = d.getElementsByTagName("table");
			var emptyCellMatch = new RegExp("^(?:<[^>]*>|&nbsp;|\\s)*$");
			for (var tbl=0; tables[tbl]; tbl++) {
				var tableElm = tables[tbl];
				var cellIDNum = 1;
				if (!tableElm.id) {
					// loop until we don't find a match
					for (tid = 1000;d.getElementById('table-'+tid);tid++) {}
					tblId = 'table-'+tid;
					tableElm.id = tblId;
				}
				var tblId = tableElm.id;
				var hrdInfo = [];
				// get a grid of all cells, irrespective of spanning
				var grid = t.__buildGrid(tableElm,ed.dom);
				// itterate the grid
				for (var y = 0; y<grid.length;y++) {
					for (var x = 0; x<grid[y].length;x++) {
						// grid object contains: part,real,elm,rowspan,colspan
						if (!emptyCellMatch.test(grid[y][x].elm.innerHTML)) {
							if (grid[y][x].real && grid[y][x].elm.tagName.toLowerCase() == 'th') {
								grid[y][x].elm.id = tblId + '-r' + (y+1) + '-c' + (x+1);
								if (!hrdInfo[y])
									hrdInfo[y] = [];
								for (var cc=x;cc<x+grid[y][x].colspan;cc++) {
									for (var rc=y;rc<y+grid[y][x].rowspan;rc++) {
										if (!hrdInfo[rc])
											hrdInfo[rc] = [];
										if (!hrdInfo[rc][cc])
											hrdInfo[rc][cc] = {id:grid[y][x].elm.id, section:ed.dom.getParent(grid[y][x].elm,'thead,tfoot,tbody').nodeName.toLowerCase(), scope: ed.dom.getAttrib(grid[y][x].elm, "scope")};
									}
								}
								ed.dom.setAttrib(grid[y][x].elm, 'headers',null);
								cellIDNum++;
							} else if (grid[y][x].real) {
								var headers = [];
								var colgroupHeader = null;
								for (var hr=0;hr<hrdInfo.length;hr++) {
									if (hrdInfo[hr] && hrdInfo[hr][x] && hrdInfo[hr][x].id && headers.indexOf(hrdInfo[hr][x].id) == -1 && (hrdInfo[hr][x].scope == 'col' || hrdInfo[hr][x].scope == 'colgroup')) {
										if (hrdInfo[hr][x].scope == 'colgroup' && hrdInfo[hr][x].section == 'tbody') {
											colgroupHeader = hrdInfo[hr][x].id;
										} else {
											headers[headers.length] = hrdInfo[hr][x].id;
										}
									}
								}
								if (colgroupHeader != null) {
									headers[headers.length] = colgroupHeader;
								}
								for (var hc=0;hrdInfo[y] && hc<hrdInfo[y].length;hc++) {
									if (hrdInfo[y][hc] && hrdInfo[y][hc].id && headers.indexOf(hrdInfo[y][hc].id) == -1 && (hrdInfo[y][hc].scope == 'row' || hrdInfo[y][hc].scope == 'rowgroup'))
										headers[headers.length] = hrdInfo[y][hc].id;
								}
								ed.dom.setAttrib(grid[y][x].elm, "headers", headers.join(' '));
							}
						}
					}
				}
			}
		},

		_getSetActiveTableDom : function() {
			var t = this;
			var focusElm = t.editor.selection.getNode();
			var tableElm = t.editor.dom.getParent(focusElm, "table");
			if (!tableElm) {
				alert(t.editor.getLang('wetkitcleanup.no_table_selected'));
				return null;
			}
			t.editor.selection.select(tableElm);
			return tableElm;
		},

		_tableToText : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();
			var tableElm = t._getSetActiveTableDom();
			var re = new RegExp("</*(?:thead|tbody|tfoot|td|th|tr|table|caption)[^>]*>", "ig");
			ed.selection.setContent(ed.selection.getContent().replace(re,""));
		},

		_stripAllTables : function() {
			var t = this, ed = t.editor, nl, i, d = ed.getDoc(), b = ed.getBody();

			var re = new RegExp("</*(?:thead|tbody|tfoot|td|th|tr|table|caption)[^>]*>", "ig");
			b.innerHTML = b.innerHTML.replace(re,"");
		},
		
		_findReplaceAcronyms : function(prompts) {
			var t = this, ed = t.editor, se = ed.selection, r = se.getRng(), f, s, rs, b, fl = 0, w = ed.getWin(), wm = ed.windowManager, fo = 0;
			if (prompts) {
				ed.focus();
				ed.windowManager.open({
					file : t.url + '/acronym.htm',
					width : 420 + parseInt(ed.getLang('wetkitcleanup.delta_width', 0)),
					height : 170 + parseInt(ed.getLang('wetkitcleanup.delta_height', 0)),
					inline : 1,
					auto_focus : 0
				}, {
					plugin_url : t.url
				});
				return;
			}
			var lang = ed.getParam("content_language");
			if (prompts) {
				var term=prompt("Exact term to find",'');
				var expanded=prompt("Full description of term to insert",'');
				var isAbbr = confirm("Use ABBR tag instead of ACRONYM for replacements? Use Cancel for No.");
				tinyAcronymUseList = [{abbr:isAbbr,en:[term,expanded],fr:[term,expanded]}];
			} else {
				tinyAcronymUseList = tinyAcronymList;
			}
			if (tinyAcronymList == null) {
				alert('No Acronyms to process!');
				return;
			}

			if (tinymce.isIE) {
				ed.focus();
				if (t.acronymRunCount == 0)
					alert("If this doesn't run, it's probably due to a bug in IE. Try running this again.");
				t.acronymRunCount = 1;
				r = ed.getDoc().selection.createRange();
			}

			function fix() {
				// Correct Firefox graphics glitches
				r = se.getRng().cloneRange();
				ed.getDoc().execCommand('SelectAll', false, null);
				se.setRng(r);
			};

			function replace(f,rs,abbr) {
				if (!confirm("Add "+(abbr?'abbr':'acronym')+" tag for \""+rs+"\"?")) {
					if (tinymce.isIE)
						ed.selection.getRng().duplicate().pasteHTML(f); // Needs to be duplicated due to selection bug in IE
					return;
				}
				rs = abbr ? '<abbr title="'+rs+'">'+f+'</abbr>' : '<acronym title="'+rs+'">'+f+'</acronym>';
				if (tinymce.isIE)
					ed.selection.getRng().duplicate().pasteHTML(rs); // Needs to be duplicated due to selection bug in IE
				else
					ed.selection.setContent(rs);
					// this was unreliable...
					//ed.getDoc().execCommand('InsertHTML', false, rs);
			};

			if (tinymce.isIE) {
				r = ed.getDoc().selection.createRange();
			}
			// IE flags
			var b = null;
			var fl = 4;
			for (var i=0; tinyAcronymUseList[i]; i++) {
				// Move caret to beginning of text
				ed.execCommand('SelectAll');
				ed.selection.collapse(true);

				var frSet = tinyAcronymUseList[i].en;
				if (lang == 'fr')
					frSet = tinyAcronymUseList[i].fr;
				s = frSet[0];
				rs = frSet[1];
				if (tinymce.isIE) {
					while (r.findText(s, 1, fl)) {
						r.scrollIntoView();
						r.select();
						replace(s,rs,tinyAcronymUseList[i].abbr);
						fo = 1;
						if (b) {
							r.moveEnd("character", -(rs.length)); // Otherwise will loop forever
						}
					}

				//ed.windowManager.storeSelection();
				} else {
					while (w.find(s, true, b, false, false, false, false)) {
						replace(s,rs,tinyAcronymUseList[i].abbr);
						fo = 1;
					}
				}
			}
		},

		_convertExtended : function(content) {
			var t = this, i;
			if (!t.extendedChars)
				t.extendedChars = Array(' ','&nbsp;', '&','&amp;', 'À','&Agrave;', 'Á','&Aacute;', 'Â','&Acirc;', 'Ã','&Atilde;', 'Ä','&Auml;', 'Å','&Aring;', 'Ç','&Ccedil;', 'È','&Egrave;', 'É','&Eacute;', 'Ê','&Ecirc;', 'Ë','&Euml;', 'Ì','&Igrave;', 'Í','&Iacute;', 'Î','&Icirc;', 'Ï','&Iuml;', 'Ò','&Ograve;', 'Ó','&Oacute;', 'Ô','&Ocirc;', 'Õ','&Otilde;', 'Ö','&Ouml;', 'Ù','&Ugrave;', 'Ú','&Uacute;', 'Û','&Ucirc;', 'Ü','&Uuml;', 'Ý','&Yacute;', 'à','&agrave;', 'á','&aacute;', 'â','&acirc;', 'ã','&atilde;', 'ä','&auml;', 'å','&aring;', 'ç','&ccedil;', 'è','&egrave;', 'é','&eacute;', 'ê','&ecirc;', 'ë','&euml;', 'ì','&igrave;', 'í','&iacute;', 'î','&icirc;', 'ï','&iuml;', 'ð','&eth;', 'ñ','&ntilde;', 'ò','&ograve;', 'ó','&oacute;', 'ô','&ocirc;', 'õ','&otilde;', 'ö','&ouml;', 'ù','&ugrave;', 'ú','&uacute;', 'û','&ucirc;', 'ü','&uuml;', 'ý','&yacute;', 'ÿ','&yuml;');
			for (i=0; t.extendedChars[i]; i+=2)
				content = content.replace(new RegExp(t.extendedChars[i+1],"g"),t.extendedChars[i]);
			return content;
		}

	});

	// Register plugin
	tinymce.PluginManager.add('wetkitcleanup', tinymce.plugins.WAS_Cleanup);
})();
