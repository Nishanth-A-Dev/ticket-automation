# Ticket Report

## Ticket ID
98595000042999746

## Subject
Feature Request – Support Base64 / Byte Attachments in Template API

## Description
Hi Team,
We have a requirement from a partner (CETAS) regarding attachment handling in the Template API.
They need the ability to send files (such as invoices and PDFs) using Base64 string or byte format instead of a public URL.
Context:

Files are stored in secure systems like SharePoint, OneDrive, or internal ERP

These files are user-specific and require authentication

Public URLs are not available in their setup

Files are retrieved via authenticated APIs and converted into Base64/byte format before sending

As discussed, their previous provider supported this approach, and this is a key requirement for their integration 
Request:

Enable support for Base64 or byte input for attachments in the Template API

Internally, we can handle conversion (e.g., generate a temporary URL before sending via WhatsApp)

I’ve also attached a sample JSON payload (shared by Reddington) that demonstrates how this is currently being handled.
This is important for enterprise use cases and is currently a blocker for their onboarding.

Regards
MuthuAravind 
Partner Team

## Full Conversation

**From:** muthuaravind.k  
**Time:** 2026-04-17T13:26:09.000Z

Hi Team,
We have a requirement from a partner (CETAS) regarding attachment handling in the Template API.
They need the ability to send files (such as invoices and PDFs) using Base64 string or byte format instead of a public URL.
Context:

Files are stored in secure systems like SharePoint, OneDrive, or internal ERP

These files are user-specific and require authentication

Public URLs are not available in their setup

Files are retrieved via authenticated APIs and converted into Base64/byte format before sending

As discussed, their previous provider supported this approach, and this is a key requirement for their integration 
Request:

Enable support for Base64 or byte input for attachments in the Template API

Internally, we can handle conversion (e.g., generate a temporary URL before sending via WhatsApp)

I’ve also attached a sample JSON payload (shared by Reddington) that demonstrates how this is currently being handled.
This is important for enterprise use cases and is currently a blocker for their onboarding.

Regards
MuthuAravind 
Partner Team

## Images
No attachment images
