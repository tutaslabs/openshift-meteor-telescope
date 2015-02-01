#!/bin/bash
SERVICE=meteorshim
CHECK=$0

RESULT=`ps ax | sed -n /${SERVICE}/p | grep -v sed | grep -v ${CHECK}`

if [ "${#RESULT}" -eq 0 ]; then

 source "$OPENSHIFT_REPO_DIR/.openshift/lib/utils"
_SHOW_SETUP_PATH_MESSAGES="true" setup_path_for_custom_node_version


cd ${OPENSHIFT_REPO_DIR}

export APM_APP_ID=qza3EjEyLTkKqBgTD
export APM_APP_SECRET=f9aff866-9fba-4b52-b853-2bc41024fe16

node meteorshim.js &
exit 0
fi
