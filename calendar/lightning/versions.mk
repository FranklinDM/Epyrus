# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Lighting version number
THUNDERBIRD_VERSION := $(MOZ_APP_VERSION)
SEAMONKEY_VERSION := $(shell cat $(topsrcdir)/mail/config/suite_version.txt)

ifdef MOZ_SUITE
LIGHTNING_VERSION := $(shell $(PYTHON) $(topsrcdir)/calendar/lightning/build/makeversion.py $(THUNDERBIRD_VERSION))
else
LIGHTNING_VERSION := $(MOZ_APP_VERSION)
endif

GDATA_VERSION := $(MOZ_APP_VERSION)

THUNDERBIRD_MAXVERSION := $(MOZ_APP_VERSION)

SEAMONKEY_MAXVERSION := $(SEAMONKEY_VERSION)
ifneq (a,$(findstring a,$(SEAMONKEY_VERSION)))
SEAMONKEY_MAXVERSION := $(shell echo $(SEAMONKEY_VERSION) | sed 's|\(^[0-9]*.[0-9]*\).*|\1|' ).*
endif
