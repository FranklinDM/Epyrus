#! /bin/sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

MOZ_APP_BASENAME=Epyrus
MOZ_APP_NAME=epyrus
MOZ_APP_VENDOR=athenian200
MOZ_UPDATER=1
MOZ_THUNDERBIRD=1
# Application define
ATH_EPYRUS=1
MOZ_APP_STATIC_INI=1
MOZ_DISABLE_EXPORT_JS=1
MOZ_NO_ACTIVEX_SUPPORT=1
MOZ_ACTIVEX_SCRIPTING_SUPPORT=
MOZ_LDAP_XPCOM=1
MOZ_COMPOSER=1
MOZ_MAILNEWS=1
MOZ_MAILNEWS_OAUTH2=1
MOZ_SECURITY_SQLSTORE=1
NSS_DISABLE_DBM=1
MOZ_CHROME_FILE_FORMAT=omni

if test "$OS_ARCH" = "WINNT"; then
  # Platform Feature: Enable drawing in the titlebar on Windows
  MOZ_CAN_DRAW_IN_TITLEBAR=1
fi

MOZ_SAFE_BROWSING=1
MOZ_MORK=1

MOZ_APP_VERSION_TXT=${_topsrcdir}/$MOZ_BUILD_APP/config/version.txt
MOZ_APP_VERSION=`cat $MOZ_APP_VERSION_TXT`
MOZ_APP_VERSION_DISPLAY_TXT=${_topsrcdir}/$MOZ_BUILD_APP/config/version_display.txt
# This is no longer used in Epyrus after 1.3.0, 
# so just set it equal to MOZ_APP_VERSION.
MOZ_APP_VERSION_DISPLAY=$MOZ_APP_VERSION
THUNDERBIRD_VERSION=52.6.0

MOZ_UA_BUILDID=20100101

MOZ_BRANDING_DIRECTORY=mail/branding/aurora
MOZ_OFFICIAL_BRANDING_DIRECTORY=other-licenses/branding/epyrus
MOZ_APP_ID={29877c1d-27df-4421-9a79-382c31470151}
# This should usually be the same as the value MAR_CHANNEL_ID.
# If more than one ID is needed, then you should use a comma separated list
# of values.
ACCEPTED_MAR_CHANNEL_IDS=thunderbird-comm-release
# The MAR_CHANNEL_ID must not contain the following 3 characters: ",\t "
MAR_CHANNEL_ID=thunderbird-comm-release
# Enable generational GC on desktop.
JSGC_GENERATIONAL=1
MOZ_PROFILE_MIGRATOR=1
MOZ_JSDOWNLOADS=1
MOZ_BINARY_EXTENSIONS=1
MOZ_SEPARATE_MANIFEST_FOR_THEME_OVERRIDES=1

# Disable building ./signmar and running libmar signature tests
MOZ_ENABLE_SIGNMAR=

MOZ_DEVTOOLS=all

# Platform Feature: AppCompat GUID system
# Allows the installation of Thunderbird GUID targeted extensions despite having
# a different Application ID.
UXP_APPCOMPAT_GUID=1

# Include bundled fonts on everything except Mac.
if test "$OS_ARCH" != "Darwin"; then
  MOZ_BUNDLED_FONTS=1
fi
