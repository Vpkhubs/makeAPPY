import { type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { modelId } = await request.json<{ modelId: string }>();
    
    // Here you could save to a database, session, or other storage
    // For now, we'll just return success since localStorage handles persistence
    
    return new Response(JSON.stringify({ success: true, modelId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save model preference' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
