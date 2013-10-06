WetKit WYSIWYG
==============
Adds and configures CKEditor into the Drupal WxT distribution.

Key Features
------------

* Provides integration with CKEditor 4.1+ and legacy support for TinyMCE (3.5.8)
* Provides integration with the Markitup editor for those who prefer to enforce markdown
* Leverages LinkIT module to provide content link additions from within the WYSIWYG
* Enforce that all content is leveraging UUID to assist in content staging
* Ensures that the WYSIWYG also has support for multilingual (french by default)
* Integration of an Accessibility Checker for TinyMCE (to be ported to CKEditor)

Architecture
------------

The best and closer to the bare metal way of how this module dependencies with drupal contrib can be found below:

Make File: wetkit_wysiwyg.make

If you are unaware of what a make file is please consult our 'Drush Make Theory' for happy Drupal development. It just might make your development experience with Drupal more enjoyable.

End User Interaction
--------------------

Now that we have provided the developers some information to digest lets focus on how the end users will interact with this module.


<!-- Links Referenced -->

[ckeditor]:                http://coderwall.com/sylus
[linkit]:                  http://coderwall.com/sylus
[markitup]:                http://coderwall.com/sylus
[tinymce]:                 http://coderwall.com/sylus
[uuid]:                    http://coderwall.com/sylus
