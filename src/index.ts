import { postSlackMessage } from './api';
import { Env, RequestJson } from './types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 404 });
    }

    const {
      api_app_id,
      token,
      event: {
        channel,
        source,
        type,
        message_ts,
        links: [{ url }],
      },
    } = await request.json<RequestJson>();

    if (
      api_app_id !== env.SLACK_APP_ID ||
      token !== env.SLACK_VERIFICATION_TOKEN
    ) {
      return new Response(null, { status: 401 });
    }

    if (type === 'link_shared' && source === 'conversations_history') {
      return postSlackMessage(
        `https://archive.ph/submit/?url=${url}`,
        channel,
        message_ts,
        env
      );
    }

    return new Response(null, { status: 200 });
  },
};
