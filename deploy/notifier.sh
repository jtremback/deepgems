#!/bin/bash

curl "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" -X POST \
--data-urlencode "To=$ADMIN_PHONE" \
--data-urlencode "MessagingServiceSid=$MSG_SERVICE_SID" \
--data-urlencode 'Body="Deep gems renderer crashed"' \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN