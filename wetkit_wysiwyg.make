; WetKit WYSIWYG Makefile

api = 2
core = 7.x

; Contrib

projects[linkit][version] = 3.x-dev
projects[linkit][type] = module
projects[linkit][subdir] = contrib
projects[linkit][download][type] = git
projects[linkit][download][revision] = 247cd5f
projects[linkit][download][branch] = 7.x-3.x
projects[linkit][patch][2116251] = http://drupal.org/files/linkit_support_uuid-2116251-1.patch
projects[linkit][patch][2116273] = http://drupal.org/files/linkit_fix_testing_plugins-2116273-1.patch
projects[linkit][patch][2160653] = http://drupal.org/files/issues/linkit_languages_support-2160653-05.patch

projects[wysiwyg][version] = 2.x-dev
projects[wysiwyg][subdir] = contrib
projects[wysiwyg][download][type] = git
projects[wysiwyg][download][revision] = ee64524
projects[wysiwyg][download][branch] = 7.x-2.x
; Support for markitup
projects[wysiwyg][patch][507696] = http://drupal.org/files/wysiwyg_field_size_507696_96_0.patch
projects[wysiwyg][patch][1489096] = http://drupal.org/files/wysiwyg-table-format-1489096-7.patch
projects[wysiwyg][patch][1786732] = http://drupal.org/files/wysiwyg-arbitrary_image_paths_markitup-1786732-3.patch
projects[wysiwyg][patch][1956778] = http://drupal.org/files/wysiwyg-ckeditor-acf-1956778-16.patch

; Include our Editors

libraries[ckeditor][download][type] = get
libraries[ckeditor][download][url] = http://download.cksource.com/CKEditor/CKEditor/CKEditor%204.2.2/ckeditor_4.2.2_standard.zip

libraries[markitup][download][type] = get
libraries[markitup][download][url] = https://github.com/markitup/1.x/tarball/master
libraries[markitup][patch][1715642] = http://drupal.org/files/1715642-adding-html-set-markitup-editor.patch
