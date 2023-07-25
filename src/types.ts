interface SlackEvent { 
  client_msg_id: string;
  text: string;
  user: string;
  ts: string;
  team: string;
  channel: string;
}

interface SlackLinkShareEvent extends SlackEvent {
  type: 'link_shared';
  source: string;
  message_ts: string;
  links: Array<{ url: string }>;
}

interface SlackAppMentionEvent extends SlackEvent {
  type: 'app_mention';
  blocks: Array<{
    elements: Array<{
      elements: Array<{
        type: 'link',
        url: 'string';
      }>;
    }>;
  }>;
  event_ts: string;
}

export interface Env {
  SLACK_APP_ID: string;
  SLACK_BOT_TOKEN: string;
  SLACK_SIGNING_SECRET: string;
  SLACK_VERIFICATION_TOKEN: string;
  ARCHIVE_BOT_SLACK_ID: string;
}

export interface RequestJson {
  api_app_id: string;
  token: string;
  event: SlackLinkShareEvent | SlackAppMentionEvent;
}

export type SlackApi = (
  url: string,
  body: {
    body: string;
    contentType?: string;
    method?: string;
  },
  env: Env
) => Promise<Response>;
