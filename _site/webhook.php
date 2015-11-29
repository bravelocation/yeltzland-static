<?php
// Set Variables
$LOCAL_ROOT         = "/home/mylifeas/public_html/";
$LOCAL_REPO_NAME    = "yeltzland-static";
$LOCAL_REPO         = "{$LOCAL_ROOT}/{$LOCAL_REPO_NAME}";
$BRANCH             = "master";
if ($_SERVER['HTTP_X_EVENT_KEY'] == 'repo:push') {
  // Only respond to POST requests from Bitbucket 
  if( file_exists($LOCAL_REPO) ) {   
    // If there is already a repo, just run a git pull to grab the latest changes
    shell_exec("cd {$LOCAL_REPO} && git pull origin {$BRANCH}");
    die("done " . mktime());
  }
}
?>