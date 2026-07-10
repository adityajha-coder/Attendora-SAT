import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    webpush.setVapidDetails(
      'mailto:admin@attendora.com',
      'BAIyDUZbcQ2HMLsF1BiaieX56u89ch7YRO_j-kkf8tfDcVtSlAOybewq1qq4aen5WLr1QlccKr0jPxOjsqv2-O8',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    );

    const { data: users, error } = await supabaseClient
      .from('users')
      .select('id, name, schedule, push_subscription')
      .not('push_subscription', 'is', null);

    if (error) throw error;

    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const notificationsToSend = [];

    for (const user of users) {
      if (!user.schedule || !Array.isArray(user.schedule)) continue;

      for (const classItem of user.schedule) {
        if (classItem.day !== currentDay) continue;
        if (!classItem.time) continue;

        const [hours, minutes] = classItem.time.split(':').map(Number);
        
        const classTime = new Date(now);
        classTime.setHours(hours, minutes, 0, 0);
        
        const timeDiff = classTime.getTime() - now.getTime();
        const minsDiff = timeDiff / (1000 * 60);

        if (minsDiff > 0 && minsDiff <= 15) {
           notificationsToSend.push(
              webpush.sendNotification(user.push_subscription, JSON.stringify({
                 title: `Upcoming Class: ${classItem.name}`,
                 body: `Starts at ${classItem.time} in ${classItem.room || 'TBD'}.`,
                 url: '/'
              })).catch((err: Error) => console.error("Error sending push to user:", user.id, err))
           );
           break; 
        }
      }
    }

    await Promise.all(notificationsToSend);

    return new Response(JSON.stringify({ success: true, sent: notificationsToSend.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
