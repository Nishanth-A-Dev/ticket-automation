# Ticket Report

## Ticket ID
98595000043590300

## Subject
Tag updation

## Description
- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

## Full Conversation

**From:** phifer India  
**Time:** 2026-04-29T12:17:17.000Z

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

---

**From:** Sangeetha Sundar  
**Time:** 2026-04-29T12:25:41.924Z

Hi Team,
Thank you for reaching out.
We have received your ticket. Kindly allow us some time and we will get back to you shortly with an update.

Best regards,Sangeetha,Gallabox Support.

---- on Wed, 29 Apr 2026 17:47:17 +0530  phifer India<jagannathan.j@growdigitally.consulting>  wrote ---- 

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

---

**From:** Sreenidhi C  
**Time:** 2026-04-29T13:16:38.453Z

Hello,

1. Unable to filter conversations using tags

If you’ve already created tags but are unable to filter them at the conversation level, please follow these steps:

Go to the Conversation module from the left panel

Click on the Filter icon

Select the required Tags to apply the filter
2. How to automatically assign tags to new incoming messages

You can automate tagging using a chatbot. Here’s how:

Navigate to Settings → Tags and create the required tags

Go to your chatbot flow and for any new incoming conversation:

Add the card Update conversation fields ->Select Field name  “Update Conversation Tags”

Select the relevant Tag name

This setup will automatically tag new conversations, allowing you to easily filter them later.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager
Gallabox

---- on Wed, 29 Apr 2026 16:25:41 +0400  "Gallabox Support"<support@gallabox.com>  wrote ---- 

Hi Team,
Thank you for reaching out.
We have received your ticket. Kindly allow us some time and we will get back to you shortly with an update.

Best regards,Sangeetha,Gallabox Support.

---- on Wed, 29 Apr 2026 17:47:17 +0530  phifer India<jagannathan.j@growdigitally.consulting>  wrote ---- 

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

---

**From:** phifer India  
**Time:** 2026-04-30T03:47:36.000Z

Hi Sreenidhi, 

1. Reg Unable to filter conversations using tags, you can see from the below snapshot im updating the contact tag when the Meta lead from Tiggers the template message, but on the conversation tab when i use the filter i can't able to view the chat. but the tag has data i cross checked the contact menu too.

2. How to automatically assign tags to new incoming messages, as you can able to see have done thing as you mentioned.

But here i have doubt like, in our scenario we are trying to setup the tag based for the chat source (eg: organic or Meta ads)
from the first snapshot you can able to see a tag is updated when meta leads form triggers the template message and that message has quick reply, if user clicks the quick reply will it consider as new oragnic message and updating the tag twice, will it happen?

We dont want a overalp tag btw the tag updation, Im also awating for call so that we ensure that we align on the same line and we can solve this ticket as early as possible.

From: Gallabox Support <support@gallabox.com>
To: <jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Wed, 29 Apr 2026 18:46:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hello,

1. Unable to filter conversations using tags
 If you’ve already created tags but are unable to filter them at the conversation level, please follow these steps:
Go to the Conversation module from the left panel

Click on the Filter icon

Select the required Tags to apply the filter

2. How to automatically assign tags to new incoming messages
 You can automate tagging using a chatbot. Here’s how:
Navigate to Settings → Tags and create the required tags

Go to your chatbot flow and for any new incoming conversation:

Add the card Update conversation fields ->Select Field name  “Update Conversation Tags”

Select the relevant Tag name

This setup will automatically tag new conversations, allowing you to easily filter them later.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Wed, 29 Apr 2026 16:25:41 +0400  "Gallabox Support"<support@gallabox.com>  wrote ---- 

Hi Team,

Thank you for reaching out.

We have received your ticket. Kindly allow us some time and we will get back to you shortly with an update.

Best regards,Sangeetha,Gallabox Support.

---- on Wed, 29 Apr 2026 17:47:17 +0530  phifer India<jagannathan.j@growdigitally.consulting>  wrote ---- 

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

Best Regards, 
Jagan - PPC Executive

---

