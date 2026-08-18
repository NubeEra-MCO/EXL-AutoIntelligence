# Copilot Studio Agent Design
# Policy Servicing Assistant

## Agent Overview
- **Name:** Policy Servicing Assistant
- **Platform:** Microsoft Copilot Studio
- **Integration:** Power Automate, Dataverse, Azure OpenAI
- **Channel:** Web Chat embedded in PCF component, Teams

## Knowledge Sources

### 1. Dataverse Knowledge (Grounded)
- psrd_knowledgearticle table (all published articles)
- psrd_requestcatalog table (request types, SLA, documents)
- psrd_servicerequest (customer's own requests only)
- psrd_policy (linked to authenticated customer)

### 2. Uploaded Documents
- Servicing SOP Manual (PDF)
- Product Feature Booklets (PDF per product)
- FAQ Document (PDF)
- Insurance Regulatory Guidelines (PDF)

### 3. RAG Configuration
- **Chunking:** 512 tokens with 50 token overlap
- **Embedding Model:** text-embedding-ada-002
- **Search:** Azure AI Search (hybrid - keyword + semantic)
- **Top K:** 3 most relevant chunks
- **Min Confidence:** 0.7

---

## Topics

### Topic 1: Request Status Inquiry
**Trigger phrases:**
- "What is the status of my request"
- "Track my request"
- "SR[0-9]+" (regex match)
- "Where is my [request type] request"
- "Update on my servicing request"

**Flow:**
1. Ask for Request Number if not provided
2. Call Action: GetRequestStatus(requestNumber)
3. IF found: Display status card with timeline
4. IF not found: Ask for policy number, search by policy
5. Offer: "Would you like to add a comment?" or "Raise a follow-up?"

---

### Topic 2: Address Change
**Trigger phrases:**
- "Change my address"
- "Update address"
- "I moved"
- "New address"
- "Address update"

**Flow:**
1. Ask for Policy Number
2. Call Action: GetPolicyDetails(policyNumber)
3. Display current address
4. Call Action: CheckEligibility(policyId, ADDR_CHG)
5. IF eligible: "I can help you initiate an address change. Required documents: Address Proof. Do you want to proceed?"
   - YES: Deep-link to Request Creation form OR collect data in bot
   - NO: End conversation
6. IF not eligible: Explain reason, offer alternatives

---

### Topic 3: Nominee Change
**Trigger phrases:**
- "Change nominee"
- "Update nominee"
- "Add nominee"
- "Remove nominee"
- "Nominee modification"

**Flow:**
1. Ask for Policy Number
2. Call Action: GetPolicyDetails(policyNumber)
3. Show current nominee details
4. Explain process: 2-level approval, 3-5 days SLA
5. List required documents
6. Call Action: CheckEligibility(policyId, NOM_CHG)
7. Guide to submission

---

### Topic 4: Premium Mode Change
**Trigger phrases:**
- "Change premium frequency"
- "Monthly to yearly"
- "Change payment mode"
- "Premium mode"
- "Pay annually"

**Flow:**
1. Ask for Policy Number
2. Display current premium mode and amount
3. Show available modes with premium amounts
4. Call Action: CheckEligibility(policyId, PREM_MODE_CHG)
5. IF eligible: Initiate request
6. IF not: Explain reason

---

### Topic 5: Policy Reinstatement
**Trigger phrases:**
- "Reinstate policy"
- "Revive lapsed policy"
- "Policy revival"
- "Reactivate policy"

**Flow:**
1. Ask for Policy Number
2. Call Action: GetPolicyDetails(policyNumber)
3. IF status != Lapsed: "Policy is not lapsed. Current status: [status]"
4. IF Lapsed: Show lapse date, arrears amount
5. Call Action: CheckEligibility(policyId, POLICY_REINSTATE)
6. Show required documents (health declaration, arrear receipt)
7. Explain process

---

### Topic 6: Document Requirements
**Trigger phrases:**
- "What documents do I need"
- "Documents required for [request type]"
- "What do I need to submit"
- "Required documents"

**Flow:**
1. Ask: "Which service are you requesting? [show list]"
2. On selection: Display document requirements from catalog
3. Provide download links for forms
4. Ask: "Ready to submit? Shall I start the request?"

---

### Topic 7: Eligibility Check
**Trigger phrases:**
- "Am I eligible"
- "Can I change [something]"
- "Is my policy eligible"

**Flow:**
1. Ask for Policy Number
2. Ask: "What type of change do you want to make? [show options]"
3. Call Action: CheckEligibility
4. Display results with explanation
5. IF eligible: Offer to initiate request
6. IF not: Explain each failed rule and resolution path

---

### Topic 8: General FAQ
**Trigger phrases:**
- (Catches all other questions)
- Uses generative AI with RAG

**Flow:**
1. Search knowledge base
2. IF high confidence answer: Display with citation
3. IF low confidence: "I'm not sure about that. Let me connect you with our servicing team."
4. Offer escalation to human agent

---

### Topic 9: Escalation Handling
**Trigger phrases:**
- "Talk to agent"
- "Human support"
- "Escalate"
- "Complaint"
- "Not satisfied"

**Flow:**
1. Empathize: "I understand your concern"
2. Capture details: Name, Policy Number, Issue
3. Create escalation record in Dataverse
4. Provide reference number
5. Expected callback: 2 business hours
6. Send confirmation email

---

### Topic 10: Complaint Registration
**Trigger phrases:**
- "Register complaint"
- "File complaint"
- "I want to complain"

**Flow:**
1. Capture complaint details
2. Create psrd_servicerequest with type = COMPLAINT
3. Provide complaint reference
4. Explain resolution process (IRDAI timelines)

---

## Agent Actions (Power Automate)

### Action 1: GetPolicyDetails
**Trigger:** HTTP request from Copilot Studio
```json
{
  "name": "GetPolicyDetails",
  "description": "Get policy details by policy number",
  "inputs": {
    "policyNumber": { "type": "string", "description": "Policy number" }
  },
  "outputs": {
    "policyFound": "boolean",
    "policyNumber": "string",
    "holderName": "string",
    "productName": "string",
    "status": "string",
    "sumAssured": "number",
    "nextPremiumDue": "string",
    "nomineeCount": "number",
    "openRequests": "number"
  }
}
```

### Action 2: CheckEligibility
```json
{
  "name": "CheckEligibility",
  "description": "Check if a policy is eligible for a specific request type",
  "inputs": {
    "policyNumber": { "type": "string" },
    "requestTypeCode": { "type": "string" }
  },
  "outputs": {
    "isEligible": "boolean",
    "failedRules": "array",
    "passedRules": "array",
    "message": "string"
  }
}
```

### Action 3: GetRequestStatus
```json
{
  "name": "GetRequestStatus",
  "description": "Get current status and timeline of a service request",
  "inputs": {
    "requestNumber": { "type": "string" }
  },
  "outputs": {
    "requestFound": "boolean",
    "requestNumber": "string",
    "requestType": "string",
    "status": "string",
    "submittedOn": "string",
    "slaDeadline": "string",
    "assignedTo": "string",
    "timelineSteps": "array",
    "nextAction": "string"
  }
}
```

### Action 4: CreateServiceRequest
```json
{
  "name": "CreateServiceRequest",
  "description": "Create a new service request",
  "inputs": {
    "policyNumber": { "type": "string" },
    "requestTypeCode": { "type": "string" },
    "requestData": { "type": "object" },
    "submittedBy": { "type": "string" }
  },
  "outputs": {
    "requestNumber": "string",
    "status": "string",
    "slaDeadline": "string",
    "requiresDocuments": "boolean",
    "requiredDocuments": "array"
  }
}
```

### Action 5: GetMyRequests
```json
{
  "name": "GetMyRequests",
  "description": "Get all servicing requests for the authenticated customer",
  "inputs": {
    "customerId": { "type": "string" },
    "statusFilter": { "type": "string", "optional": true }
  },
  "outputs": {
    "requests": "array",
    "totalCount": "number",
    "openCount": "number"
  }
}
```

---

## Generative AI Configuration
- **Model:** Azure OpenAI GPT-4o
- **System Prompt:**
  ```
  You are a Policy Servicing Assistant for an insurance company.
  Help customers understand their policies, track requests, and initiate servicing.
  Always be empathetic, professional, and concise.
  For sensitive actions (address change, nominee change, bank update), 
  always verify identity before proceeding.
  Cite knowledge base articles when answering policy questions.
  If unsure, escalate to human agent rather than guessing.
  Language: Use simple, clear language. Avoid insurance jargon.
  Fallback: If you cannot help, always offer to connect with a human agent.
  ```

---

## Authentication
- Single Sign-On via Microsoft Entra ID
- User identity passed to agent via token
- Policy lookup restricted to customer's own policies (row-level security enforced in Dataverse)

---

## Channels
1. **Canvas App:** Embedded via PCF component (direct line)
2. **Microsoft Teams:** Teams app deployment
3. **Web Chat Widget:** For external customer portal
