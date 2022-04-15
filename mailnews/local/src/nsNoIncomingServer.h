/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef __nsNoIncomingServer_h
#define __nsNoIncomingServer_h

#include "mozilla/Attributes.h"
#include "msgCore.h"
#include "nsINoIncomingServer.h"
#include "nsILocalMailIncomingServer.h"
#include "nsMsgIncomingServer.h"
#include "nsMailboxServer.h"

/* get some implementation from nsMsgIncomingServer */
class nsNoIncomingServer : public nsMailboxServer,
                           public nsINoIncomingServer,
                           public nsILocalMailIncomingServer

{
public:
  NS_DECL_ISUPPORTS_INHERITED
  NS_DECL_NSINOINCOMINGSERVER
  NS_DECL_NSILOCALMAILINCOMINGSERVER

  nsNoIncomingServer();

  NS_IMETHOD GetLocalStoreType(nsACString& type) override;
  NS_IMETHOD GetLocalDatabaseType(nsACString& type) override;
  NS_IMETHOD GetCanSearchMessages(bool *canSearchMessages) override;
  NS_IMETHOD GetServerRequiresPasswordForBiff(bool *aServerRequiresPasswordForBiff) override;
  NS_IMETHOD GetAccountManagerChrome(nsAString& aResult) override;
  NS_IMETHOD GetSortOrder(int32_t* aSortOrder) override;

private:
  virtual ~nsNoIncomingServer();
};


#endif