**From:** Sreenidhi C  
**Time:** 2026-04-30T05:43:37.473Z

Hi Sreenidhi,
Thank you for sharing the details.
1. Regarding filtering conversations using tags
The issue here is due to the type of tag being applied. Currently, you are updating a contact tag through the Facebook Leads integration. However, in the Conversations module, the filter works based on conversation tags, not contact tags.
To resolve this, we recommend updating a conversation tag instead within the Facebook Leads flow. This will ensure that the chats are visible when you apply filters in the Conversations tab.
Please note:
Contact tags → Used for filtering within the Contacts module
Conversation tags → Used for filtering within the Conversations module

2. Regarding automatic tag assignment & avoiding overlap
From your setup, we understand you are trying to differentiate chats based on the source (Organic vs Meta Ads).
Your concern about tag overlap is valid. Specifically, when a user clicks a quick reply from a template message triggered via Meta leads, it may be treated as a new incoming (organic) message in a message-based flow, potentially causing duplicate or overlapping tags.

Recommended approach:
Use a CTWA (Click-to-WhatsApp Ads) based flow for Meta Ads traffic
Path: Bot → Choose Flow → Configure → Select CTWA Ad-based
Assign a dedicated tag here (e.g., “Meta Ads”)
Use a message-based flow for Organic traffic
Assign a separate tag here (e.g., “Organic”)
We understand you'd prefer to align over a call as well. Please let us know a convenient time, and we’ll be happy to connect and help close this at the earliest.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager
Gallabox

---- on Thu, 30 Apr 2026 07:47:36 +0400  "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>  wrote ---- 

Hi Sreenidhi, 

1. Reg Unable to filter conversations using tags, you can see from the below snapshot im updating the contact tag when the Meta lead from Tiggers the template message, but on the conversation tab when i use the filter i can't able to view the chat. but the tag has data i cross checked the contact menu too.

2. How to automatically assign tags to new incoming messages, as you can able to see have done thing as you mentioned.

But here i have doubt like, in our scenario we are trying to setup the tag based for the chat source (eg: organic or Meta ads)
from the first snapshot you can able to see a tag is updated when meta leads form triggers the template message and that message has quick reply, if user clicks the quick reply will it consider as new oragnic message and updating the tag twice, will it happen?

We dont want a overalp tag btw the tag updation, Im also awating for call so that we ensure that we align on the same line and we can solve this ticket as early as possible.

From: Gallabox Support <support@gallabox.com>
To: <jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Wed, 29 Apr 2026 18:46:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hello,

1. Unable to filter conversations using tags
 If you’ve already created tags but are unable to filter them at the conversation level, please follow these steps:
Go to the Conversation module from the left panel

Click on the Filter icon

Select the required Tags to apply the filter

2. How to automatically assign tags to new incoming messages
 You can automate tagging using a chatbot. Here’s how:
Navigate to Settings → Tags and create the required tags

Go to your chatbot flow and for any new incoming conversation:

Add the card Update conversation fields ->Select Field name  “Update Conversation Tags”

Select the relevant Tag name

This setup will automatically tag new conversations, allowing you to easily filter them later.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Wed, 29 Apr 2026 16:25:41 +0400  "Gallabox Support"<support@gallabox.com>  wrote ---- 

Hi Team,

Thank you for reaching out.

We have received your ticket. Kindly allow us some time and we will get back to you shortly with an update.

Best regards,Sangeetha,Gallabox Support.

---- on Wed, 29 Apr 2026 17:47:17 +0530  phifer India<jagannathan.j@growdigitally.consulting>  wrote ---- 

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

Best Regards, 
Jagan - PPC Executive

---

**From:** phifer India  
**Time:** 2026-04-30T06:50:32.000Z

Can we get on for quick virtual session, at your available time slot

From: Gallabox Support <support@gallabox.com>
To: "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Thu, 30 Apr 2026 11:13:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hi Sreenidhi,

Thank you for sharing the details.

1. Regarding filtering conversations using tags

The issue here is due to the type of tag being applied. Currently, you are updating a contact tag through the Facebook Leads integration. However, in the Conversations module, the filter works based on conversation tags, not contact tags.

