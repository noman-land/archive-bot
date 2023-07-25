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
      event,
    }  = await request.json<RequestJson>();

    if (
      api_app_id !== env.SLACK_APP_ID ||
      token !== env.SLACK_VERIFICATION_TOKEN
    ) {
      return new Response(null, { status: 401 });
    }

    if (event.type === 'link_shared' && event.source === 'conversations_history') {
      const {
        channel,
        message_ts,
        links: [{ url }],
      } = event;
      return postSlackMessage(
        `https://archive.ph/submit/?url=${url}`,
        channel,
        message_ts,
        env
      );
    }

    if (event.type === 'app_mention') {
      const {
        channel,
        event_ts,
        blocks
      } = event;
      const urls = blocks
        .flatMap(({ elements }) => elements)
        .flatMap(({ elements }) => elements)
        .filter(({ type }) => type === 'link')
        .map(({ url }) => `https://archive.ph/submit/?url=${url}`)
        .join('\n')
      console.log(urls)
      return postSlackMessage(urls ,channel, event_ts, env);
    }

    return new Response(null, { status: 200 });
  },
};
