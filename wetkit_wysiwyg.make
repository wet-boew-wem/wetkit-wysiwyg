; WetKit WYSIWYG Makefile

api = 2
core = 7.x

; The WYSIWYG Module Family

projects[wysiwyg][version] = 2.x-dev
projects[wysiwyg][subdir] = contrib
projects[wysiwyg][download][type] = git
projects[wysiwyg][download][revision] = 31840cb
projects[wysiwyg][download][branch] = 7.x-2.x
projects[wysiwyg][patch][507696] = http://drupal.org/files/wysiwyg_field_size_507696_96_0.patch
projects[wysiwyg][patch][1489096] = http://drupal.org/files/wysiwyg-table-format-1489096-7.patch
projects[wysiwyg][patch][1786732] = http://drupal.org/files/wysiwyg-arbitrary_image_paths_markitup-1786732-3.patch

projects[wysiwyg_filter][version] = 1.x-dev
projects[wysiwyg_filter][type] = module
projects[wysiwyg_filter][subdir] = contrib
projects[wysiwyg_filter][download][type] = git
projects[wysiwyg_filter][download][revision] = 6cbb1f4
projects[wysiwyg_filter][download][branch] = 7.x-1.x
projects[wysiwyg_filter][patch][1687794] = http://drupal.org/files/wysiwyg_filter-1687794-1-skip-validation-if-filter-disabled.patch
projects[wysiwyg_filter][patch][1543044] = http://drupal.org/files/wysiwyg_filter-missing-argument-1543044-2_1.patch

;projects[wysiwyg_template][version] = 2.x-dev
;projects[wysiwyg_template][type] = module
;projects[wysiwyg_template][subdir] = contrib
;projects[wysiwyg_template][download][type] = git
;projects[wysiwyg_template][download][revision] = a9d25c5
;projects[wysiwyg_template][download][branch] = 7.x-2.x

; The WYSIWYG Helpers

projects[linkit][version] = 1.x-dev
projects[linkit][type] = module
projects[linkit][subdir] = contrib
projects[linkit][download][type] = git
projects[linkit][download][revision] = 4356658
projects[linkit][download][branch] = 7.x-2.x
projects[linkit][patch][1793896] = http://drupal.org/files/entitylanguages-1793896-1.patch

projects[linkit_uuid][version] = 1.x-dev
projects[linkit_uuid][subdir] = contrib
projects[linkit_uuid][type] = module
projects[linkit_uuid][download][type] = git
projects[linkit_uuid][download][revision] = 09e0c94
projects[linkit_uuid][download][branch] = 7.x-1.x

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

;libraries[tinymce][download][type] = get
;libraries[tinymce][download][url] = https://github.com/downloads/tinymce/tinymce/tinymce_3.5.8.zip
;libraries[tinymce][patch][1561882] = http://drupal.org/files/1561882-cirkuit-theme-tinymce-3.5.8.patch

libraries[markitup][download][type] = get
libraries[markitup][download][url] = https://github.com/markitup/1.x/tarball/master
libraries[markitup][patch][1715642] = http://drupal.org/files/1715642-adding-html-set-markitup-editor.patch
