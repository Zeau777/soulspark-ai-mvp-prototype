import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MailChimpContact {
  email_address: string;
  status: string;
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    COMPANY?: string;
    PHONE?: string;
    INTEREST?: string;
  };
  tags?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, firstName, lastName, company, phone, interest, demo } = body;

    console.log('Received lead submission:', { email, firstName, lastName, company, interest });

    const mailchimpApiKey = Deno.env.get('MAILCHIMP_API_KEY');
    if (!mailchimpApiKey) {
      throw new Error('MailChimp API key not configured');
    }

    // Extract datacenter from API key (last part after the dash)
    const datacenter = mailchimpApiKey.split('-')[1];
    if (!datacenter) {
      throw new Error('Invalid MailChimp API key format');
    }

    // Default list ID - you may want to make this configurable
    const listId = Deno.env.get('MAILCHIMP_LIST_ID') || '1234567890'; // Replace with your actual list ID

    const contact: MailChimpContact = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
        COMPANY: company,
        PHONE: phone,
        INTEREST: interest,
      },
      tags: [interest, demo === 'true' ? 'Demo-Requested' : 'Guide-Downloaded'].filter(Boolean),
    };

    const mailchimpUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members`;
    
    console.log('Sending to MailChimp:', mailchimpUrl);

    const response = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`anystring:${mailchimpApiKey}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('MailChimp error:', responseData);
      
      // Check if it's a duplicate email error (member already exists)
      if (responseData.title === 'Member Exists') {
        console.log('Member already exists, updating instead...');
        
        // Create MD5 hash of email for MailChimp member ID
        const encoder = new TextEncoder();
        const data = encoder.encode(email.toLowerCase());
        const hashBuffer = await crypto.subtle.digest('MD5', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const subscriberHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Try to update the existing member using PUT with correct member ID
        const updateUrl = `${mailchimpUrl}/${subscriberHash}`;
        const updateResponse = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${btoa(`anystring:${mailchimpApiKey}`)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: email,
            status_if_new: 'subscribed',
            merge_fields: contact.merge_fields,
            tags: contact.tags,
          }),
        });

        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);
        
        if (updateResponse.ok) {
          return new Response(JSON.stringify({ success: true, updated: true, data: updateData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else {
          console.log('Update failed, but continuing anyway - lead was captured');
          // Don't throw error here - just continue as if it worked
          return new Response(JSON.stringify({ success: true, updated: false, note: 'Member exists but update failed' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
      
      throw new Error(`MailChimp API error: ${responseData.detail || responseData.title || 'Unknown error'}`);
    }

    console.log('Successfully added to MailChimp:', responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in submit-mailchimp-lead function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);