; WetKit WYSIWYG Makefile

api = 2
core = 7.x

; The WYSIWYG Module Family

projects[wysiwyg][version] = 2.x-dev
projects[wysiwyg][subdir] = contrib
projects[wysiwyg][download][type] = git
projects[wysiwyg][download][revision] = ee64524
projects[wysiwyg][download][branch] = 7.x-2.x
projects[wysiwyg][patch][507696] = http://drupal.org/files/wysiwyg_field_size_507696_96_0.patch
projects[wysiwyg][patch][1489096] = http://drupal.org/files/wysiwyg-table-format-1489096-7.patch
projects[wysiwyg][patch][1786732] = http://drupal.org/files/wysiwyg-arbitrary_image_paths_markitup-1786732-3.patch
projects[wysiwyg][patch][1956778] = http://drupal.org/files/wysiwyg-ckeditor-acf-1956778-16.patch

; The WYSIWYG Helpers

projects[linkit][version] = 3.x-dev
projects[linkit][type] = module
projects[linkit][subdir] = contrib
projects[linkit][download][type] = git
projects[linkit][download][revision] = 247cd5f
projects[linkit][download][branch] = 7.x-3.x

projects[image_resize_filter][version] = 1.x-dev
projects[image_resize_filter][type] = module
projects[image_resize_filter][subdir] = contrib
projects[image_resize_filter][download][type] = git
projects[image_resize_filter][download][revision] = da3bbd6
projects[image_resize_filter][download][branch] = 7.x-1.x
projects[image_resize_filter][patch][1708366] = http://drupal.org/files/1708366-7.patch

projects[caption_filter][version] = 1.3
projects[caption_filter][type] = module
projects[caption_filter][subdir] = contrib
projects[caption_filter][download][type] = git
projects[caption_filter][download][revision] = 6ab247f
projects[caption_filter][download][branch] = 7.x-1.x
projects[caption_filter][patch][1432092] = http://drupal.org/files/1432092-button-and-image.patch

; Include our Editors

libraries[ckeditor][download][type] = get
libraries[ckeditor][download][url] = http://download.cksource.com/CKEditor/CKEditor/CKEditor%204.1.3/ckeditor_4.1.3_standard.zip

libraries[markitup][download][type] = get
libraries[markitup][download][url] = https://github.com/markitup/1.x/tarball/master
libraries[markitup][patch][1715642] = http://drupal.org/files/1715642-adding-html-set-markitup-editor.patch