To resolve this, we recommend updating a conversation tag instead within the Facebook Leads flow. This will ensure that the chats are visible when you apply filters in the Conversations tab.

Please note:

Contact tags → Used for filtering within the Contacts module

Conversation tags → Used for filtering within the Conversations module

2. Regarding automatic tag assignment & avoiding overlap

From your setup, we understand you are trying to differentiate chats based on the source (Organic vs Meta Ads).

Your concern about tag overlap is valid. Specifically, when a user clicks a quick reply from a template message triggered via Meta leads, it may be treated as a new incoming (organic) message in a message-based flow, potentially causing duplicate or overlapping tags.

Recommended approach:

Use a CTWA (Click-to-WhatsApp Ads) based flow for Meta Ads traffic

Path: Bot → Choose Flow → Configure → Select CTWA Ad-based

Assign a dedicated tag here (e.g., “Meta Ads”)

Use a message-based flow for Organic traffic

Assign a separate tag here (e.g., “Organic”)

We understand you'd prefer to align over a call as well. Please let us know a convenient time, and we’ll be happy to connect and help close this at the earliest.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Thu, 30 Apr 2026 07:47:36 +0400  "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>  wrote ---- 

Hi Sreenidhi, 

1. Reg Unable to filter conversations using tags, you can see from the below snapshot im updating the contact tag when the Meta lead from Tiggers the template message, but on the conversation tab when i use the filter i can't able to view the chat. but the tag has data i cross checked the contact menu too.

2. How to automatically assign tags to new incoming messages, as you can able to see have done thing as you mentioned.

But here i have doubt like, in our scenario we are trying to setup the tag based for the chat source (eg: organic or Meta ads)
from the first snapshot you can able to see a tag is updated when meta leads form triggers the template message and that message has quick reply, if user clicks the quick reply will it consider as new oragnic message and updating the tag twice, will it happen?

We dont want a overalp tag btw the tag updation, Im also awating for call so that we ensure that we align on the same line and we can solve this ticket as early as possible.

From: Gallabox Support <support@gallabox.com>
To: <jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Wed, 29 Apr 2026 18:46:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hello,

1. Unable to filter conversations using tags
 If you’ve already created tags but are unable to filter them at the conversation level, please follow these steps:
Go to the Conversation module from the left panel

Click on the Filter icon

Select the required Tags to apply the filter

2. How to automatically assign tags to new incoming messages
 You can automate tagging using a chatbot. Here’s how:
Navigate to Settings → Tags and create the required tags

Go to your chatbot flow and for any new incoming conversation:

Add the card Update conversation fields ->Select Field name  “Update Conversation Tags”

Select the relevant Tag name

This setup will automatically tag new conversations, allowing you to easily filter them later.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Wed, 29 Apr 2026 16:25:41 +0400  "Gallabox Support"<support@gallabox.com>  wrote ---- 

Hi Team,

Thank you for reaching out.

We have received your ticket. Kindly allow us some time and we will get back to you shortly with an update.

Best regards,Sangeetha,Gallabox Support.

---- on Wed, 29 Apr 2026 17:47:17 +0530  phifer India<jagannathan.j@growdigitally.consulting>  wrote ---- 

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

Best Regards, 
Jagan - PPC Executive

​Best Regards, 
Jagan - PPC Executive

---

**From:** Sreenidhi C  
**Time:** 2026-04-30T10:35:59.435Z

Hello,

Please join this meeting at 4:15 pm , 

https://meet.google.com/zwj-tkfv-gmd

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager
Gallabox

---- on Thu, 30 Apr 2026 10:50:32 +0400  "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>  wrote ---- 

Can we get on for quick virtual session, at your available time slot

From: Gallabox Support <support@gallabox.com>
To: "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Thu, 30 Apr 2026 11:13:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hi Sreenidhi,

Thank you for sharing the details.

1. Regarding filtering conversations using tags

The issue here is due to the type of tag being applied. Currently, you are updating a contact tag through the Facebook Leads integration. However, in the Conversations module, the filter works based on conversation tags, not contact tags.

