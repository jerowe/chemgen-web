#!/usr/bin/env bash

inotify-hookable \
    --watch-files /home/jdr400/projects/Divi-child \
    --on-modify-command "cp -rf /home/jdr400/projects/Divi-child /var/www/html/wordpress/wp-content/themes/Divi-child"
