import { postSlackMessage } from './api';
import { Block, Env, RequestJson } from './types';

const getUrls = (blocks: Block[]) => blocks
  .flatMap(({ elements }) => elements)
  .flatMap(({ elements }) => elements)
  .filter(({ type }) => type === 'link')
  .map(({ url }) => `https://archive.ph/submit/?url=${url}`)
  .join('\n')

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 404 });
    }

    if (request.headers.get('Content-Type') === 'application/x-www-form-urlencoded') {
      const formData = await request.formData();
      const { payload } = Object.fromEntries(formData.entries());
      const {
        callback_id,
        type,
        token,
        message: { ts, blocks },
        channel
      } = JSON.parse(payload)

      if (
        token !== env.SLACK_VERIFICATION_TOKEN ||
        callback_id !== 'archive' ||
        type !== 'message_action'
      ) {
        console.log(JSON.parse(payload))
        return new Response(null, { status: 401 });
      }

      const urls = getUrls(blocks)
      return postSlackMessage(urls, channel.id, ts, env)
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
      const urls = getUrls(blocks)
      return postSlackMessage(urls ,channel, event_ts, env);
    }

    return new Response(null, { status: 200 });
  },
};