To resolve this, we recommend updating a conversation tag instead within the Facebook Leads flow. This will ensure that the chats are visible when you apply filters in the Conversations tab.

Please note:

Contact tags → Used for filtering within the Contacts module

Conversation tags → Used for filtering within the Conversations module

2. Regarding automatic tag assignment & avoiding overlap

From your setup, we understand you are trying to differentiate chats based on the source (Organic vs Meta Ads).

Your concern about tag overlap is valid. Specifically, when a user clicks a quick reply from a template message triggered via Meta leads, it may be treated as a new incoming (organic) message in a message-based flow, potentially causing duplicate or overlapping tags.

Recommended approach:

Use a CTWA (Click-to-WhatsApp Ads) based flow for Meta Ads traffic

Path: Bot → Choose Flow → Configure → Select CTWA Ad-based

Assign a dedicated tag here (e.g., “Meta Ads”)

Use a message-based flow for Organic traffic

Assign a separate tag here (e.g., “Organic”)

We understand you'd prefer to align over a call as well. Please let us know a convenient time, and we’ll be happy to connect and help close this at the earliest.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Thu, 30 Apr 2026 07:47:36 +0400  "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>  wrote ---- 

Hi Sreenidhi, 

1. Reg Unable to filter conversations using tags, you can see from the below snapshot im updating the contact tag when the Meta lead from Tiggers the template message, but on the conversation tab when i use the filter i can't able to view the chat. but the tag has data i cross checked the contact menu too.

2. How to automatically assign tags to new incoming messages, as you can able to see have done thing as you mentioned.

But here i have doubt like, in our scenario we are trying to setup the tag based for the chat source (eg: organic or Meta ads)
from the first snapshot you can able to see a tag is updated when meta leads form triggers the template message and that message has quick reply, if user clicks the quick reply will it consider as new oragnic message and updating the tag twice, will it happen?

We dont want a overalp tag btw the tag updation, Im also awating for call so that we ensure that we align on the same line and we can solve this ticket as early as possible.

From: Gallabox Support <support@gallabox.com>
To: <jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Wed, 29 Apr 2026 18:46:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hello,

1. Unable to filter conversations using tags
 If you’ve already created tags but are unable to filter them at the conversation level, please follow these steps:
Go to the Conversation module from the left panel

Click on the Filter icon

Select the required Tags to apply the filter

2. How to automatically assign tags to new incoming messages
 You can automate tagging using a chatbot. Here’s how:
Navigate to Settings → Tags and create the required tags

Go to your chatbot flow and for any new incoming conversation:

Add the card Update conversation fields ->Select Field name  “Update Conversation Tags”

Select the relevant Tag name

This setup will automatically tag new conversations, allowing you to easily filter them later.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Wed, 29 Apr 2026 16:25:41 +0400  "Gallabox Support"<support@gallabox.com>  wrote ---- 

Hi Team,

Thank you for reaching out.

We have received your ticket. Kindly allow us some time and we will get back to you shortly with an update.

Best regards,Sangeetha,Gallabox Support.

---- on Wed, 29 Apr 2026 17:47:17 +0530  phifer India<jagannathan.j@growdigitally.consulting>  wrote ---- 

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

Best Regards, 
Jagan - PPC Executive

Best Regards, 
Jagan - PPC Executive

---

**From:** phifer India  
**Time:** 2026-04-30T10:48:55.000Z

Hi, i have now joined the meeting.

