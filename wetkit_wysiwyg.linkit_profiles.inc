<?php
/**
 * @file
 * wetkit_wysiwyg.linkit_profiles.inc
 */

/**
 * Implements hook_default_linkit_profiles().
 */
function wetkit_wysiwyg_default_linkit_profiles() {
  $export = array();

  $linkit_profile = new stdClass();
  $linkit_profile->disabled = FALSE; /* Edit this to true to make a default linkit_profile disabled initially */
  $linkit_profile->api_version = 1;
  $linkit_profile->name = 'content_editors';
  $linkit_profile->admin_title = 'Content Editors';
  $linkit_profile->data = array(
    'plugins' => array(
      'entity:file' => array(
        'weight' => '0',
        'enabled' => 0,
      ),
      'entity:node' => array(
        'weight' => '0',
        'enabled' => 0,
      ),
      'linkit_uuid:taxonomy_termUUID' => array(
        'weight' => '0',
        'enabled' => 1,
      ),
      'linkit_uuid:nodeUUID' => array(
        'weight' => '0',
        'enabled' => 1,
      ),
      'linkit_uuid:fileUUID' => array(
        'weight' => '0',
        'enabled' => 1,
      ),
      'entity:taxonomy_term' => array(
        'weight' => '0',
        'enabled' => 0,
      ),
      'linkit_uuid:userUUID' => array(
        'weight' => '0',
        'enabled' => 1,
      ),
      'entity:user' => array(
        'weight' => '0',
        'enabled' => 0,
      ),
    ),
    'linkit_uuid:nodeUUID' => array(
      'result_description' => '',
      'bundles' => array(
        'wetkit_page' => 0,
        'deploy_content_moderated' => 0,
        'deploy_content_simple' => 0,
        'wetkit_documentation' => 0,
      ),
      'group_by_bundle' => 1,
    ),
    'linkit_uuid:taxonomy_termUUID' => array(
      'result_description' => '',
      'bundles' => array(
        'wetkit_categories' => 0,
        'tags' => 0,
      ),
      'group_by_bundle' => 1,
    ),
    'linkit_uuid:fileUUID' => array(
      'result_description' => '',
      'bundles' => array(
        'image' => 0,
        'video' => 0,
        'audio' => 0,
        'document' => 0,
        'wetkit_video' => 0,
      ),
      'group_by_bundle' => 1,
    ),
    'linkit_uuid:userUUID' => array(
      'result_description' => '',
    ),
    'entity:node' => array(
      'result_description' => '[node:title]',
      'bundles' => array(
        'wetkit_page' => 0,
        'deploy_content_moderated' => 0,
        'deploy_content_simple' => 0,
        'wetkit_documentation' => 0,
      ),
      'group_by_bundle' => 0,
      'reverse_menu_trail' => 0,
      'include_unpublished' => 0,
    ),
    'entity:file' => array(
      'result_description' => '',
      'bundles' => array(
        'image' => 0,
        'video' => 0,
        'audio' => 0,
        'document' => 0,
        'wetkit_video' => 0,
      ),
      'group_by_bundle' => 0,
      'reverse_menu_trail' => 0,
      'show_scheme' => 0,
      'group_by_scheme' => 0,
      'image_extra_info' => array(
        'thumbnail' => 'thumbnail',
        'dimensions' => 'dimensions',
      ),
    ),
    'entity:user' => array(
      'result_description' => '',
      'reverse_menu_trail' => 0,
    ),
    'autocomplete' => array(
      'charLimit' => 3,
      'wait' => 350,
      'remoteTimeout' => 10000,
    ),
    'attributes' => array(
      'rel' => array(
        'weight' => '0',
        'enabled' => 1,
      ),
      'class' => array(
        'weight' => '0',
        'enabled' => 1,
      ),
      'accesskey' => array(
        'weight' => '0',
        'enabled' => 0,
      ),
      'id' => array(
        'weight' => '0',
        'enabled' => 0,
      ),
      'title' => array(
        'weight' => '0',
        'enabled' => 1,
      ),
    ),
  );
  $linkit_profile->role_rids = array(
    2 => 1,
  );
  $linkit_profile->weight = 0;
  $export['content_editors'] = $linkit_profile;

  return $export;
}