From: Gallabox Support <support@gallabox.com>
To: "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Thu, 30 Apr 2026 16:06:00 +0530
Subject: Re:[## 60382 ##] Tag updation

Hello,

Please join this meeting at 4:15 pm , 

https://meet.google.com/zwj-tkfv-gmd

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Thu, 30 Apr 2026 10:50:32 +0400  "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>  wrote ---- 

Can we get on for quick virtual session, at your available time slot

From: Gallabox Support <support@gallabox.com>
To: "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Thu, 30 Apr 2026 11:13:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hi Sreenidhi,

Thank you for sharing the details.

1. Regarding filtering conversations using tags

The issue here is due to the type of tag being applied. Currently, you are updating a contact tag through the Facebook Leads integration. However, in the Conversations module, the filter works based on conversation tags, not contact tags.

To resolve this, we recommend updating a conversation tag instead within the Facebook Leads flow. This will ensure that the chats are visible when you apply filters in the Conversations tab.

Please note:

Contact tags → Used for filtering within the Contacts module

Conversation tags → Used for filtering within the Conversations module

2. Regarding automatic tag assignment & avoiding overlap

From your setup, we understand you are trying to differentiate chats based on the source (Organic vs Meta Ads).

Your concern about tag overlap is valid. Specifically, when a user clicks a quick reply from a template message triggered via Meta leads, it may be treated as a new incoming (organic) message in a message-based flow, potentially causing duplicate or overlapping tags.

Recommended approach:

Use a CTWA (Click-to-WhatsApp Ads) based flow for Meta Ads traffic

Path: Bot → Choose Flow → Configure → Select CTWA Ad-based

Assign a dedicated tag here (e.g., “Meta Ads”)

Use a message-based flow for Organic traffic

Assign a separate tag here (e.g., “Organic”)

We understand you'd prefer to align over a call as well. Please let us know a convenient time, and we’ll be happy to connect and help close this at the earliest.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Thu, 30 Apr 2026 07:47:36 +0400  "Jagannathan Jayaraman"<jagannathan.j@growdigitally.consulting>  wrote ---- 

Hi Sreenidhi, 

1. Reg Unable to filter conversations using tags, you can see from the below snapshot im updating the contact tag when the Meta lead from Tiggers the template message, but on the conversation tab when i use the filter i can't able to view the chat. but the tag has data i cross checked the contact menu too.

2. How to automatically assign tags to new incoming messages, as you can able to see have done thing as you mentioned.

But here i have doubt like, in our scenario we are trying to setup the tag based for the chat source (eg: organic or Meta ads)
from the first snapshot you can able to see a tag is updated when meta leads form triggers the template message and that message has quick reply, if user clicks the quick reply will it consider as new oragnic message and updating the tag twice, will it happen?

We dont want a overalp tag btw the tag updation, Im also awating for call so that we ensure that we align on the same line and we can solve this ticket as early as possible.

From: Gallabox Support <support@gallabox.com>
To: <jagannathan.j@growdigitally.consulting>
Cc: <support@gallabox.com>
Date: Wed, 29 Apr 2026 18:46:38 +0530
Subject: Re:[## 60382 ##] Tag updation

Hello,

1. Unable to filter conversations using tags
 If you’ve already created tags but are unable to filter them at the conversation level, please follow these steps:
Go to the Conversation module from the left panel

Click on the Filter icon

Select the required Tags to apply the filter

2. How to automatically assign tags to new incoming messages
 You can automate tagging using a chatbot. Here’s how:
Navigate to Settings → Tags and create the required tags

Go to your chatbot flow and for any new incoming conversation:

Add the card Update conversation fields ->Select Field name  “Update Conversation Tags”

Select the relevant Tag name

This setup will automatically tag new conversations, allowing you to easily filter them later.

Thanks & Regards,

Sreenidhi Candagaddala

Customer Success Manager

Gallabox

---- on Wed, 29 Apr 2026 16:25:41 +0400  "Gallabox Support"<support@gallabox.com>  wrote ---- 

Hi Team,

Thank you for reaching out.

We have received your ticket. Kindly allow us some time and we will get back to you shortly with an update.

Best regards,Sangeetha,Gallabox Support.

---- on Wed, 29 Apr 2026 17:47:17 +0530  phifer India<jagannathan.j@growdigitally.consulting>  wrote ---- 

- i have created tag, but on the conversation level when i try to filter on tag, is not working

- how to set a tag for a any new incoming message

Best Regards, 
Jagan - PPC Executive

Best Regards, 
Jagan - PPC Executive

​Best Regards, 
Jagan - PPC Executive

## Images
No attachment images
